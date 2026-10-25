/**
 * FloodSense AI 2.0 — Flood Map Module (Feature C)
 * Interactive Chennai Map powered by Leaflet & OpenStreetMap.
 */

// Helper to prevent XSS in map popups
const escapeMapHTML = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const MapModule = {
  map: null,
  markersLayer: null,
  activeFilter: 'all',
  reports: [],
  shelters: [],
  pickerMode: false,
  pickerMarker: null,

  init() {
    // Lazy Initialization: Do not call initMap() here to avoid grey tiles
    this.bindEvents();
    this.loadData();
  },

  ensureInitialized() {
    if (!this.map) {
      this.initMap();
    }
  },

  initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet library not detected. Showing offline fallback.');
      this.renderFallback();
      return;
    }

    try {
      this.map = L.map('map', {
        center: [13.0600, 80.2200],
        zoom: 11,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);

      this.map.on('click', (e) => {
        if (this.pickerMode) {
          this.handleMapPick(e.latlng.lat, e.latlng.lng);
        }
      });
    } catch (err) {
      console.error('Error initializing Leaflet:', err);
      this.renderFallback();
    }
  },

  bindEvents() {
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-filter') || 'all';
        this.renderMarkers();
      });
    });

    const pickBtn = document.getElementById('btn-pick-location');
    if (pickBtn) {
      pickBtn.addEventListener('click', () => {
        this.activatePickerMode();
      });
    }
  },

  activatePickerMode() {
    this.pickerMode = true;
    App.navigateTo('map-view');
    const toast = document.getElementById('map-toast-message');
    if (toast) {
      toast.style.display = 'block';
      toast.textContent = '📍 Click anywhere on the Chennai map to pin your report location.';
    }
  },

  handleMapPick(lat, lng) {
    this.ensureInitialized();
    if (this.pickerMarker) {
      this.map.removeLayer(this.pickerMarker);
    }

    this.pickerMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-pin-picker',
        html: `<div style="background:#ef4444; width:18px; height:18px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 10px #ef4444;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(this.map);

    this.pickerMarker.bindPopup('<b>Selected Location</b><br>Lat: ' + lat.toFixed(4) + ', Lng: ' + lng.toFixed(4)).openPopup();

    const latInput = document.getElementById('report-lat');
    const lngInput = document.getElementById('report-lng');
    if (latInput) latInput.value = lat.toFixed(5);
    if (lngInput) lngInput.value = lng.toFixed(5);

    this.pickerMode = false;
    const toast = document.getElementById('map-toast-message');
    if (toast) {
      toast.textContent = `✅ Location pinned (${lat.toFixed(4)}, ${lng.toFixed(4)}). Returning to report form...`;
      setTimeout(() => {
        toast.style.display = 'none';
        App.navigateTo('report');
      }, 1200);
    }
  },

  async loadData() {
    try {
      const [reportsRes, sheltersRes] = await Promise.allSettled([
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/shelters').then(r => r.json())
      ]);

      if (reportsRes.status === 'fulfilled' && reportsRes.value.reports) {
        this.reports = reportsRes.value.reports;
      }
      if (sheltersRes.status === 'fulfilled' && sheltersRes.value.data) {
        this.shelters = sheltersRes.value.data;
      }

      this.renderMarkers();
    } catch (err) {
      console.warn('Error loading map data:', err);
    }
  },

  renderMarkers() {
    this.ensureInitialized();
    if (!this.markersLayer || !this.map) return;
    this.markersLayer.clearLayers();

    let renderedCount = 0;

    this.reports.forEach(rpt => {
      if (!rpt.latitude || !rpt.longitude) return;

      const isDemo = Boolean(rpt.is_demo);
      if (this.activeFilter === 'demo' && !isDemo) return;
      if (this.activeFilter === 'community' && isDemo) return;
      if (this.activeFilter === 'shelters') return;

      const markerColor = isDemo ? '#ec4899' : '#f59e0b';
      const markerTypeLabel = isDemo ? 'DEMO DATA — NOT A VERIFIED LOCATION' : 'Community Report (Unverified)';
      const badgeStyle = isDemo ? 'badge-demo' : 'badge-unverified';

      const iconHtml = `<div style="background-color: ${markerColor}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 8px rgba(0,0,0,0.6);"></div>`;

      const markerIcon = L.divIcon({
        className: 'flood-marker',
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const popupContent = `
        <div class="popup-card">
          <div class="popup-header">
            <span class="badge ${badgeStyle}">${markerTypeLabel}</span>
            <h4 class="popup-title">${escapeMapHTML(rpt.location_name)}</h4>
          </div>
          <div class="popup-body">
            <p><strong>Condition:</strong> ${escapeMapHTML(rpt.description)}</p>
            <p style="margin-top: 4px;"><strong>Water Depth:</strong> ${escapeMapHTML(rpt.water_depth_estimate || 'Not specified')}</p>
            <p style="margin-top: 2px;"><strong>Category:</strong> ${escapeMapHTML(rpt.category)}</p>
          </div>
          <div class="popup-meta">
            <span><strong>Status:</strong> ${escapeMapHTML(rpt.status)}</span>
            <span><strong>Reported:</strong> ${new Date(rpt.reported_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            ${isDemo ? `<span style="color:#f472b6; font-size:0.72rem; margin-top:4px;">⚠️ DEMO DATA FOR PRESENTATION PURPOSES ONLY.</span>` : ''}
          </div>
        </div>
      `;

      const marker = L.marker([rpt.latitude, rpt.longitude], { icon: markerIcon });
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
      renderedCount++;
    });

    if (this.activeFilter === 'all' || this.activeFilter === 'shelters') {
      this.shelters.forEach(shl => {
        if (!shl.latitude || !shl.longitude) return;

        const shelterIcon = L.divIcon({
          className: 'shelter-marker',
          html: `<div style="background-color:#10b981; width:20px; height:20px; border-radius:50%; border:3px solid #ffffff; box-shadow: 0 0 10px #10b981; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px; font-weight:bold;">S</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const popupContent = `
          <div class="popup-card">
            <div class="popup-header">
              <span class="badge badge-shelter">Designated Relief Centre</span>
              <h4 class="popup-title">${escapeMapHTML(shl.name)}</h4>
            </div>
            <div class="popup-body">
              <p><strong>Address:</strong> ${escapeMapHTML(shl.address)}</p>
              <p style="margin-top: 4px;"><strong>Zone:</strong> ${escapeMapHTML(shl.zone)}</p>
              <p style="margin-top: 2px;"><strong>Est. Capacity:</strong> ${escapeMapHTML(shl.capacity_estimate)}</p>
            </div>
            <div class="popup-meta">
              <span><strong>Operational Status:</strong> ${escapeMapHTML(shl.operational_status)}</span>
              <span style="color:#a7f3d0; margin-top:4px;">Notice: Activated during Orange/Red alerts. Confirm with GCC 1913.</span>
            </div>
          </div>
        `;

        const marker = L.marker([shl.latitude, shl.longitude], { icon: shelterIcon });
        marker.bindPopup(popupContent);
        this.markersLayer.addLayer(marker);
        renderedCount++;
      });
    }

    const countEl = document.getElementById('map-marker-count');
    if (countEl) {
      countEl.textContent = `${renderedCount} Markers Active`;
    }
  },

  invalidateSize() {
    this.ensureInitialized();
    if (this.map) {
      this.map.invalidateSize();
    }
  },

  renderFallback() {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🗺️</div>
          <h3 style="color: #fff; margin-bottom: 6px;">Map View Offline Fallback</h3>
          <p style="font-size: 0.88rem; max-width: 500px; margin: 0 auto 16px;">Leaflet tiles unavailable. Displaying coordinates below.</p>
          <div style="text-align: left; max-width: 600px; margin: 0 auto; background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #1e3b5b;">
            <p><strong>Velachery Main Rd:</strong> 12.9815° N, 80.2180° E [Demo Data]</p>
            <p><strong>Madipakkam Ram Nagar:</strong> 12.9623° N, 80.2014° E [Demo Data]</p>
            <p><strong>Kolathur Retteri:</strong> 13.1258° N, 80.2069° E [Demo Data]</p>
            <p><strong>Mudichur ORR:</strong> 12.9157° N, 80.0754° E [Demo Data]</p>
          </div>
        </div>
      `;
    }
  }
};

window.MapModule = MapModule;
