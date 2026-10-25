# FloodSense AI 2.0 — REST API & Data Schema Documentation

This document describes the complete REST API specification, JSON schemas, validation rules, and error handling for the **FloodSense AI 2.0 — Flood Emergency Companion** server.

The API is served identically by both the native Node.js backend (`server.js`) and the Python Flask backend (`app.py`) on port `3000`.

---

## Base URL
```
http://127.0.0.1:3000/api
```

---

## 1. System Status
### `GET /api/status`
Returns real-time operating metrics, active operating mode, target region, database statistics, and transparent disclaimers.

#### Response Headers
`Content-Type: application/json; charset=UTF-8`

#### Example Response (200 OK)
```json
{
  "application": "FloodSense AI 2.0 — Flood Emergency Companion",
  "version": "2.0.0",
  "target_area": "Chennai, Tamil Nadu",
  "operating_mode": "Demonstration & Verified Reference Mode",
  "live_api_status": "Automated live feed unavailable; displaying verified archived bulletins and community submissions.",
  "last_system_check": "2026-10-25T04:30:27.242Z",
  "counts": {
    "official_alerts": 3,
    "demo_alerts": 1,
    "emergency_contacts": 9,
    "relief_shelters": 5,
    "total_reports": 6,
    "user_submitted_reports": 1,
    "demo_reports": 5
  },
  "disclaimers": {
    "safety_guarantee": "FloodSense AI 2.0 does NOT guarantee safety at any location. Follow official district orders.",
    "prediction_disclaimer": "Risk indicators are transparent heuristic approximations and not official IMD/CWC forecasts."
  }
}
```

---

## 2. Official Weather & Flood Alerts
### `GET /api/alerts`
Retrieves verified weather warnings and advisories from the India Meteorological Department (IMD) RMC Chennai, Greater Chennai Corporation (GCC), and Water Resources Department (WRD), alongside clearly labelled demonstration scenarios.

#### Example Response (200 OK)
```json
{
  "source": "Tamil Nadu Disaster Management & IMD Official Bulletins",
  "retrieved_at": "2026-10-25T04:30:27.242Z",
  "data": [
    {
      "id": "ALT-2026-IMD-001",
      "title": "IMD Heavy to Very Heavy Rainfall Advisory",
      "source_organization": "India Meteorological Department (IMD) - RMC Chennai",
      "source_url": "https://mausam.imd.gov.in/chennai/",
      "source_type": "Official Bulletin",
      "is_demo": false,
      "severity": "Orange Alert",
      "issue_time": "2026-10-25T06:00:00+05:30",
      "last_verified_at": "2026-10-25T08:30:00+05:30",
      "verification_method": "IMD Regional Daily Weather Forecast Bulletin",
      "headline": "Isolated heavy to very heavy rainfall expected over Chennai, Tiruvallur, Kanchipuram, and Chengalpattu districts.",
      "advisory_text": "Squally weather with wind speeds reaching 40-50 kmph gusting to 60 kmph is likely along and off Tamil Nadu coast...",
      "instructions": [
        "Avoid unnecessary travel to known low-lying waterlogged arterial roads.",
        "Keep electronic devices and mobile phones fully charged.",
        "Store sufficient drinking water and non-perishable food supplies."
      ],
      "disclaimer": "Official bulletin archive. If live weather changes rapidly, tune in to All India Radio or official TNSDMA updates."
    }
  ]
}
```

---

## 3. Emergency Contacts Directory
### `GET /api/contacts`
Returns official, verified emergency service telephone numbers with click-to-call links, operational hours, and source citations.

#### Example Response (200 OK)
```json
{
  "source": "Chennai District Administration & Greater Chennai Corporation Verified Roster",
  "retrieved_at": "2026-10-25T04:30:27.242Z",
  "data": [
    {
      "id": "EMG-GCC-1913",
      "department": "Greater Chennai Corporation (GCC) Central Helpline",
      "short_name": "GCC Control Room",
      "phone": "1913",
      "display_phone": "1913 (Toll Free)",
      "alternate_phones": ["044-25619206", "044-25619207"],
      "category": "Disaster Management & Waterlogging",
      "is_toll_free": true,
      "operational_hours": "24 hours / 7 days",
      "description": "Primary helpline for city-wide waterlogging complaints, boat rescue coordination, fallen tree removal, and GCC shelter inquiries.",
      "source_url": "https://chennaicorporation.gov.in/gcc/helpline/",
      "last_verified_date": "2026-10-24",
      "verification_status": "Verified Official"
    }
  ]
}
```

---

## 4. Relief & Shelter Facilities
### `GET /api/shelters`
Returns officially designated Greater Chennai Corporation (GCC) flood relief community welfare centres with facility notes distinguishing them from general night shelters.

