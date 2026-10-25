/**
 * FloodSense AI 2.0 — Flood Emergency Companion
 * Main Application Controller & View Router
 */

const App = {
  currentView: 'dashboard',
  systemStatus: null,
  isOnline: navigator.onLine,

  init() {
    this.registerServiceWorker();
    this.bindEvents();
    this.setupNetworkMonitor();
    this.fetchSystemStatus();
    this.handleRoute();

    // Initialize modules
    if (window.AlertsModule) AlertsModule.init();
    if (window.ContactsModule) ContactsModule.init();
    if (window.GuideModule) GuideModule.init();
    if (window.SheltersModule) SheltersModule.init();
    if (window.RiskModule) RiskModule.init();
    if (window.ReportsModule) ReportsModule.init();
    if (window.MapModule) MapModule.init();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('[ServiceWorker] Registered with scope:', reg.scope))
          .catch((err) => console.warn('[ServiceWorker] Registration failed:', err));
      });
    }
  },

  setupNetworkMonitor() {
    const updateBanner = () => {
      this.isOnline = navigator.onLine;
      const banner = document.getElementById('system-status-banner');
      const bannerText = document.getElementById('system-status-text');
      const badge = document.getElementById('system-status-badge');

      if (!this.isOnline) {
        banner.className = 'system-banner offline';
        bannerText.textContent = 'OFFLINE MODE — Network disconnected. Safety Guide & Cached Emergency Contacts remain functional.';
        badge.textContent = 'Offline';
      } else {
        banner.className = 'system-banner';
        bannerText.textContent = 'DEMO & VERIFIED ARCHIVE MODE — Automated live feeds unavailable. Displaying verified official advisories and test records.';
        badge.textContent = 'Verified / Demo';
      }
    };

    window.addEventListener('online', updateBanner);
    window.addEventListener('offline', updateBanner);
    updateBanner();
  },

  bindEvents() {
    // Navigation buttons
    document.querySelectorAll('[data-target-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.getAttribute('data-target-view');
        this.navigateTo(view);
      });
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const validViews = ['dashboard', 'alerts', 'map-view', 'report', 'contacts', 'guide', 'shelters', 'risk'];
    if (validViews.includes(hash)) {
      this.navigateTo(hash, false);
    } else {
      this.navigateTo('dashboard', false);
    }
  },

  navigateTo(viewId, updateHash = true) {
    this.currentView = viewId;
    if (updateHash) {
      window.location.hash = viewId;
    }

    // Toggle active section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const targetSec = document.getElementById(viewId);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Toggle nav buttons
    document.querySelectorAll('.nav-btn, .mobile-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-target-view') === viewId) {
        btn.classList.add('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Invalidate map size if map view opened
    if (viewId === 'map-view' && window.MapModule) {
      setTimeout(() => MapModule.invalidateSize(), 150);
    }
  },

  async fetchSystemStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        this.systemStatus = await res.json();
        this.updateDashboardStats(this.systemStatus);
      }
    } catch (err) {
      console.warn('Could not retrieve live /api/status, using cached fallback');
    }
  },

  updateDashboardStats(status) {
    if (!status || !status.counts) return;

    const elAlerts = document.getElementById('stat-alerts-count');
    const elReports = document.getElementById('stat-reports-count');
    const elContacts = document.getElementById('stat-contacts-count');
    const elShelters = document.getElementById('stat-shelters-count');

    if (elAlerts) elAlerts.textContent = (status.counts.official_alerts || 0) + (status.counts.demo_alerts || 0);
    if (elReports) elReports.textContent = status.counts.total_reports || 0;
    if (elContacts) elContacts.textContent = status.counts.emergency_contacts || 0;
    if (elShelters) elShelters.textContent = status.counts.relief_shelters || 0;
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
