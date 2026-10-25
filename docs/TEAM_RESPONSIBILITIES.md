# FloodSense AI 2.0 — 4-Member Team Ownership & Parallel Workflow

This document defines the clear modular division of labor for the four hackathon team members, ensuring that tasks proceed in parallel without merge conflicts or overlapping file edits.

---

## Team Overview & File Ownership Matrix

```
+-----------------------------------------------------------------------------------+
| MEMBER 1: Project Lead & Research                                                 |
| Owned Files:                                                                      |
| - docs/DATA_SOURCES.md                                                            |
| - docs/DEMO_SCRIPT.md                                                             |
| - data/official_alerts.json                                                       |
| - data/emergency_contacts.json                                                    |
| Responsibilities: Official authority verification, compliance, demo walkthrough   |
+-----------------------------------------------------------------------------------+
| MEMBER 2: Data & Risk Assessment                                                  |
| Owned Files:                                                                      |
| - data/chennai_risk_zones.json                                                    |
| - data/relief_shelters.json                                                       |
| - public/js/risk.js                                                               |
| - public/js/shelters.js                                                           |
| Responsibilities: Basin vulnerability heuristic, shelter vetting, formula checks   |
+-----------------------------------------------------------------------------------+
| MEMBER 3: Frontend & UI/UX                                                        |
| Owned Files:                                                                      |
| - public/index.html                                                               |
| - public/css/styles.css                                                           |
| - public/js/app.js                                                                |
| - public/js/guide.js                                                              |
| - public/sw.js                                                                    |
| Responsibilities: Mobile-first responsive UI, PWA caching, offline checklist       |
+-----------------------------------------------------------------------------------+
| MEMBER 4: Backend & Integration                                                   |
| Owned Files:                                                                      |
| - server.js                                                                       |
| - app.py                                                                          |
| - requirements.txt                                                                |
| - public/js/map.js                                                                |
| - public/js/reports.js                                                            |
| - tests/test_server.js                                                            |
| - docs/API_DOCUMENTATION.md                                                       |
| Responsibilities: SQLite schema, REST endpoints, Leaflet mapping, test suite      |
+-----------------------------------------------------------------------------------+
```

---

## Detailed Member Roles & Responsibilities

### Member 1 — Project Lead & Research
- **Official Data Verification:** Checks official numbers for Greater Chennai Corporation (1913), TNSDMA (1070), District Collectorate (1077), TANGEDCO (94987 94987), Police (100), and Ambulance (108).
- **Attribution & Transparency:** Ensures all bulletins in `data/official_alerts.json` have verified timestamps and public URLs.
- **Demo Script:** Formulates the 3–5 minute presentation script (`docs/DEMO_SCRIPT.md`) and oversees quality rules (no fake safe routes, no fake AI predictions).

### Member 2 — Data & Risk Assessment
- **Basin & Vulnerability Modeling:** Synthesizes Chennai Corporation drainage master plan data into `data/chennai_risk_zones.json`.
- **Transparent Formula Implementation:** Implements `public/js/risk.js` computing composite vulnerability (Historical 40% + Elevation 30% + Drainage Bottleneck 30% * Rain Multiplier).
- **Shelter Directory Curation:** Validates designated municipal community centres in `data/relief_shelters.json`, enforcing the rule that general homeless shelters are not flood evacuation centres.

### Member 3 — Frontend & UI/UX
- **Emergency Design System:** Authors `public/css/styles.css` using high-contrast dark palette, accessible typography, and distinct badge styles (Official Blue, Unverified Amber, Demo Magenta).
- **Home Dashboard & Navigation:** Builds mobile bottom navigation bar and desktop header tabs with real-time route switching.
- **Offline Safety Guide (Feature F):** Implements NDMA/TNSDMA guidance in `public/js/guide.js`, interactive checklist with `localStorage` persistence, and PWA Service Worker caching in `public/sw.js`.

### Member 4 — Backend & Integration
- **Dual-Runtime Backend:** Builds the zero-dependency Node.js 24 server (`server.js`) with native `node:sqlite` and the Python Flask alternative (`app.py`).
- **Data Persistence:** Designs the SQLite database schema (`data/reports.db`) and seeds initial demonstration markers.
- **Leaflet Map Integration:** Implements `public/js/map.js` with custom color-coded markers, layer filtering, and interactive coordinate picking.
- **Validation & Automated Testing:** Implements server-side validation and the automated test suite in `tests/test_server.js`.
