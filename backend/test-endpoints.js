const http = require('http');

const makeRequest = (path, token) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data.substring(0, 100) });
      });
    });

    req.on('error', (e) => resolve({ status: 0, data: e.message }));
    req.end();
  });
};

const login = () => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ email: 'manager@fleetdash.com', password: 'password123' });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.token);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
};

const testAll = async () => {
  console.log('Logging in...');
  const token = await login();
  if (!token) {
    console.log('Login failed');
    return;
  }
  console.log('Login successful\n');

  const endpoints = [
    '/api/vehicles',
    '/api/drivers',
    '/api/trips',
    '/api/alerts',
    '/api/ai/maintenance',
    '/api/ai/health',
    '/api/ai/drivers',
    '/api/ai/fuel',
    '/api/ai/report',
    '/api/ai/analytics',
    '/api/ai/audit',
    '/api/enterprise/incidents',
    '/api/enterprise/work-orders',
    '/api/enterprise/documents',
    '/api/enterprise/depots',
    '/api/enterprise/costs',
    '/api/enterprise/costs/analytics',
    '/api/enterprise/utilization',
    '/api/users',
    '/api/health'
  ];

  for (const path of endpoints) {
    const result = await makeRequest(path, token);
    const status = result.status === 200 ? '✓' : '✗';
    console.log(`${status} ${path} - ${result.status}`);
  }
};

testAll();