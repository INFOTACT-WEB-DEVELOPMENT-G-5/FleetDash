// k6 load test — run: k6 run load-test.js
// Optional: K6_TOKEN=<jwt> k6 run -e TOKEN=<jwt> load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 50 },
    { duration: "40s", target: 200 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: __ENV.EMAIL || "manager@fleetdash.com",
      password: __ENV.PASSWORD || "123456",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  const body = loginRes.json();
  return { token: body.token || __ENV.TOKEN || "" };
}

export default function (data) {
  const payload = JSON.stringify({
    vehicleId: `FD-${String((__VU % 15) + 1).padStart(3, "0")}`,
    lat: 11.0 + Math.random() * 0.05,
    lng: 76.9 + Math.random() * 0.05,
    speed: Math.floor(Math.random() * 80),
    fuel: Math.floor(Math.random() * 100),
    status: "Active",
  });

  const res = http.post(`${BASE_URL}/api/vehicles/telemetry`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
    },
  });

  check(res, {
    "status is 202": (r) => r.status === 202,
  });

  sleep(0.05);
}
