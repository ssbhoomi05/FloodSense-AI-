/**
 * FloodSense AI 2.0 — Offline Flood Safety Guide Module (Feature F)
 * Authoritative NDMA / TNSDMA emergency protocols.
 * Includes interactive checklist persisted in browser localStorage.
 */

const GuideModule = {
  activeTab: 'checklist',

  init() {
    this.bindEvents();
    this.loadChecklistState();
  },

  bindEvents() {
    // Guide tab buttons
    document.querySelectorAll('.guide-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.guide-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.guide-content-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-guide-tab');
        const panel = document.getElementById(`guide-panel-${targetTab}`);
        if (panel) panel.classList.add('active');
      });
    });

    // Checklist checkboxes
    document.querySelectorAll('.guide-checklist-item input[type="checkbox"]').forEach(box => {
      box.addEventListener('change', (e) => {
        const item = e.target.closest('.guide-checklist-item');
        if (e.target.checked) {
          item.classList.add('checked');
        } else {
          item.classList.remove('checked');
        }
        this.saveChecklistState();
      });
    });

    // Reset checklist button
    const resetBtn = document.getElementById('btn-reset-checklist');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset your preparedness checklist?')) {
          localStorage.removeItem('floodsense_checklist');
          document.querySelectorAll('.guide-checklist-item input[type="checkbox"]').forEach(b => {
            b.checked = false;
            b.closest('.guide-checklist-item').classList.remove('checked');
          });
          this.updateChecklistProgress();
        }
      });
    }
  },

  saveChecklistState() {
    const state = {};
    document.querySelectorAll('.guide-checklist-item input[type="checkbox"]').forEach(box => {
      const id = box.getAttribute('data-check-id');
      if (id) {
        state[id] = box.checked;
      }
    });
    localStorage.setItem('floodsense_checklist', JSON.stringify(state));
    this.updateChecklistProgress();
  },

  loadChecklistState() {
    try {
      const saved = localStorage.getItem('floodsense_checklist');
      if (saved) {
        const state = JSON.parse(saved);
        document.querySelectorAll('.guide-checklist-item input[type="checkbox"]').forEach(box => {
          const id = box.getAttribute('data-check-id');
          if (id && state[id]) {
            box.checked = true;
            box.closest('.guide-checklist-item').classList.add('checked');
          }
        });
      }
    } catch (e) {
      console.warn('Checklist state parse error:', e);
    }
    this.updateChecklistProgress();
  },

  updateChecklistProgress() {
    const total = document.querySelectorAll('.guide-checklist-item input[type="checkbox"]').length;
    const checked = document.querySelectorAll('.guide-checklist-item input[type="checkbox"]:checked').length;
    const progressEl = document.getElementById('checklist-progress-text');
    const barEl = document.getElementById('checklist-progress-fill');

    if (progressEl) {
      progressEl.textContent = `${checked} of ${total} Ready (${Math.round((checked / (total || 1)) * 100)}%)`;
    }
    if (barEl) {
      barEl.style.width = `${Math.round((checked / (total || 1)) * 100)}%`;
    }
  }
};

window.GuideModule = GuideModule;
