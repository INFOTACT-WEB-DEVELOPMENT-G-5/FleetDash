# FleetDash
High-Throughput Event-Driven Fleet Telemetry Dashboard


# FleetDash Backend

Backend service for FleetDash application built with Node.js, Express, Redis, MongoDB, Socket.IO, and worker processing.

## Prerequisites

Make sure the following are installed before running the backend:

* Node.js and npm
* MongoDB
* Redis
* WSL (Windows users, if using Redis through Linux environment)
* k6 (for load testing)

---

# Backend Setup

## 1. Navigate to Backend Folder

From the project root:

```bash
cd backend
```

---

## 2. Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

---

# Redis Setup

Redis is required for backend operations.

## Install WSL (Windows Users)

If you want to run Redis using a Linux environment, install WSL.

Open **PowerShell as Administrator**:

```powershell
wsl --install
```

Restart your computer if prompted.

After restarting, open the **Ubuntu application** (not PowerShell) and run:

```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

Verify Redis is running:

```bash
redis-cli ping
```

Expected response:

```
PONG
```

---

# Running the Backend Server

Make sure you are inside the backend directory:

```bash
cd backend
```

Start the backend in development mode:

```bash
npm run dev
```

This runs:

```json
"dev": "nodemon server.js"
```

The backend server entry point is:

```
server.js
```

---

## Production Start

To run the backend without nodemon:

```bash
npm start
```

This runs:

```json
"start": "node server.js"
```

---

# Available npm Scripts

| Command       | Description                         |
| ------------- | ----------------------------------- |
| `npm run dev` | Starts backend server using nodemon |
| `npm start`   | Starts backend server using Node.js |

---

# Load Testing Setup

Load testing is performed using k6.

## Install k6

Install k6 using Chocolatey:

Open PowerShell:

```powershell
choco install k6 -y
```

---

## Run Load Test

Make sure the backend server is running.

From the location containing `load-test.js`, run:

```bash
k6 run load-test.js
```

---

# Backend Dependencies

Main technologies used:

* Express.js - API server
* Redis - Caching and queue operations
* MongoDB - Database
* Socket.IO - Real-time communication
* Piscina - Worker thread management
* Nodemon - Development server restart

---

# Project Scripts

`package.json`

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

# Troubleshooting

## Redis Connection Error

Make sure Redis is running:

```bash
sudo service redis-server start
```

Check Redis status:

```bash
redis-cli ping
```

Expected:

```
PONG
```

---

## Backend Port Issue

If the backend does not start, check whether another process is using the configured server port.

Stop the existing process and restart:

```bash
npm run dev
```

---

# Development Flow

1. Start Redis
2. Navigate to backend folder

```bash
cd backend
```

3. Install dependencies

```bash
npm install
```

4. Start backend

```bash
npm run dev
```

5. Run load testing when required

```bash
k6 run load-test.js
```
