import API from "../api/axios";

// ===================== AUTH API =====================

export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (userData) => API.post("/users/create", userData),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (resetToken, password) => API.put(`/auth/reset-password/${resetToken}`, { password }),
};

// ===================== DRIVERS API =====================

export const driversAPI = {
  getAll: (params) => API.get("/drivers", { params }),
  getById: (id) => API.get(`/drivers/${id}`),
  create: (data) => API.post("/drivers", data),
  update: (id, data) => API.put(`/drivers/${id}`, data),
  delete: (id) => API.delete(`/drivers/${id}`),
};

// ===================== VEHICLES API =====================

export const vehiclesAPI = {
  getAll: () => API.get("/vehicles"),
  getById: (id) => API.get(`/vehicles/${id}`),
  create: (vehicleData) => API.post("/vehicles", vehicleData),
  update: (id, vehicleData) => API.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => API.delete(`/vehicles/${id}`),
};

// ===================== ALERTS API =====================

export const alertsAPI = {
  getAll: (params) => API.get("/alerts", { params }),
  getById: (id) => API.get(`/alerts/${id}`),
  acknowledge: (id, userName) => API.put(`/alerts/${id}/acknowledge`, { userName }),
  acknowledgeAll: (userName) => API.put("/alerts/acknowledge-all", { userName }),
  resolve: (id) => API.put(`/alerts/${id}/resolve`),
  delete: (id) => API.delete(`/alerts/${id}`),
  getStats: () => API.get("/alerts/stats/summary"),
};

// ===================== NOTIFICATIONS API =====================

export const notificationsAPI = {
  getAll: (params) => API.get("/notifications", { params }),
  getUnreadCount: () => API.get("/notifications/unread-count"),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put("/notifications/read-all"),
  delete: (id) => API.delete(`/notifications/${id}`),
};

// ===================== AI API =====================

export const aiAPI = {
  getMaintenance: (vehicleId) => API.get(`/ai/maintenance${vehicleId ? `?vehicleId=${vehicleId}` : ""}`),
  runAnalysis: () => API.post("/ai/maintenance/analyze"),
  updateMaintenanceStatus: (id, status) => API.put(`/ai/maintenance/${id}/status`, { status }),
  getAllHealthCards: () => API.get("/ai/health"),
  getVehicleHealthCard: (id) => API.get(`/ai/health/${id}`),
  getDriverScores: () => API.get("/ai/drivers"),
  getDriverLeaderboard: () => API.get("/ai/drivers/leaderboard"),
  optimizeRoute: (data) => API.post("/ai/route/optimize", data),
  getFuelRecords: (vehicleId) => API.get(`/ai/fuel${vehicleId ? `?vehicleId=${vehicleId}` : ""}`),
  getFuelFraudAlerts: () => API.get("/ai/fuel/fraud"),
  getGeofenceZones: () => API.get("/ai/geofence"),
  createGeofenceZone: (data) => API.post("/ai/geofence", data),
  deleteGeofenceZone: (id) => API.delete(`/ai/geofence/${id}`),
  getDailyReport: () => API.get("/ai/report"),
  downloadPDF: () => API.get("/ai/report/pdf", { responseType: "blob" }),
  downloadExcel: () => API.get("/ai/report/excel", { responseType: "blob" }),
  getFleetAnalytics: () => API.get("/ai/analytics"),
  getAuditLogs: (params) => API.get("/ai/audit", { params }),
  voiceCommand: (command) => API.post("/ai/voice", { command }),
};

// ===================== ENTERPRISE API =====================

export const enterpriseAPI = {
  // Incidents
  getIncidents: (params) => API.get("/enterprise/incidents", { params }),
  getIncidentStats: () => API.get("/enterprise/incidents/stats"),
  createIncident: (data) => API.post("/enterprise/incidents", data),
  updateIncident: (id, data) => API.put(`/enterprise/incidents/${id}`, data),
  deleteIncident: (id) => API.delete(`/enterprise/incidents/${id}`),
  
  // Work Orders
  getWorkOrders: (params) => API.get("/enterprise/work-orders", { params }),
  createWorkOrder: (data) => API.post("/enterprise/work-orders", data),
  updateWorkOrder: (id, data) => API.put(`/enterprise/work-orders/${id}`, data),
  
  // Documents
  getDocuments: (params) => API.get("/enterprise/documents", { params }),
  getExpiringDocuments: () => API.get("/enterprise/documents/expiring"),
  createDocument: (data) => API.post("/enterprise/documents", data),
  updateDocument: (id, data) => API.put(`/enterprise/documents/${id}`, data),
  deleteDocument: (id) => API.delete(`/enterprise/documents/${id}`),
  
  // Trips
  getTrips: (params) => API.get("/enterprise/trips", { params }),
  createTrip: (data) => API.post("/enterprise/trips", data),
  updateTrip: (id, data) => API.put(`/enterprise/trips/${id}`, data),
  getTripPlayback: (id) => API.get(`/enterprise/trips/${id}/playback`),
  
  // Depots
  getDepots: () => API.get("/enterprise/depots"),
  createDepot: (data) => API.post("/enterprise/depots", data),
  updateDepot: (id, data) => API.put(`/enterprise/depots/${id}`, data),
  deleteDepot: (id) => API.delete(`/enterprise/depots/${id}`),
  
  // Costs
  getCosts: (params) => API.get("/enterprise/costs", { params }),
  createCost: (data) => API.post("/enterprise/costs", data),
  getCostAnalytics: () => API.get("/enterprise/costs/analytics"),
  
  // Utilization & Activity
  getUtilization: () => API.get("/enterprise/utilization"),
  getActivityFeed: (params) => API.get("/enterprise/activity-feed", { params }),
  
  // Export
  exportData: (resource) => API.get(`/enterprise/export/${resource}`, { responseType: "blob" }),
  
  // Global Search
  globalSearch: (query) => API.get(`/enterprise/search?q=${encodeURIComponent(query)}`),
};

// ===================== ADMIN API =====================

export const adminAPI = {
  getUsers: () => API.get("/auth/users"),
  createUser: (data) => API.post("/auth/users", data),
  updateUser: (id, data) => API.put(`/auth/users/${id}`, data),
  deleteUser: (id) => API.delete(`/auth/users/${id}`),
  deactivateUser: (id) => API.put(`/auth/users/${id}/deactivate`),
  getSystemHealth: () => API.get("/health"),
};
