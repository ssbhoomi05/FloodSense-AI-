/**
 * FloodSense AI 2.0 — Relief & Shelter Directory Module (Feature G)
 * Authoritative GCC flood relief centre roster with facility classification disclaimers.
 */

const SheltersModule = {
  shelters: [],

  init() {
    this.fetchShelters();
  },

  async fetchShelters() {
    const container = document.getElementById('shelters-list-container');
    if (container) {
      container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      `;
    }

    try {
      const res = await fetch('/api/shelters');
      if (res.ok) {
        const json = await res.json();
        this.shelters = json.data || [];
        this.renderShelters();
      } else {
        this.renderFallback();
      }
    } catch (err) {
      console.warn('Could not fetch /api/shelters:', err);
      this.renderFallback();
    }
  },

  renderShelters() {
    const container = document.getElementById('shelters-list-container');
    if (!container) return;

    if (!this.shelters || this.shelters.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Verified flood evacuation shelter information currently unavailable.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.shelters.map(s => `
      <div class="card" style="margin-bottom: 16px; border-left: 4px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span class="badge badge-shelter">${s.facility_type}</span>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 4px;">${s.name}</h3>
            <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">${s.zone}</span>
          </div>
          <span style="font-size: 0.72rem; color: #a7f3d0; background: rgba(16,185,129,0.15); padding: 3px 8px; border-radius: 4px; font-weight: 600;">
            ${s.operational_status}
          </span>
        </div>

        <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 8px;">
          <strong>Address:</strong> ${s.address}
        </p>

        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px; font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px;">
          <p style="color: #fef08a; font-weight: 500; margin-bottom: 4px;"><strong>Administrative Classification:</strong></p>
          ${s.classification_note}
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">
          <strong>Available Amenities:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
            ${s.amenities.map(a => `<span style="background: var(--bg-tertiary); padding: 2px 8px; border-radius: 12px; font-size: 0.74rem;">✓ ${a}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; font-size: 0.75rem; color: var(--text-dim);">
          <span>Capacity: ~${s.capacity_estimate} • Verified: ${s.last_verified_date}</span>
          <a href="tel:${s.helpline_to_confirm}" class="quick-dial-btn" style="padding: 4px 10px; font-size: 0.76rem;">
            Confirm with GCC (${s.helpline_to_confirm})
          </a>
        </div>
      </div>
    `).join('');
  },

  renderFallback() {
    const container = document.getElementById('shelters-list-container');
    if (container) {
      container.innerHTML = `
        <div class="notice-box warning">
          <strong>Notice:</strong> Verified live flood shelter information currently unavailable. In an active emergency, contact Greater Chennai Corporation Control Room at <strong>1913</strong> or State Disaster Control at <strong>1070</strong>.
        </div>
      `;
    }
  }
};

window.SheltersModule = SheltersModule;
