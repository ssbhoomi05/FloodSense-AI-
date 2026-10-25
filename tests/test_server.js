/**
 * FloodSense AI 2.0 — Automated Test Suite
 * Tests static file serving, API endpoints, validation logic,
 * SQLite persistence, and error handling.
 */

const path = require('node:path');

async function runTestSuite() {
  console.log('--- Starting FloodSense AI 2.0 Test Suite ---');
  require(path.join(__dirname, '..', 'server.js'));

  // Give server time to bind
  await new Promise(r => setTimeout(r, 600));

  let totalTests = 0;
  let passedTests = 0;

  function assert(name, condition, extra = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${name}`);
    } else {
      console.error(`  [FAIL] ${name} ${extra}`);
    }
  }

  // 1. Static Asset Tests
  console.log('\n1. Testing Static Assets & App Shell:');
  const staticFiles = [
    '/',
    '/css/styles.css',
    '/js/app.js',
    '/js/map.js',
    '/js/alerts.js',
    '/js/reports.js',
    '/js/contacts.js',
    '/js/guide.js',
    '/js/shelters.js',
    '/js/risk.js',
    '/manifest.json',
    '/sw.js'
  ];

  for (const url of staticFiles) {
    const res = await fetch('http://127.0.0.1:3000' + url);
    assert(`GET ${url}`, res.status === 200);
  }

  // 2. Read-Only API Endpoints
  console.log('\n2. Testing Read-Only REST Endpoints:');
  const statusRes = await fetch('http://127.0.0.1:3000/api/status');
  const statusData = await statusRes.json();
  assert('GET /api/status returns 200', statusRes.status === 200);
  assert('Target region is Chennai', statusData.target_area.includes('Chennai'));
  assert('Live API status is honest', statusData.live_api_status.includes('unavailable'));

  const alertsRes = await fetch('http://127.0.0.1:3000/api/alerts');
  const alertsData = await alertsRes.json();
  assert('GET /api/alerts returns list', Array.isArray(alertsData.data) && alertsData.data.length > 0);
  assert('Contains official alert with IMD source', alertsData.data.some(a => a.source_organization.includes('IMD')));
  assert('Contains explicitly marked demo alert', alertsData.data.some(a => a.is_demo === true));

  const contactsRes = await fetch('http://127.0.0.1:3000/api/contacts');
  const contactsData = await contactsRes.json();
  assert('GET /api/contacts returns verified helplines', Array.isArray(contactsData.data));
  assert('GCC Helpline 1913 is present', contactsData.data.some(c => c.phone === '1913'));
  assert('TANGEDCO Emergency is present', contactsData.data.some(c => c.phone === '9498794987'));

  const sheltersRes = await fetch('http://127.0.0.1:3000/api/shelters');
  const sheltersData = await sheltersRes.json();
  assert('GET /api/shelters returns designated GCC halls', Array.isArray(sheltersData.data));
  assert('Shelter entries distinguish from night shelters', sheltersData.data.every(s => s.classification_note.length > 0));

  const riskRes = await fetch('http://127.0.0.1:3000/api/risk-zones');
  const riskData = await riskRes.json();
  assert('GET /api/risk-zones has transparent metadata', riskData.metadata.status.includes('EXPERIMENTAL'));
  assert('Includes Velachery and Madipakkam zones', riskData.zones.some(z => z.zone_name.includes('Velachery')));

  // 3. Community Report Validation & Submission
  console.log('\n3. Testing Community Report Validation & SQLite Persistence:');
  
  // 3a. Validation error on missing location
  const invalidRes = await fetch('http://127.0.0.1:3000/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_name: '',
      description: 'Water'
    })
  });
  assert('POST /api/reports rejects empty location with 400', invalidRes.status === 400);

  // 3b. Validation error on invalid coordinates
  const invalidCoordsRes = await fetch('http://127.0.0.1:3000/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_name: 'Invalid Coords Test',
      description: 'Test waterlogging condition description',
      latitude: 55.0, // outside Chennai
      longitude: 80.2
    })
  });
  assert('POST /api/reports rejects out-of-bounds latitude with 400', invalidCoordsRes.status === 400);

  // 3c. Valid submission
  const validRes = await fetch('http://127.0.0.1:3000/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_name: 'Kotturpuram River View Enclave',
      category: 'waterlogging',
      water_depth_estimate: '1.0 to 1.5 feet',
      description: 'Water stagnation near apartment entrance due to clogged curb drain.',
      latitude: 13.0210,
      longitude: 80.2415,
      reporter_name: 'Resident Suresh'
    })
  });
  const validData = await validRes.json();
  assert('POST /api/reports accepts valid submission with 201', validRes.status === 201);
  assert('New report is marked Unverified', validData.report.status === 'Unverified');
  assert('New report is not demo data', validData.report.is_demo === false);

  // 3d. Verify query returns new report
  const allReportsRes = await fetch('http://127.0.0.1:3000/api/reports');
  const allReportsData = await allReportsRes.json();
  assert('GET /api/reports includes recently submitted report', allReportsData.reports.some(r => r.id === validData.report.id));

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} passed.`);
  console.log(`========================================`);

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
