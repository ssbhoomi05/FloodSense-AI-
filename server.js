/**
 * FloodSense AI 2.0 — Flood Emergency Companion
 * Backend HTTP Server & REST API
 * 
 * Zero-dependency Node.js server using native Node 24 APIs (node:http, node:sqlite).
 * Serves static web assets and provides endpoints for alerts, contacts,
 * community reports, relief shelters, and risk assessment heuristics.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'reports.db');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS community_reports (
    id TEXT PRIMARY KEY,
    location_name TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    category TEXT NOT NULL,
    water_depth_estimate TEXT,
    description TEXT NOT NULL,
    reported_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unverified',
    is_demo INTEGER NOT NULL DEFAULT 0,
    demo_disclaimer TEXT,
    reporter_name TEXT,
    contact_number TEXT
  );
`);

// Helper to read JSON data file safely
function readJsonData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return [];
  }
}

// Seed demo reports into SQLite if table is empty
function seedDemoReports() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM community_reports');
  const result = countStmt.get();
  if (result.count === 0) {
    console.log('Seeding demo reports into SQLite database...');
    const demoReports = readJsonData('demo_reports.json');
    const insertStmt = db.prepare(`
      INSERT INTO community_reports (
        id, location_name, latitude, longitude, category,
        water_depth_estimate, description, reported_at, status,
        is_demo, demo_disclaimer, reporter_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const rpt of demoReports) {
      insertStmt.run(
        rpt.id,
        rpt.location_name,
        rpt.latitude || null,
        rpt.longitude || null,
        rpt.category || 'waterlogging',
        rpt.water_depth_estimate || 'Not specified',
        rpt.description,
        rpt.reported_at || new Date().toISOString(),
        rpt.status || 'Demo Sample (Unverified)',
        1,
        rpt.demo_disclaimer || 'DEMO DATA — NOT A VERIFIED FLOOD LOCATION',
        rpt.reporter_type || 'Demonstration System'
      );
    }
    console.log(`Seeded ${demoReports.length} demo reports.`);
  }
}

seedDemoReports();

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Response helpers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    error: true,
    status: statusCode,
    message,
    details,
    timestamp: new Date().toISOString()
  });
}

// Request dispatcher
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API ROUTES ---

  // 1. GET /api/status - Application meta and honest status
  if (pathname === '/api/status' && method === 'GET') {
    const reportCount = db.prepare('SELECT COUNT(*) as count FROM community_reports').get().count;
    const userReportCount = db.prepare('SELECT COUNT(*) as count FROM community_reports WHERE is_demo = 0').get().count;
    const demoReportCount = db.prepare('SELECT COUNT(*) as count FROM community_reports WHERE is_demo = 1').get().count;
    const alerts = readJsonData('official_alerts.json');
    const contacts = readJsonData('emergency_contacts.json');
    const shelters = readJsonData('relief_shelters.json');

    return sendJson(res, 200, {
      application: 'FloodSense AI 2.0 — Flood Emergency Companion',
      version: '2.0.0',
      target_area: 'Chennai, Tamil Nadu',
      operating_mode: 'Demonstration & Verified Reference Mode',
      live_api_status: 'Automated live feed unavailable; displaying verified archived bulletins and community submissions.',
      last_system_check: new Date().toISOString(),
      counts: {
        official_alerts: alerts.filter(a => !a.is_demo).length,
        demo_alerts: alerts.filter(a => a.is_demo).length,
        emergency_contacts: contacts.length,
        relief_shelters: shelters.length,
        total_reports: reportCount,
        user_submitted_reports: userReportCount,
        demo_reports: demoReportCount
      },
      disclaimers: {
        safety_guarantee: 'FloodSense AI 2.0 does NOT guarantee safety at any location. Follow official district orders.',
        prediction_disclaimer: 'Risk indicators are transparent heuristic approximations and not official IMD/CWC forecasts.'
      }
    });
  }

  // 2. GET /api/alerts - Official & Demo Weather/Flood Alerts
  if (pathname === '/api/alerts' && method === 'GET') {
    const alerts = readJsonData('official_alerts.json');
    return sendJson(res, 200, {
      source: 'Tamil Nadu Disaster Management & IMD Official Bulletins',
      retrieved_at: new Date().toISOString(),
      data: alerts
    });
  }

  // 3. GET /api/contacts - Emergency Contacts Directory
  if (pathname === '/api/contacts' && method === 'GET') {
    const contacts = readJsonData('emergency_contacts.json');
    return sendJson(res, 200, {
      source: 'Chennai District Administration & Greater Chennai Corporation Verified Roster',
      retrieved_at: new Date().toISOString(),
      data: contacts
    });
  }

  // 4. GET /api/shelters - Relief & Evacuation Centres
  if (pathname === '/api/shelters' && method === 'GET') {
    const shelters = readJsonData('relief_shelters.json');
    return sendJson(res, 200, {
      source: 'Greater Chennai Corporation Monsoon Preparedness Contingency Roster',
      retrieved_at: new Date().toISOString(),
      data: shelters
    });
  }

  // 5. GET /api/risk-zones - Preliminary Heuristic Risk Model Data
  if (pathname === '/api/risk-zones' && method === 'GET') {
    const riskData = readJsonData('chennai_risk_zones.json');
    return sendJson(res, 200, riskData);
  }

  // 6. GET /api/reports - Fetch all community & demo reports
  if (pathname === '/api/reports' && method === 'GET') {
    const stmt = db.prepare(`
      SELECT 
        id, location_name, latitude, longitude, category,
        water_depth_estimate, description, reported_at, status,
        is_demo, demo_disclaimer, reporter_name
      FROM community_reports
      ORDER BY datetime(reported_at) DESC
    `);
    const reports = stmt.all();
    return sendJson(res, 200, {
      total: reports.length,
      retrieved_at: new Date().toISOString(),
      reports: reports.map(r => ({
        ...r,
        is_demo: Boolean(r.is_demo)
      }))
    });
  }

  // 7. POST /api/reports - Submit a new community flood report
  if (pathname === '/api/reports' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Guard against massive payloads (> 1MB)
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);

        // Validation
        const errors = [];
        if (!payload.location_name || typeof payload.location_name !== 'string' || payload.location_name.trim().length < 3) {
          errors.push('Location or area name is required (minimum 3 characters).');
        }

        if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length < 5) {
          errors.push('Condition description is required (minimum 5 characters).');
        }

        const validCategories = ['waterlogging', 'road_obstruction', 'drain_overflow', 'fallen_tree_powerline', 'other'];
        const category = payload.category && validCategories.includes(payload.category) ? payload.category : 'waterlogging';

        let lat = null;
        let lng = null;

        if (payload.latitude !== undefined && payload.latitude !== null && payload.latitude !== '') {
          lat = parseFloat(payload.latitude);
          if (isNaN(lat) || lat < 12.5 || lat > 13.5) {
            errors.push('Latitude must be within the greater Chennai region (12.5 to 13.5).');
          }
        }

        if (payload.longitude !== undefined && payload.longitude !== null && payload.longitude !== '') {
          lng = parseFloat(payload.longitude);
          if (isNaN(lng) || lng < 79.8 || lng > 80.5) {
            errors.push('Longitude must be within the greater Chennai region (79.8 to 80.5).');
          }
        }

        if (errors.length > 0) {
          return sendError(res, 400, 'Report validation failed.', errors);
        }

        // Generate ID
        const reportId = `RPT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
        const nowIso = new Date().toISOString();
        const waterDepth = payload.water_depth_estimate ? String(payload.water_depth_estimate).trim() : 'Not specified';
        const reporterName = payload.reporter_name ? String(payload.reporter_name).trim().slice(0, 50) : 'Anonymous Citizen';
        const contactNumber = payload.contact_number ? String(payload.contact_number).trim().slice(0, 20) : '';

        const insertStmt = db.prepare(`
          INSERT INTO community_reports (
            id, location_name, latitude, longitude, category,
            water_depth_estimate, description, reported_at, status,
            is_demo, demo_disclaimer, reporter_name, contact_number
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(
          reportId,
          payload.location_name.trim(),
          lat,
          lng,
          category,
          waterDepth,
          payload.description.trim(),
          nowIso,
          'Unverified', // All citizen reports start as Unverified
          0, // Not demo data, real user entry
          null,
          reporterName,
          contactNumber
        );

        return sendJson(res, 201, {
          success: true,
          message: 'Report submitted successfully. Stored as Unverified community observation.',
          report: {
            id: reportId,
            location_name: payload.location_name.trim(),
            latitude: lat,
            longitude: lng,
            category,
            water_depth_estimate: waterDepth,
            description: payload.description.trim(),
            reported_at: nowIso,
            status: 'Unverified',
            is_demo: false,
            reporter_name: reporterName
          }
        });
      } catch (err) {
        return sendError(res, 400, 'Invalid JSON payload.', err.message);
      }
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  if (method === 'GET') {
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // Guard against directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      return sendError(res, 403, 'Access denied.');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for client-side routing if not found
        const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(fallbackPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          fs.createReadStream(fallbackPath).pipe(res);
          return;
        }
        return sendError(res, 404, 'Resource not found.');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Set Service Worker specific headers
      const headers = { 'Content-Type': contentType };
      if (ext === '.js' && path.basename(filePath) === 'sw.js') {
        headers['Service-Worker-Allowed'] = '/';
        headers['Cache-Control'] = 'no-cache';
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  // Fallback for unsupported methods
  sendError(res, 405, `Method ${method} not allowed.`);
});

server.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(` FloodSense AI 2.0 — Flood Emergency Companion`);
  console.log(` Target Region: Chennai, Tamil Nadu`);
  console.log(` Server running at: http://${HOST}:${PORT}`);
  console.log(` Operating Mode: Verified Data & Community Reports`);
  console.log(` SQLite Database: ${DB_PATH}`);
  console.log(`====================================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing SQLite database and shutting down server...');
  db.close();
  process.exit(0);
});
