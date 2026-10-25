/**
 * FloodSense AI 2.0 — Alert Centre Module (Feature B)
 * Handles official meteorological and administrative flood bulletins,
 * with transparent source attribution and distinction from demonstration data.
 */

const AlertsModule = {
  alerts: [],

  init() {
    this.fetchAlerts();
  },

  async fetchAlerts() {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const json = await res.json();
        this.alerts = json.data || [];
        this.renderAlerts();
        this.renderDashboardSnippet();
      }
    } catch (err) {
      console.warn('Could not fetch /api/alerts:', err.message);
      this.renderErrorState();
    }
  },

  renderAlerts() {
    const container = document.getElementById('alerts-list-container');
    if (!container) return;

    if (!this.alerts || this.alerts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <h3>No Active Flood Warnings</h3>
          <p>No active bulletins recorded. Official notifications are refreshed during monsoon operations.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.alerts.map(alert => {
      const isDemo = alert.is_demo;
      const severityClass = isDemo ? 'demo' : (alert.severity && alert.severity.toLowerCase().includes('orange') ? 'orange' : '');
      const badgeClass = isDemo ? 'badge-demo' : 'badge-official';
      const badgeText = isDemo ? 'DEMO DATA — NOT A VERIFIED WARNING' : (alert.severity || 'Official Advisory');

      const instructionsHtml = alert.instructions && alert.instructions.length > 0
        ? `<div style="margin-top: 10px;">
             <strong style="font-size: 0.82rem; color: #f8fafc;">Key Advisory Actions:</strong>
             <ul class="alert-instructions-list">
               ${alert.instructions.map(inst => `<li>${inst}</li>`).join('')}
             </ul>
           </div>`
        : '';

      return `
        <article class="alert-card ${severityClass}">
          <div class="alert-header">
            <div>
              <span class="badge ${badgeClass}" style="margin-bottom: 6px;">${badgeText}</span>
              <h3 class="alert-title">${alert.title}</h3>
            </div>
          </div>

          <div class="alert-meta">
            <span><strong>Source:</strong> ${alert.source_organization}</span>
            <span><strong>Issued:</strong> ${new Date(alert.issue_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            <span><strong>Last Verified:</strong> ${new Date(alert.last_verified_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
          </div>

          <p style="font-size: 0.92rem; color: #f1f5f9; margin-bottom: 8px;"><strong>${alert.headline}</strong></p>
          <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">${alert.advisory_text}</p>

          ${instructionsHtml}

          <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.78rem;">
            <span style="color: var(--text-dim); font-style: italic;">${alert.disclaimer || 'Verified official bulletin record.'}</span>
            ${alert.source_url && !alert.source_url.startsWith('#')
              ? `<a href="${alert.source_url}" target="_blank" rel="noopener noreferrer" style="font-weight: 600;">View Official Source &rarr;</a>`
              : `<span style="color: #ec4899; font-weight: 600;">Synthetic Test Entry</span>`}
          </div>
        </article>
      `;
    }).join('');
  },

  renderDashboardSnippet() {
    const container = document.getElementById('dashboard-alerts-snippet');
    if (!container) return;

    const officialAlerts = this.alerts.filter(a => !a.is_demo);
    const topAlert = officialAlerts.length > 0 ? officialAlerts[0] : this.alerts[0];

    if (!topAlert) {
      container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No active flood warnings posted.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="background: rgba(14, 165, 233, 0.08); border-left: 3px solid var(--accent-blue); padding: 12px; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span class="badge ${topAlert.is_demo ? 'badge-demo' : 'badge-official'}">${topAlert.is_demo ? 'DEMO' : (topAlert.severity || 'OFFICIAL')}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${new Date(topAlert.issue_time).toLocaleDateString('en-IN')}</span>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px;">${topAlert.title}</h4>
        <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;">${topAlert.headline}</p>
        <div style="margin-top: 8px; text-align: right;">
          <a href="#alerts" data-target-view="alerts" style="font-size: 0.8rem; font-weight: 600;">Read All Bulletins &rarr;</a>
        </div>
      </div>
    `;

    // Rebind inner link
    container.querySelectorAll('[data-target-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigateTo(btn.getAttribute('data-target-view'));
      });
    });
  },

  renderErrorState() {
    const container = document.getElementById('alerts-list-container');
    if (container) {
      container.innerHTML = `
        <div class="notice-box warning">
          <strong>Notice:</strong> Unable to load live alerts from server. Cached or default bulletins may be displayed when available.
        </div>
      `;
    }
  }
};

window.AlertsModule = AlertsModule;
