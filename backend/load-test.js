// load-test.js (run with: k6 run load-test.js)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // ramp up to 100 VUs
    { duration: '1m', target: 2000 },  // hold at 2000 VUs
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],    // error rate < 1%
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  const payload = JSON.stringify({
    vehicleId: `VH-${__VU}-${__ITER}`,
    lat: 11.0 + Math.random() * 0.05,
    lng: 76.9 + Math.random() * 0.05,
    speed: Math.floor(Math.random() * 80),
    fuel: Math.floor(Math.random() * 100),
    status: ['Moving', 'Stopped', 'Idle'][Math.floor(Math.random() * 3)],
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/vehicles/telemetry`, payload, params);
  check(res, {
    'status is 202': (r) => r.status === 202,
  });
  sleep(0.01); // 10ms between requests
}