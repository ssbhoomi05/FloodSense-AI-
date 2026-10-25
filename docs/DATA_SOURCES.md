# FloodSense AI 2.0 — Official Data Sources & Attribution

To maintain high public safety integrity, **FloodSense AI 2.0** strictly adheres to honest provenance, transparent source attribution, and clear differentiation between official administrative records and demonstration test cases.

---

## 1. Verified Official Sources Directory

| Organization | Role / Domain | Verified URL | Access Method | Last Verification Date |
|---|---|---|---|---|
| **India Meteorological Department (IMD) — Regional Meteorological Centre Chennai** | Official Cyclone & Heavy Rainfall Bulletins | [mausam.imd.gov.in/chennai](https://mausam.imd.gov.in/chennai/) | Official Public Bulletin Archive Ingestion | 2026-10-25 |
| **Greater Chennai Corporation (GCC) Disaster Management Cell** | City Municipal Control Room, Dewatering Pumps, Helpline | [chennaicorporation.gov.in](https://chennaicorporation.gov.in/) | Official Circular & Public Helpline Roster | 2026-10-24 |
| **Tamil Nadu State Disaster Management Authority (TNSDMA)** | State Emergency Operations Centre (1070) & Disaster Warnings | [tnsdma.tn.gov.in](https://tnsdma.tn.gov.in/) | Official Advisory Portal & Vulnerability Atlas | 2026-10-24 |
| **Chennai District Collectorate** | District Revenue Relief, 1077 Helpline, District Disaster Contingency | [chennai.nic.in](https://chennai.nic.in/disaster-management/) | District Collectorate Portal | 2026-10-24 |
| **Tamil Nadu Fire and Rescue Services (TNFRS)** | Water Inundation & Boat Evacuation Operations (101) | [tnfrs.tn.gov.in](https://www.tnfrs.tn.gov.in/) | State Emergency Services Roster | 2026-10-24 |
| **TANGEDCO (Tamil Nadu Generation & Distribution Corporation)** | Electrical Hazard & Fallen Powerline Reporting (94987 94987) | [tangedco.gov.in](https://www.tangedco.gov.in/) | Official Public Safety Circulars | 2026-10-24 |
| **Chennai Metro Water (CMWSSB)** | Storm Drainage & Sump Decontamination Helplines | [chennaimetrowater.tn.gov.in](https://chennaimetrowater.tn.gov.in/) | Departmental Helplines Directory | 2026-10-24 |
| **National Disaster Management Authority (NDMA)** | National Standard Flood Safety Protocols & Citizen Guidelines | [ndma.gov.in](https://ndma.gov.in/) | Authoritative Safety Protocol Standards | 2026-10-24 |

---

## 2. API Availability & Integrity Statement

### Public Live API Verification:
- **IMD & GCC API Policy:** Neither IMD RMC Chennai nor Greater Chennai Corporation provides an open, unauthenticated, real-time public REST API for live rainfall streaming or shelter occupancy.
- **FloodSense Integrity Guarantee:** The application **never invents** simulated weather conditions as live feeds.
- **Operating Modes:**
  1. **Verified Bulletin Mode:** Official notifications are curated with exact issue timestamps, issuing authority name, and direct source links.
  2. **Demonstration Mode:** Synthetic test scenarios (such as stress-testing high-volume flood alerts) are explicitly tagged in high-contrast purple with the notice:
     `DEMO DATA — NOT A VERIFIED FLOOD WARNING / LOCATION`.

---

## 3. Relief Facilities vs. General Night Shelters

An essential safety distinction is enforced:
> [!IMPORTANT]
> **General homeless night shelters are NOT flood evacuation centres.**
> In a severe storm, ground-floor or low-lying night shelters may themselves become waterlogged. Only Greater Chennai Corporation **designated flood relief centres** (such as elevated multi-purpose community halls with emergency generators and relief staging kitchens) are listed.
> Users are instructed to confirm active operational activation with the GCC Helpline at **1913** before evacuating.

---

## 4. Preliminary Risk Assessment Assumptions & Limitations

The experimental ward vulnerability calculator (`/api/risk-zones`) is documented with complete transparency:
- **Inputs Utilized:**
  1. Greater Chennai Corporation Comprehensive Stormwater Drainage Master Plan historical flood maps (2015, 2021, and 2023 Cyclone Michaung inundation levels).
  2. Mean Sea Level (MSL) elevation depressions (e.g. Velachery marsh margin at `< 4m MSL` vs. Alandur ridge at `> 10m MSL`).
  3. Primary drainage basin bottlenecks (e.g. Okkiyam Madavu bottleneck, Buckingham Canal tidal lock risk).
  4. User-selected rainfall scenario multipliers (Normal, Moderate, Heavy, Very Heavy).
- **Explicit Limitation:**
  This score is a **heuristic indicator for situational preparedness only**. It does not constitute a physical hydraulic simulation or official government forecast.
