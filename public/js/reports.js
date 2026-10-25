/**
 * FloodSense AI 2.0 — Community Flood Reporting Module (Feature D)
 * Handles client-side validation, geolocation, submission to SQLite backend,
 * and optimistic UI updates for crowd-sourced flood observations.
 */

const ReportsModule = {
  reportsList: [],

  init() {
    this.bindEvents();
    this.fetchReports();
  },

  bindEvents() {
    const form = document.getElementById('flood-report-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    }

    const geoBtn = document.getElementById('btn-get-current-gps');
    if (geoBtn) {
      geoBtn.addEventListener('click', () => {
        this.fetchCurrentGPS();
      });
    }
  },

  fetchCurrentGPS() {
    const latInput = document.getElementById('report-lat');
    const lngInput = document.getElementById('report-lng');
    const statusText = document.getElementById('gps-status-text');

    if (!navigator.geolocation) {
      if (statusText) statusText.textContent = 'Geolocation is not supported by your browser.';
      return;
    }

    if (statusText) statusText.textContent = 'Acquiring GPS coordinates...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (latInput) latInput.value = lat.toFixed(5);
        if (lngInput) lngInput.value = lng.toFixed(5);
        if (statusText) {
          statusText.textContent = `📍 Coordinates captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          statusText.style.color = '#38bdf8';
        }
      },
      (err) => {
        if (statusText) {
          statusText.textContent = `GPS unavailable (${err.message}). You can pick on map or leave blank.`;
          statusText.style.color = '#f59e0b';
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },

  async fetchReports() {
    const container = document.getElementById('recent-reports-container');
    if (container && (!this.reportsList || this.reportsList.length === 0)) {
      container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      `;
    }

    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        this.reportsList = data.reports || [];
        this.renderReportsList();
        this.renderDashboardSnippet();
      } else {
        this.renderErrorState(`Server returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Could not load reports list:', err);
      this.renderErrorState(err.message);
    }
  },

  renderErrorState(msg) {
    const container = document.getElementById('recent-reports-container');
    if (container) {
      container.innerHTML = `
        <div class="error-state-card">
          <h3>⚠️ Unable to Load Community Reports</h3>
          <p>${msg || 'Failed to retrieve reports from database.'}</p>
          <button class="retry-btn" onclick="ReportsModule.fetchReports()">🔄 Retry Stream</button>
        </div>
      `;
    }
  },

  async handleSubmit(form) {
    const feedbackEl = document.getElementById('report-feedback-msg');
    const submitBtn = document.getElementById('btn-submit-report');

    const locationName = document.getElementById('report-location').value.trim();
    const category = document.getElementById('report-category').value;
    const waterDepth = document.getElementById('report-depth').value;
    const description = document.getElementById('report-description').value.trim();
    const latVal = document.getElementById('report-lat').value.trim();
    const lngVal = document.getElementById('report-lng').value.trim();
    const reporterName = document.getElementById('report-name').value.trim() || 'Citizen Contributor';

    // Client-side validation
    const errors = [];
    if (locationName.length < 3) {
      errors.push('Location name must be at least 3 characters.');
    }
    if (description.length < 5) {
      errors.push('Please provide a brief description of at least 5 characters.');
    }

    let lat = null;
    let lng = null;
    if (latVal !== '') {
      lat = parseFloat(latVal);
      if (isNaN(lat) || lat < 12.5 || lat > 13.5) {
        errors.push('Latitude must be within the greater Chennai region (12.5 to 13.5).');
      }
    }

    if (lngVal !== '') {
      lng = parseFloat(lngVal);
      if (isNaN(lng) || lng < 79.8 || lng > 80.5) {
        errors.push('Longitude must be within the greater Chennai region (79.8 to 80.5).');
      }
    }

    if (errors.length > 0) {
      if (feedbackEl) {
        feedbackEl.className = 'notice-box danger';
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = `<strong>Submission Error:</strong><br>${errors.join('<br>')}`;
      }
      return;
    }

    const payload = {
      location_name: locationName,
      category,
      water_depth_estimate: waterDepth,
      description,
      latitude: lat,
      longitude: lng,
      reporter_name: reporterName
    };

    if (submitBtn) submitBtn.disabled = true;
    if (feedbackEl) {
      feedbackEl.className = 'notice-box';
      feedbackEl.style.display = 'block';
      feedbackEl.innerHTML = 'Submitting report to emergency database...';
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.status === 201) {
        form.reset();
        if (feedbackEl) {
          feedbackEl.className = 'notice-box warning';
          feedbackEl.innerHTML = `
            <strong>✅ Report Submitted Successfully!</strong><br>
            Reference ID: <code>${result.report.id}</code><br>
            <em>Status: <strong>Unverified</strong>. Your report is recorded in the community stream and marked on the map. It does not replace official emergency services.</em>
          `;
        }

        // Refresh reports and map
        await this.fetchReports();
        if (window.MapModule) {
          await MapModule.loadData();
        }
      } else {
        if (feedbackEl) {
          feedbackEl.className = 'notice-box danger';
          feedbackEl.innerHTML = `<strong>Error:</strong> ${result.message || 'Submission failed.'}`;
        }
      }
    } catch (err) {
      if (feedbackEl) {
        feedbackEl.className = 'notice-box danger';
        feedbackEl.innerHTML = `<strong>Network Error:</strong> Unable to connect to backend server. Please verify internet access.`;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  renderReportsList() {
    const container = document.getElementById('recent-reports-container');
    if (!container) return;

    if (!this.reportsList || this.reportsList.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No flood reports currently logged.</p></div>`;
      return;
    }

    container.innerHTML = this.reportsList.map(rpt => {
      const isDemo = Boolean(rpt.is_demo);
      const badgeStyle = isDemo ? 'badge-demo' : 'badge-unverified';
      const badgeText = isDemo ? 'DEMO DATA — NOT A VERIFIED LOCATION' : 'Community Report (Unverified)';

      return `
        <div class="card" style="margin-bottom: 12px; border-left: 4px solid ${isDemo ? '#ec4899' : '#f59e0b'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span class="badge ${badgeStyle}">${badgeText}</span>
            <span style="font-size: 0.74rem; color: var(--text-muted);">${new Date(rpt.reported_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
          </div>
          <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 4px;">${rpt.location_name}</h4>
          <p style="font-size: 0.86rem; color: #e2e8f0; margin-bottom: 6px;">${rpt.description}</p>
          <div style="font-size: 0.78rem; color: var(--text-dim); display: flex; flex-wrap: wrap; gap: 12px;">
            <span><strong>Depth:</strong> ${rpt.water_depth_estimate || 'Not specified'}</span>
            <span><strong>Category:</strong> ${rpt.category}</span>
            ${rpt.latitude && rpt.longitude ? `<span><strong>Coords:</strong> ${rpt.latitude.toFixed(4)}, ${rpt.longitude.toFixed(4)}</span>` : ''}
          </div>
          ${isDemo ? `<div style="font-size: 0.72rem; color: #f472b6; margin-top: 6px;">${rpt.demo_disclaimer || 'DEMO DATA FOR PRESENTATION ONLY'}</div>` : ''}
        </div>
      `;
    }).join('');
  },

  renderDashboardSnippet() {
    const container = document.getElementById('dashboard-reports-snippet');
    if (!container) return;

    if (!this.reportsList || this.reportsList.length === 0) {
      container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No reports logged yet.</p>`;
      return;
    }

    const recent = this.reportsList.slice(0, 3);
    container.innerHTML = recent.map(r => `
      <div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <strong style="font-size: 0.88rem; color: #fff;">${r.location_name}</strong>
          <span class="badge ${r.is_demo ? 'badge-demo' : 'badge-unverified'}" style="font-size: 0.65rem;">${r.is_demo ? 'DEMO' : 'UNVERIFIED'}</span>
        </div>
        <p style="font-size: 0.78rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.description}</p>
      </div>
    `).join('') + `
      <div style="margin-top: 8px; text-align: right;">
        <a href="#map-view" data-target-view="map-view" style="font-size: 0.8rem; font-weight: 600;">View On Map &rarr;</a>
      </div>
    `;

    container.querySelectorAll('[data-target-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigateTo(btn.getAttribute('data-target-view'));
      });
    });
  }
};

window.ReportsModule = ReportsModule;
