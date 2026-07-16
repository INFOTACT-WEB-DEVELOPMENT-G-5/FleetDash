import API from "../api/axios";

// ===================== AUTH API =====================

export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (userData) => API.post("/users/create", userData),
};

// ===================== VEHICLES API =====================

export const vehiclesAPI = {
  getAll: () => API.get("/vehicles"),
  getById: (id) => API.get(`/vehicles/${id}`),
  create: (vehicleData) => API.post("/vehicles", vehicleData),
  update: (id, vehicleData) => API.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => API.delete(`/vehicles/${id}`),
};

// ===================== AI API =====================

export const aiAPI = {
  // Maintenance
  getMaintenance: (vehicleId) => API.get(`/ai/maintenance${vehicleId ? `?vehicleId=${vehicleId}` : ""}`),
  runAnalysis: () => API.post("/ai/maintenance/analyze"),
  updateMaintenanceStatus: (id, status) => API.put(`/ai/maintenance/${id}/status`, { status }),

  // Health Cards
  getAllHealthCards: () => API.get("/ai/health"),
  getVehicleHealthCard: (id) => API.get(`/ai/health/${id}`),

  // Driver Scores
  getDriverScores: () => API.get("/ai/drivers"),
  getDriverLeaderboard: () => API.get("/ai/drivers/leaderboard"),

  // Route Optimization
  optimizeRoute: (data) => API.post("/ai/route/optimize", data),

  // Fuel Monitoring
  getFuelRecords: (vehicleId) => API.get(`/ai/fuel${vehicleId ? `?vehicleId=${vehicleId}` : ""}`),
  getFuelFraudAlerts: () => API.get("/ai/fuel/fraud"),

  // Geofence
  getGeofenceZones: () => API.get("/ai/geofence"),
  createGeofenceZone: (data) => API.post("/ai/geofence", data),
  deleteGeofenceZone: (id) => API.delete(`/ai/geofence/${id}`),

  // Reports
  getDailyReport: () => API.get("/ai/report"),
  downloadPDF: () => API.get("/ai/report/pdf", { responseType: "blob" }),
  downloadExcel: () => API.get("/ai/report/excel", { responseType: "blob" }),

  // Analytics
  getFleetAnalytics: () => API.get("/ai/analytics"),

  // Audit
  getAuditLogs: (params) => API.get("/ai/audit", { params }),

  // Voice AI
  voiceCommand: (command) => API.post("/ai/voice", { command }),
};