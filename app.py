"""
FloodSense AI 2.0 — Flood Emergency Companion
Python Flask Backend Alternative

Serves the exact same REST API and static assets as server.js.
Useful for team members preferring a Python runtime.
"""

import os
import json
import sqlite3
import random
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
DB_PATH = os.path.join(DATA_DIR, 'reports.db')

app = Flask(__name__, static_folder=PUBLIC_DIR, static_url_path='')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    with get_db() as conn:
        conn.execute('''
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
            )
        ''')
        cursor = conn.execute('SELECT COUNT(*) FROM community_reports')
        count = cursor.fetchone()[0]
        if count == 0:
            demo_path = os.path.join(DATA_DIR, 'demo_reports.json')
            if os.path.exists(demo_path):
                with open(demo_path, 'r', encoding='utf-8') as f:
                    demo_reports = json.load(f)
                for rpt in demo_reports:
                    conn.execute('''
                        INSERT INTO community_reports (
                            id, location_name, latitude, longitude, category,
                            water_depth_estimate, description, reported_at, status,
                            is_demo, demo_disclaimer, reporter_name
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        rpt.get('id'),
                        rpt.get('location_name'),
                        rpt.get('latitude'),
                        rpt.get('longitude'),
                        rpt.get('category', 'waterlogging'),
                        rpt.get('water_depth_estimate', 'Not specified'),
                        rpt.get('description', ''),
                        rpt.get('reported_at', datetime.now(timezone.utc).isoformat()),
                        rpt.get('status', 'Demo Sample (Unverified)'),
                        1,
                        rpt.get('demo_disclaimer', 'DEMO DATA — NOT A VERIFIED FLOOD LOCATION'),
                        rpt.get('reporter_type', 'Demonstration System')
                    ))
                conn.commit()

init_db()

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

@app.route('/')
def index():
    return send_from_directory(PUBLIC_DIR, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(PUBLIC_DIR, path)

@app.route('/api/status', methods=['GET'])
def api_status():
    with get_db() as conn:
        total = conn.execute('SELECT COUNT(*) FROM community_reports').fetchone()[0]
        user_total = conn.execute('SELECT COUNT(*) FROM community_reports WHERE is_demo = 0').fetchone()[0]
        demo_total = conn.execute('SELECT COUNT(*) FROM community_reports WHERE is_demo = 1').fetchone()[0]
    
    alerts = load_json('official_alerts.json')
    contacts = load_json('emergency_contacts.json')
    shelters = load_json('relief_shelters.json')

    return jsonify({
        'application': 'FloodSense AI 2.0 — Flood Emergency Companion',
        'version': '2.0.0',
        'target_area': 'Chennai, Tamil Nadu',
        'operating_mode': 'Demonstration & Verified Reference Mode',
        'live_api_status': 'Automated live feed unavailable; displaying verified archived bulletins and community submissions.',
        'last_system_check': datetime.now(timezone.utc).isoformat(),
        'counts': {
            'official_alerts': len([a for a in alerts if not a.get('is_demo')]),
            'demo_alerts': len([a for a in alerts if a.get('is_demo')]),
            'emergency_contacts': len(contacts),
            'relief_shelters': len(shelters),
            'total_reports': total,
            'user_submitted_reports': user_total,
            'demo_reports': demo_total
        },
        'disclaimers': {
            'safety_guarantee': 'FloodSense AI 2.0 does NOT guarantee safety at any location. Follow official district orders.',
            'prediction_disclaimer': 'Risk indicators are transparent heuristic approximations and not official IMD/CWC forecasts.'
        }
    })

@app.route('/api/alerts', methods=['GET'])
def api_alerts():
    return jsonify({
        'source': 'Tamil Nadu Disaster Management & IMD Official Bulletins',
        'retrieved_at': datetime.now(timezone.utc).isoformat(),
        'data': load_json('official_alerts.json')
    })

@app.route('/api/contacts', methods=['GET'])
def api_contacts():
    return jsonify({
        'source': 'Chennai District Administration & Greater Chennai Corporation Verified Roster',
        'retrieved_at': datetime.now(timezone.utc).isoformat(),
        'data': load_json('emergency_contacts.json')
    })

@app.route('/api/shelters', methods=['GET'])
def api_shelters():
    return jsonify({
        'source': 'Greater Chennai Corporation Monsoon Preparedness Contingency Roster',
        'retrieved_at': datetime.now(timezone.utc).isoformat(),
        'data': load_json('relief_shelters.json')
    })

@app.route('/api/risk-zones', methods=['GET'])
def api_risk_zones():
    return jsonify(load_json('chennai_risk_zones.json'))

@app.route('/api/reports', methods=['GET', 'POST'])
def api_reports():
    if request.method == 'GET':
        with get_db() as conn:
            cursor = conn.execute('''
                SELECT id, location_name, latitude, longitude, category,
                       water_depth_estimate, description, reported_at, status,
                       is_demo, demo_disclaimer, reporter_name
                FROM community_reports
                ORDER BY datetime(reported_at) DESC
            ''')
            rows = [dict(r) for r in cursor.fetchall()]
            for r in rows:
                r['is_demo'] = bool(r['is_demo'])
        return jsonify({
            'total': len(rows),
            'retrieved_at': datetime.now(timezone.utc).isoformat(),
            'reports': rows
        })

    # POST
    payload = request.get_json(silent=True) or {}
    errors = []
    location_name = payload.get('location_name', '').strip()
    description = payload.get('description', '').strip()

    if len(location_name) < 3:
        errors.append('Location or area name is required (minimum 3 characters).')
    if len(description) < 5:
        errors.append('Condition description is required (minimum 5 characters).')

    valid_cats = ['waterlogging', 'road_obstruction', 'drain_overflow', 'fallen_tree_powerline', 'other']
    category = payload.get('category', 'waterlogging')
    if category not in valid_cats:
        category = 'waterlogging'

    lat = payload.get('latitude')
    lng = payload.get('longitude')
    try:
        lat = float(lat) if lat is not None and lat != '' else None
        if lat is not None and not (12.5 <= lat <= 13.5):
            errors.append('Latitude must be within the greater Chennai region (12.5 to 13.5).')
    except (ValueError, TypeError):
        errors.append('Invalid latitude number.')

    try:
        lng = float(lng) if lng is not None and lng != '' else None
        if lng is not None and not (79.8 <= lng <= 80.5):
            errors.append('Longitude must be within the greater Chennai region (79.8 to 80.5).')
    except (ValueError, TypeError):
        errors.append('Invalid longitude number.')

    if errors:
        return jsonify({
            'error': True,
            'status': 400,
            'message': 'Report validation failed.',
            'details': errors
        }), 400

    report_id = f"RPT-PY-{int(datetime.now().timestamp())}-{random.randint(100, 999)}"
    now_iso = datetime.now(timezone.utc).isoformat()
    water_depth = payload.get('water_depth_estimate', 'Not specified')
    reporter_name = payload.get('reporter_name', 'Anonymous Citizen')[:50]
    contact_number = payload.get('contact_number', '')[:20]

    with get_db() as conn:
        conn.execute('''
            INSERT INTO community_reports (
                id, location_name, latitude, longitude, category,
                water_depth_estimate, description, reported_at, status,
                is_demo, demo_disclaimer, reporter_name, contact_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            report_id, location_name, lat, lng, category,
            water_depth, description, now_iso, 'Unverified',
            0, None, reporter_name, contact_number
        ))
        conn.commit()

    return jsonify({
        'success': True,
        'message': 'Report submitted successfully. Stored as Unverified community observation.',
        'report': {
            'id': report_id,
            'location_name': location_name,
            'latitude': lat,
            'longitude': lng,
            'category': category,
            'water_depth_estimate': water_depth,
            'description': description,
            'reported_at': now_iso,
            'status': 'Unverified',
            'is_demo': False,
            'reporter_name': reporter_name
        }
    }), 201

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    print(f"Starting FloodSense AI Flask Server on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=True)
