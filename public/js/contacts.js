/**
 * FloodSense AI 2.0 — Emergency Contacts Module (Feature E)
 * Verified directory of Chennai emergency helplines with click-to-call,
 * source links, and verified timestamps.
 */

const ContactsModule = {
  contacts: [],

  init() {
    this.bindEvents();
    this.fetchContacts();
  },

  bindEvents() {
    const searchInput = document.getElementById('contacts-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterContacts(e.target.value.toLowerCase());
      });
    }
  },

  async fetchContacts() {
    const container = document.getElementById('contacts-list-container');
    if (container) {
      container.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      `;
    }

    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const json = await res.json();
        this.contacts = json.data || [];
        this.renderContacts(this.contacts);
        this.renderDashboardSnippet();
      } else {
        this.renderErrorState(`Server returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Could not fetch /api/contacts:', err);
      this.renderErrorState(err.message);
    }
  },

  renderErrorState(msg) {
    const container = document.getElementById('contacts-list-container');
    if (container) {
      container.innerHTML = `
        <div class="error-state-card" style="grid-column: 1 / -1;">
          <h3>⚠️ Unable to Load Emergency Contacts</h3>
          <p>${msg || 'Could not connect to directory.'}</p>
          <button class="retry-btn" onclick="ContactsModule.fetchContacts()">🔄 Retry Loading</button>
        </div>
      `;
    }
  },

  filterContacts(query) {
    if (!query) {
      this.renderContacts(this.contacts);
      return;
    }

    const filtered = this.contacts.filter(c => 
      c.department.toLowerCase().includes(query) ||
      c.short_name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );

    this.renderContacts(filtered);
  },

  renderContacts(list) {
    const container = document.getElementById('contacts-list-container');
    if (!container) return;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No matching emergency departments found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(c => `
      <div class="contact-card">
        <div>
          <div class="contact-header">
            <div>
              <span class="badge badge-official" style="margin-bottom: 6px;">${c.verification_status}</span>
              <h3 class="contact-dept">${c.department}</h3>
              <span class="contact-cat">${c.category} • ${c.operational_hours}</span>
            </div>
          </div>
          <p class="contact-desc" style="margin-top: 8px;">${c.description}</p>
        </div>

        <div>
          <div class="contact-call-action">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Direct Line</div>
              <div class="contact-phone-number">${c.display_phone}</div>
            </div>
            <a href="tel:${c.phone}" class="call-btn" title="Call ${c.short_name}">
              <svg style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2.5;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Call Now</span>
            </a>
          </div>

          <div class="contact-footer-meta" style="margin-top: 10px;">
            <span>Verified: ${c.last_verified_date}</span>
            <a href="${c.source_url}" target="_blank" rel="noopener noreferrer">Official Source Link &rarr;</a>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderDashboardSnippet() {
    const container = document.getElementById('dashboard-contacts-snippet');
    if (!container) return;

    const priorityContacts = this.contacts.slice(0, 3);
    container.innerHTML = priorityContacts.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <div>
          <strong style="font-size: 0.9rem; color: #fff; display: block;">${c.short_name}</strong>
          <span style="font-size: 0.74rem; color: var(--text-muted);">${c.category}</span>
        </div>
        <a href="tel:${c.phone}" class="quick-dial-btn" style="padding: 4px 10px; font-size: 0.78rem;">
          📞 ${c.phone}
        </a>
      </div>
    `).join('') + `
      <div style="margin-top: 10px; text-align: right;">
        <a href="#contacts" data-target-view="contacts" style="font-size: 0.8rem; font-weight: 600;">View Full Directory &rarr;</a>
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

window.ContactsModule = ContactsModule;
