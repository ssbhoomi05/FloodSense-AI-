/**
 * FloodSense AI 2.0 — Preliminary Flood Risk Assessment Module (Feature H)
 * Transparent, heuristic risk calculator based on published municipal drainage plans
 * and historical waterlogging data for Chennai Corporation zones.
 * 
 * STRICT DISCLAIMER: EXPERIMENTAL HEURISTIC INDICATOR ONLY.
 * NOT AN OFFICIAL IMD / CWC FORECAST.
 */

const RiskModule = {
  zonesData: null,
  selectedZone: null,
  selectedMultiplier: 1.0,

  init() {
    this.bindEvents();
    this.fetchRiskData();
  },

  async fetchRiskData() {
    try {
      const res = await fetch('/api/risk-zones');
      if (res.ok) {
        this.zonesData = await res.json();
        this.populateZoneSelector();
        this.calculateAndDisplay();
      }
    } catch (err) {
      console.warn('Could not load risk zones data:', err);
    }
  },

  bindEvents() {
    const zoneSelect = document.getElementById('risk-zone-select');
    if (zoneSelect) {
      zoneSelect.addEventListener('change', (e) => {
        const zoneId = parseInt(e.target.value, 10);
        if (this.zonesData && this.zonesData.zones) {
          this.selectedZone = this.zonesData.zones.find(z => z.zone_id === zoneId);
        }
        this.calculateAndDisplay();
      });
    }

    const rainSelect = document.getElementById('risk-rain-select');
    if (rainSelect) {
      rainSelect.addEventListener('change', (e) => {
        this.selectedMultiplier = parseFloat(e.target.value) || 1.0;
        this.calculateAndDisplay();
      });
    }
  },

  populateZoneSelector() {
    const zoneSelect = document.getElementById('risk-zone-select');
    if (!zoneSelect || !this.zonesData || !this.zonesData.zones) return;

    zoneSelect.innerHTML = this.zonesData.zones.map(z => 
      `<option value="${z.zone_id}">Zone ${z.zone_id} — ${z.zone_name} (${z.basin})</option>`
    ).join('');

    this.selectedZone = this.zonesData.zones[0];
  },

  calculateAndDisplay() {
    if (!this.selectedZone) return;

    // Calculation: Base Vulnerability scaled by Rainfall Multiplier
    const rawScore = this.selectedZone.base_vulnerability_score * this.selectedMultiplier;
    const finalScore = Math.min(100, Math.round(rawScore));

    // Determine risk level category and color
    let level = 'Low Risk';
    let color = '#10b981';
    let bgTint = 'rgba(16, 185, 129, 0.15)';

    if (finalScore >= 80) {
      level = 'Critical Waterlogging Risk';
      color = '#ef4444';
      bgTint = 'rgba(239, 68, 68, 0.2)';
    } else if (finalScore >= 60) {
      level = 'High Waterlogging Risk';
      color = '#f97316';
      bgTint = 'rgba(249, 115, 22, 0.2)';
    } else if (finalScore >= 40) {
      level = 'Moderate Risk';
      color = '#f59e0b';
      bgTint = 'rgba(245, 158, 11, 0.2)';
    }

    // Update UI elements
    const scoreEl = document.getElementById('risk-score-value');
    const badgeEl = document.getElementById('risk-badge');
    const meterFill = document.getElementById('risk-meter-fill');
    const zoneNameEl = document.getElementById('risk-zone-name');
    const basinEl = document.getElementById('risk-basin-info');
    const elevEl = document.getElementById('risk-elevation-info');
    const outletEl = document.getElementById('risk-outlet-info');
    const spotsEl = document.getElementById('risk-chronic-spots');
    const actionEl = document.getElementById('risk-action-rec');

    if (scoreEl) {
      scoreEl.textContent = `${finalScore}/100`;
      scoreEl.style.color = color;
    }

    if (badgeEl) {
      badgeEl.textContent = level;
      badgeEl.style.backgroundColor = bgTint;
      badgeEl.style.color = color;
      badgeEl.style.border = `1px solid ${color}`;
    }

    if (meterFill) {
      meterFill.style.width = `${finalScore}%`;
      meterFill.style.backgroundColor = color;
    }

    if (zoneNameEl) zoneNameEl.textContent = `Zone ${this.selectedZone.zone_id} (${this.selectedZone.zone_name})`;
    if (basinEl) basinEl.textContent = this.selectedZone.basin;
    if (elevEl) elevEl.textContent = this.selectedZone.elevation_trait;
    if (outletEl) outletEl.textContent = this.selectedZone.drainage_outlet;
    if (spotsEl) spotsEl.textContent = this.selectedZone.key_chronic_spots.join(', ');
    if (actionEl) actionEl.textContent = this.selectedZone.recommended_action;
  }
};

window.RiskModule = RiskModule;
