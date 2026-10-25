# FloodSense AI 2.0 — Flood Emergency Companion

> **A resilient, mobile-first emergency web companion for Chennai, Tamil Nadu.**  
> Delivering verified meteorological advisories, crowd-sourced flood observations, designated relief shelter directories, and an offline-first disaster safety guide.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Target Region](https://img.shields.io/badge/Region-Chennai%2C%20Tamil%20Nadu-red.svg)](#)
[![PWA Ready](https://img.shields.io/badge/PWA-Service%20Worker%20Offline-success.svg)](#)
[![Automated Tests](https://img.shields.io/badge/Tests-31%2F31%20Passing-brightgreen.svg)](#)

---

## 1. Project Overview & Philosophy

During the Northeast Monsoon and severe cyclonic storms in Chennai (such as Cyclones Michaung, Vardah, or the 2015 floods), low-lying basins across Velachery, Madipakkam, Mudichur, Perumbakkam, and Kolathur face rapid waterlogging. Citizens frequently encounter two critical vulnerabilities:
1. **Misinformation & Panic:** Unverified rumors spread across social media without official attribution.
2. **Connectivity Loss:** Mobile phone data towers and power grids go dark during catastrophic flooding, disabling web access.

**FloodSense AI 2.0** was engineered with three uncompromising core principles:
- **Zero Hallucination / Honest Transparency:** We never invent live conditions. Official bulletins, community unverified observations, and demonstration records are strictly separated with prominent visual badges.
- **Safety First:** The application **never** claims a location is "guaranteed safe" or that flood predictions are guaranteed.
- **Offline Resilience:** The complete disaster safety manual, critical checklists, and emergency directory remain fully functional offline using a Service Worker and browser local storage.

---

## 2. Implemented Features Matrix

| Feature | Description | Implementation Details |
|---|---|---|
| **Feature A: Home Dashboard** | Mobile-first emergency command centre with active counters and shortcuts | Live status badge, quick-dial GCC 1913, 6 feature cards, summary feeds |
| **Feature B: Alert Centre** | Verified weather warnings from IMD RMC Chennai, GCC, and WRD | Issue & verification timestamps, severity levels, official source links, demo flag |
| **Feature C: Flood Map** | Interactive spatial view of Chennai flood reports on OpenStreetMap | Leaflet.js, color-coded custom pins (Unverified, Demo, Shelter), map pin-picker |
| **Feature D: Community Reports** | Eyewitness report submission with depth, category, and GPS/map pin | Client/server validation, SQLite persistence, default status `"Unverified"` |
| **Feature E: Emergency Contacts** | Official telephone directory with 1-click calling (`tel:`) | Verified numbers: GCC 1913, TNSDMA 1070, Police 100, Ambulance 108, TANGEDCO 94987 94987 |
| **Feature F: Offline Safety Guide** | NDMA & TNSDMA emergency protocols accessible with zero internet | Service Worker cache, interactive 8-item go-bag checklist with `localStorage` |
| **Feature G: Relief Shelters** | Designated GCC flood relief community welfare centres | Explicit distinction: *general night shelters are not flood evacuation centres* |
| **Feature H: Risk Assessment** | Transparent ward vulnerability calculator (v2.0-Alpha) | Rule-based formula: Historical (40%) + Elevation (30%) + Drainage (30%) * Rain multiplier |

---

## 3. Technology Stack & Dual-Runtime Architecture

- **Frontend:** Vanilla HTML5, CSS3 (Accessible WCAG AA high-contrast emergency theme), Vanilla Modular JavaScript.
- **Mapping:** Leaflet.js with OpenStreetMap tiles and offline table fallback.
- **PWA & Offline:** Progressive Web App with Service Worker (`public/sw.js`) and CacheStorage.
- **Database:** SQLite (`data/reports.db`) automatically initialized and seeded.
- **Dual-Runtime Backend:**
  - **Runtime 1 (Primary / Zero-Dependency):** Node.js 24 using native `node:http` and `node:sqlite`. Runs out of the box with **zero** `npm install` packages.
  - **Runtime 2 (Python Alternative):** Python 3 Flask server (`app.py` + `requirements.txt`) serving identical REST endpoints and SQLite database for Python teammates.

---

## 4. Project Directory Structure

```
FloodSense AI 2.0/
├── data/
│   ├── official_alerts.json         # Verified IMD, GCC, and WRD bulletins + demo scenarios
│   ├── demo_reports.json            # Clearly labelled demonstration flood locations
│   ├── emergency_contacts.json      # Verified Chennai emergency services directory
│   ├── relief_shelters.json         # Designated GCC flood relief centres with caveats
│   ├── chennai_risk_zones.json      # Ward vulnerability data, elevation traits, and basins
│   └── reports.db                   # SQLite database for persistent citizen reports
├── public/
│   ├── index.html                   # Mobile-first responsive web application
│   ├── sw.js                        # Service worker for offline shell & safety caching
│   ├── manifest.json                # PWA manifest
│   ├── css/
│   │   └── styles.css               # Emergency high-contrast design system
│   └── js/
│       ├── app.js                   # Application state, view routing, network monitoring
│       ├── map.js                   # Leaflet map manager, legend, layer filters, pin picker
│       ├── alerts.js                # Official alerts view & source disclaimer handler
│       ├── reports.js               # Report submission form, validation, and SQLite sync
│       ├── contacts.js              # Click-to-call emergency directory with search
│       ├── guide.js                 # NDMA/TNSDMA offline guide with persistent checklist
│       ├── shelters.js              # Relief centre directory with facility classifications
│       └── risk.js                  # Transparent risk calculator with formula breakdown
├── server.js                        # Zero-dependency Node.js HTTP server & REST API
├── app.py                           # Python Flask backend alternative
├── requirements.txt                 # Python dependencies (Flask 3.0.3)
├── package.json                     # Node.js project manifest
├── tests/
│   └── test_server.js               # Automated test suite (31 assertions)
├── docs/
│   ├── API_DOCUMENTATION.md         # Full REST API schema and endpoint specs
│   ├── DATA_SOURCES.md              # Verified official sources and limitations
│   ├── TEAM_RESPONSIBILITIES.md     # 4-member parallel assignment breakdown
│   ├── DEMO_SCRIPT.md               # 3-5 minute hackathon presentation script
│   └── TESTING_CHECKLIST.md         # Feature verification checklist & test results
└── README.md                        # Master project documentation
```

---

## 5. Quickstart & Execution Instructions

### Option A: Run with Node.js (Zero external dependencies)
Node.js 24 provides built-in HTTP and SQLite support. No `npm install` needed!

1. Open PowerShell or Terminal in the project root:
   ```powershell
   cd "c:\Users\Bhoomika\Desktop\FloodSense AI 2.0"
   ```
2. Start the application:
   ```powershell
   node server.js
   ```
3. Open your browser:
   ```
   http://127.0.0.1:3000
   ```

### Option B: Run with Python Flask (Alternative)
For teammates working in Python:

1. Install requirements:
   ```powershell
   pip install -r requirements.txt
   ```
2. Start the Flask server:
   ```powershell
   python app.py
   ```
3. Open your browser:
   ```
   http://127.0.0.1:3000
   ```

---

## 6. Running the Automated Test Suite

A comprehensive automated test suite is included in `tests/test_server.js` verifying all 18 endpoints, app shell files, SQLite operations, and validation rules:

```powershell
node tests/test_server.js
```

**Result:**
```
========================================
TEST RESULTS: 31 / 31 passed.
========================================
```

---

## 7. 4-Member Team Ownership

To support parallel hackathon workflows without merge conflicts, tasks and files are cleanly partitioned:
- **Member 1 (Project Lead & Research):** `docs/DATA_SOURCES.md`, `data/official_alerts.json`, `data/emergency_contacts.json`, `docs/DEMO_SCRIPT.md`.
- **Member 2 (Data & Risk Assessment):** `data/chennai_risk_zones.json`, `data/relief_shelters.json`, `public/js/risk.js`, `public/js/shelters.js`.
- **Member 3 (Frontend & UI/UX):** `public/index.html`, `public/css/styles.css`, `public/js/app.js`, `public/js/guide.js`, `public/sw.js`.
- **Member 4 (Backend & Integration):** `server.js`, `app.py`, `public/js/map.js`, `public/js/reports.js`, `tests/test_server.js`.

See [docs/TEAM_RESPONSIBILITIES.md](docs/TEAM_RESPONSIBILITIES.md) for full details.

---

## 8. Known Limitations & Future Roadmap

- **Government API Limitations:** Neither IMD RMC Chennai nor Greater Chennai Corporation currently provides an open, real-time public REST API. Automated ingestion from public HTML bulletins via authenticated departmental gateways is planned as a future expansion.
- **Crowd Report Moderation:** All citizen-submitted flood reports are currently saved with `"Unverified"` status. A future release can introduce administrative reviewer dashboards and community upvoting / verification flags.
- **Hydraulic Sensor Integration:** The preliminary risk model uses published drainage master plan indices. Future versions can incorporate real-time ultrasonic water level sensors installed along the Adyar, Cooum, and Kosasthalaiyar river bridges.

---

## 9. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
