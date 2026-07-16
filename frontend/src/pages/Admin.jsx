import { useState } from "react";
import Layout from "../components/Layout/Layout";

function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [users] = useState([
    { id: 1, name: "Admin User", email: "admin@fleetdash.com", role: "Admin", status: "Active", lastLogin: "2026-07-16 14:30" },
    { id: 2, name: "Rajesh Kumar", email: "rajesh@fleet.com", role: "Fleet Manager", status: "Active", lastLogin: "2026-07-16 12:15" },
    { id: 3, name: "Priya Singh", email: "priya@fleet.com", role: "Operator", status: "Active", lastLogin: "2026-07-16 10:00" },
    { id: 4, name: "Amit Sharma", email: "amit@fleet.com", role: "Viewer", status: "Inactive", lastLogin: "2026-07-15 08:45" },
  ]);

  const [auditLogs] = useState([
    { id: 1, user: "Admin User", action: "Login", details: "Logged in from IP 192.168.1.1", timestamp: "2026-07-16 14:30:00", severity: "info" },
    { id: 2, user: "Rajesh Kumar", action: "Vehicle Update", details: "Updated TRUCK-003 fuel data", timestamp: "2026-07-16 13:15:00", severity: "info" },
    { id: 3, user: "Priya Singh", action: "Alert Acknowledge", details: "Acknowledged overspeed alert", timestamp: "2026-07-16 11:20:00", severity: "info" },
    { id: 4, user: "System", action: "Maintenance Alert", details: "Critical maintenance predicted for TRUCK-002", timestamp: "2026-07-16 09:00:00", severity: "warning" },
    { id: 5, user: "Admin User", action: "Settings Change", details: "Updated data refresh interval to 15s", timestamp: "2026-07-16 08:30:00", severity: "info" },
  ]);

  const tabs = [
    { id: "users", label: "👥 User Management" },
    { id: "audit", label: "📋 Audit Log" },
    { id: "system", label: "⚙️ System Health" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🛡️ Admin Panel</h1>
          <p>System administration, user management and audit logs</p>
        </div>
      </div>

      <div className="cc-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`cc-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      background: user.role === "Admin" ? "rgba(99,102,241,0.1)" : user.role === "Fleet Manager" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                      color: user.role === "Admin" ? "#6366f1" : user.role === "Fleet Manager" ? "#f59e0b" : "#22c55e"
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status === "Active" ? "status-active" : "status-offline"}`}>
                      {user.status === "Active" ? "🟢 Active" : "⭕ Inactive"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "#64748b" }}>{user.lastLogin}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                      <button className="btn btn-danger btn-sm">🚫 Disable</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "audit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {auditLogs.map((log) => (
            <div key={log.id} className="card" style={{
              padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
              borderLeft: `3px solid ${log.severity === "warning" ? "#f59e0b" : "#3b82f6"}`
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: log.severity === "warning" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
              }}>
                {log.severity === "warning" ? "⚠️" : "ℹ️"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                  <strong>{log.user}</strong> — {log.action}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{log.details}</div>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", flexShrink: 0 }}>{log.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "system" && (
        <div className="grid-2">
          {[
            { label: "Server Status", value: "Online", icon: "🟢", color: "#22c55e" },
            { label: "Database", value: "Connected", icon: "✅", color: "#22c55e" },
            { label: "WebSocket", value: "Active", icon: "🔌", color: "#22c55e" },
            { label: "API Response", value: "45ms avg", icon: "⚡", color: "#f59e0b" },
            { label: "Active Users", value: "3", icon: "👥", color: "#3b82f6" },
            { label: "Uptime", value: "99.97%", icon: "📈", color: "#22c55e" },
            { label: "Memory Usage", value: "342MB / 2GB", icon: "💾", color: "#6366f1" },
            { label: "CPU Load", value: "23%", icon: "🔧", color: "#22c55e" },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${item.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 22
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Admin;