#### Example Response (200 OK)
```json
{
  "source": "Greater Chennai Corporation Monsoon Preparedness Contingency Roster",
  "retrieved_at": "2026-10-25T04:30:27.242Z",
  "data": [
    {
      "id": "SHELTER-GCC-Z13-01",
      "name": "GCC Community Welfare Hall — Velachery",
      "facility_type": "Designated GCC Flood Relief Centre",
      "zone": "Zone 13 (Adyar)",
      "address": "Gandhi Road, Near Velachery Railway Station, Velachery, Chennai 600042",
      "latitude": 12.9790,
      "longitude": 80.2198,
      "capacity_estimate": "350 persons",
      "source": "Greater Chennai Corporation Disaster Contingency Plan",
      "source_url": "https://chennaicorporation.gov.in/",
      "last_verified_date": "2026-10-24",
      "operational_status": "Standby Contingency (Activated by GCC upon warning)",
      "classification_note": "Designated municipal community centre with emergency generator and kitchen space. Not a general night shelter.",
      "amenities": ["Elevated First Floor Space", "Community Kitchen Facilities", "GCC Medical Team Station"],
      "helpline_to_confirm": "1913"
    }
  ]
}
```

---

## 5. Preliminary Flood Risk Zones
### `GET /api/risk-zones`
Returns the transparent heuristic model metadata, drainage basin traits, and elevation depression factors for Chennai Corporation zones.

#### Example Response (200 OK)
```json
{
  "metadata": {
    "model_name": "FloodSense Chennai Ward Vulnerability Heuristic Model (v2.0-Alpha)",
    "status": "EXPERIMENTAL INDICATOR — NOT AN OFFICIAL FLOOD FORECAST",
    "formula_description": "Composite Risk Score (0 - 100) = (Historical Vulnerability Weight * 40%) + (Elevation Depression Factor * 30%) + (Drainage Basin Bottleneck Factor * 30%). Scaled by Rainfall Multiplier."
  },
  "rainfall_brackets": [ ... ],
  "zones": [ ... ]
}
```

---

## 6. Community Flood Reports
### `GET /api/reports`
Returns all logged community flood observations and demonstration markers ordered by timestamp descending.

#### Example Response (200 OK)
```json
{
  "total": 6,
  "retrieved_at": "2026-10-25T04:30:42.017Z",
  "reports": [
    {
      "id": "RPT-MVNBXWF5-380",
      "location_name": "Adyar Canal Bank Road, Kotturpuram",
      "latitude": 13.0185,
      "longitude": 80.2392,
      "category": "waterlogging",
      "water_depth_estimate": "1.2 feet",
      "description": "Minor water pooling near school gate.",
      "reported_at": "2026-10-25T04:30:42.017Z",
      "status": "Unverified",
      "is_demo": false,
      "demo_disclaimer": null,
      "reporter_name": "Volunteer Karthik"
    }
  ]
}
```

### `POST /api/reports`
Submits a new eyewitness community report. Stored persistently in the SQLite database with an initial status of `"Unverified"`.

#### Request Headers
- `Content-Type: application/json`

#### Request Payload Schema
| Field | Type | Required | Constraints |
|---|---|---|---|
| `location_name` | string | **Yes** | Min 3 characters, max 120 characters |
| `description` | string | **Yes** | Min 5 characters, max 500 characters |
| `category` | string | No | Enum: `waterlogging`, `road_obstruction`, `drain_overflow`, `fallen_tree_powerline`, `other` (Default: `waterlogging`) |
| `water_depth_estimate` | string | No | Free text or category (e.g. `1.0 to 1.5 ft`) |
| `latitude` | number | No | Must be within Chennai bounds `12.5` to `13.5` if provided |
| `longitude` | number | No | Must be within Chennai bounds `79.8` to `80.5` if provided |
| `reporter_name` | string | No | Max 50 characters (Default: `Anonymous Citizen`) |
| `contact_number` | string | No | Max 20 characters |

#### Example Request Payload
```json
{
  "location_name": "Velachery 100ft Road near Vijayanagar Junction",
  "category": "waterlogging",
  "water_depth_estimate": "1.5 to 2.0 feet",
  "description": "Water stagnation along service lane towards SRP Tools. Slow moving two-wheeler traffic.",
  "latitude": 12.9815,
  "longitude": 80.2180,
  "reporter_name": "Citizen Ravi"
}
```

#### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Report submitted successfully. Stored as Unverified community observation.",
  "report": {
    "id": "RPT-20261025-412",
    "location_name": "Velachery 100ft Road near Vijayanagar Junction",
    "latitude": 12.9815,
    "longitude": 80.2180,
    "category": "waterlogging",
    "water_depth_estimate": "1.5 to 2.0 feet",
    "description": "Water stagnation along service lane towards SRP Tools. Slow moving two-wheeler traffic.",
    "reported_at": "2026-10-25T04:35:10.123Z",
    "status": "Unverified",
    "is_demo": false,
    "reporter_name": "Citizen Ravi"
  }
}
```

#### Validation Error Response (400 Bad Request)
```json
{
  "error": true,
  "status": 400,
  "message": "Report validation failed.",
  "details": [
    "Location or area name is required (minimum 3 characters).",
    "Latitude must be within the greater Chennai region (12.5 to 13.5)."
  ],
  "timestamp": "2026-10-25T04:35:12.000Z"
}
```
