# FloodSense AI 2.0 — 3–5 Minute Hackathon Presentation Script

This script is structured for a 4-person team presentation to judges, demonstrating every core objective while highlighting the project's engineering maturity, public safety honesty, and offline resilience.

---

## Presentation Breakdown (Total Time: ~4 Minutes)

### Minute 0:00 – 0:45: The Problem & Vision (Speaker: Member 1 — Project Lead)
- **Opening:** *"Good morning judges. In Chennai, the Northeast Monsoon brings severe localized waterlogging across basins like Velachery, Madipakkam, and Kolathur. When heavy rains hit, citizens face two dangerous extremes: either panic induced by social media rumors, or complete blindness when mobile data networks drop."*
- **Introduction:** *"We built **FloodSense AI 2.0 — Flood Emergency Companion**. Our design philosophy is grounded in one strict rule: **Public safety over hype**. We never promise fake AI predictions, we never claim a flooded road is guaranteed safe, and we clearly separate official bulletins from unverified citizen observations."*
- **Action:** Open application on browser (`http://127.0.0.1:3000`). Point out the **Top Banner**: *"Notice our persistent transparency banner: We clearly state we are in Verified Archive & Demo Mode because government agencies do not provide public live streaming APIs."*

---

### Minute 0:45 – 1:45: Dashboard & Alert Integrity (Speaker: Member 3 — Frontend & UI)
- **Walkthrough:**
  - *"Our mobile-first dashboard gives citizens immediate situational awareness for Chennai."*
  - *"At the top right, a prominent 1-click button dials GCC 1913 directly."*
  - Click on **Alert Centre** tab:
    - *"Here are verified weather advisories from IMD RMC Chennai and Greater Chennai Corporation."*
    - *"Notice how official bulletins display the exact issuing authority, verified timestamp, and direct links to the official government source."*
    - *"Scroll down to our synthetic test entry: Notice how it is unmistakably flagged with a high-contrast badge: **DEMO DATA — NOT A VERIFIED WARNING**."*

---

### Minute 1:45 – 2:45: Interactive Map & Community Reporting (Speaker: Member 4 — Backend & Integration)
- **Map Interaction:**
  - Click on **Flood Map** tab:
    - *"Our interactive Chennai map is powered by Leaflet and OpenStreetMap."*
    - *"We can filter layers: Unverified Community Reports in amber, Demo locations in magenta, and GCC designated relief centers in green."*
  - **Live Submission Demonstration:**
    - Switch to **Report Flood** tab.
    - Click **"🗺️ Pick on Map"**: The map opens, click on Kotturpuram or Adyar.
    - The coordinates are populated back into the form.
    - Enter location: *"Adyar Gate Service Road"*, Depth: *"Knee Deep (1.5 ft)"*, Description: *"Street waterlogging blocking cars."*
    - Click **Submit Community Report**.
    - Point out the instant response: *"The report is inserted into our SQLite database and immediately classified as **'Unverified'**. It appears on the map and recent reports stream. We never describe a citizen observation as an official government order."*

---

### Minute 2:45 – 3:30: Offline Safety Guide & Relief Shelters (Speaker: Member 3 & Member 2)
- **Offline Demonstration:**
  - Switch to **Offline Guide** tab.
  - *"When mobile towers drown or power fails, internet access vanishes. FloodSense AI 2.0 is a Progressive Web App powered by a Service Worker."*
  - *"The entire NDMA & TNSDMA safety guide works 100% offline."*
  - Check off items on the **Interactive Monsoon Readiness Checklist**: *"Drinking water supply, waterproof document bags, emergency whistle... progress updates in real time and persists in local storage."*
  - Switch to **Relief Centres** tab:
    - *"We also maintain designated GCC community welfare halls. Notice our crucial distinction: General night shelters are not flood evacuation centres. We provide exact verification notes and a confirmation dialer."*

---

### Minute 3:30 – 4:00: Transparent Risk Assessment & Wrap Up (Speaker: Member 2 & Member 1)
- **Experimental Risk Tool:**
  - Switch to **Risk Calculator** tab:
    - *"Rather than claiming a 'magic black-box AI', our preliminary risk assessment is completely transparent."*
    - Select Zone 13 (Velachery) and 'Heavy Rain'.
    - *"The model evaluates historical waterlogging frequency (40%), elevation depression below 5m MSL (30%), and drainage basin bottlenecks (30%) published by Greater Chennai Corporation."*
    - *"It outputs a transparent situational indicator alongside actionable local precautions, prominently labeled as an **EXPERIMENTAL INDICATOR — NOT AN OFFICIAL FORECAST**."*
- **Conclusion:**
  - *"FloodSense AI 2.0 is lightweight, zero-dependency, runs across Node.js and Python, and is ready to save lives. Thank you!"*
