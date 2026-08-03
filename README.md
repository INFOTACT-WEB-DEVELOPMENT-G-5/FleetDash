# FleetDash

High-throughput event-driven fleet telemetry dashboard.

**Stack:** Node.js · Express · MongoDB · Redis · Socket.io · React · Leaflet · Canvas · Turf.js

---

## Quick start (local)

### 1. MongoDB
Use local MongoDB or [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster.

### 2. Backend
```bash
cd backend
cp .env.example .env
# set MONGO_URI and JWT_SECRET
npm install
npm run seed   # optional full demo dataset
npm run dev
```

API: `http://localhost:5000` · Health: `http://localhost:5000/api/health`

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

UI: `http://localhost:5173`

### Demo login
| Email | Password |
|-------|----------|
| `admin@fleetdash.com` | `123456` |
| `manager@fleetdash.com` | `123456` |
| `driver@fleetdash.com` | `123456` |

Redis is **optional**. Without Redis, realtime still works via Socket.io.

---

## Deploy on Render.com (recommended)

### A) One Web Service (API + UI) — simplest

1. Push this repo to GitHub.
2. Create a free **MongoDB Atlas** cluster → Network Access `0.0.0.0/0` → copy connection string.
3. (Optional) Create free **Upstash Redis** → copy `REDIS_URL` (`rediss://...`).
4. In Render: **New → Blueprint** and select this repo (`render.yaml`), **or** **New → Web Service**:
   - **Build command:**
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   - **Start command:**
     ```bash
     cd backend && npm start
     ```
5. Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas URI |
| `JWT_SECRET` | long random string |
| `REDIS_URL` | Upstash URL (optional) |
| `ENABLE_LIVE_SIMULATOR` | `true` |
| `ALLOWED_ORIGINS` | `https://YOUR-APP.onrender.com` |
| `SOCKET_ORIGIN` | `https://YOUR-APP.onrender.com` |

6. After deploy, open the Render URL → login with demo accounts.
7. First boot auto-seeds demo users + vehicles + geofences.

> Free Render services sleep after inactivity; first request may take ~30–60s.

### B) Docker (optional)
```bash
docker build -t fleetdash .
docker run -p 5000:5000 \
  -e MONGO_URI=... \
  -e JWT_SECRET=... \
  fleetdash
```

---

## Team roles

| Member | Guide |
|--------|--------|
| 2 — Realtime & Performance | [docs/MEMBER-2-Realtime-Performance.md](docs/MEMBER-2-Realtime-Performance.md) |
| 4 — Security & Deployment | [docs/MEMBER-4-Security-Deployment.md](docs/MEMBER-4-Security-Deployment.md) |

---

## Key APIs

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/login` | JWT |
| GET | `/api/vehicles` | Auth required |
| POST | `/api/vehicles/telemetry` | High-frequency ingest |
| GET/POST | `/api/ai/geofence` | Zones |
| GET | `/api/alerts` | Alerts |
| GET | `/api/health` | Health check |

### Socket events
- `vehicleUpdate` / `vehicleUpdateBinary` — live positions
- `alert` — geofence / system alerts

---

## Scripts

```bash
# backend
npm run dev
npm start
npm run seed
npm test
k6 run load-test.js

# frontend
npm run dev
npm run build
```
