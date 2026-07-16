import { useState } from "react";
import Layout from "../components/Layout/Layout";

function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    criticalAlerts: true,
    maintenanceReminders: true,
    dailyReports: false
  });
  const [theme, setTheme] = useState("dark");
  const [mapProvider, setMapProvider] = useState("openstreetmap");
  const [refreshInterval, setRefreshInterval] = useState("10");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: "general", label: "⚙️ General", icon: "⚙️" },
    { id: "notifications", label: "🔔 Notifications", icon: "🔔" },
    { id: "display", label: "🎨 Display", icon: "🎨" },
    { id: "security", label: "🔒 Security", icon: "🔒" },
    { id: "integrations", label: "🔗 Integrations", icon: "🔗" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>⚙️ Settings</h1>
          <p>Configure your FleetDash application settings</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => { setActiveSection("general"); setSaved(false); }}>
            🔄 Reset
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? "✅ Saved!" : "💾 Save Settings"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: 12 }}>
          {sections.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                cursor: "pointer",
                background: activeSection === s.id ? "rgba(99, 102, 241, 0.1)" : "transparent",
                color: activeSection === s.id ? "#6366f1" : "#94a3b8",
                fontWeight: activeSection === s.id ? 600 : 400,
                fontSize: 14,
                marginBottom: 4,
                transition: "all 0.2s",
                border: activeSection === s.id ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent"
              }}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 24, minHeight: 400 }}>
          {activeSection === "general" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>General Settings</h2>
              <div className="form-group">
                <label>Application Name</label>
                <input type="text" defaultValue="FleetDash Enterprise" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>Data Refresh Interval (seconds)</label>
                <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} style={{ width: "100%" }}>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>
              <div className="form-group">
                <label>Default Map Center</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input type="number" defaultValue={11.0168} step="0.01" placeholder="Latitude" />
                  <input type="number" defaultValue={76.9558} step="0.01" placeholder="Longitude" />
                </div>
              </div>
              <div className="form-group">
                <label>Default Zoom Level</label>
                <select style={{ width: "100%" }}>
                  <option value="3">3 - Continent</option>
                  <option value="5">5 - Region</option>
                  <option value="8">8 - City</option>
                  <option value="12">12 - District</option>
                  <option value="15">15 - Street</option>
                </select>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? "✅ Saved!" : "Save General Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Notification Preferences</h2>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0", textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {key === "emailAlerts" && "Receive alerts via email"}
                      {key === "smsAlerts" && "Get SMS notifications for critical alerts"}
                      {key === "pushNotifications" && "Browser push notifications"}
                      {key === "criticalAlerts" && "Immediate notification for critical events"}
                      {key === "maintenanceReminders" && "Scheduled maintenance reminders"}
                      {key === "dailyReports" && "Daily fleet performance summary"}
                    </div>
                  </div>
                  <label style={{
                    width: 48, height: 26, background: value ? "#6366f1" : "rgba(255,255,255,0.1)",
                    borderRadius: 13, cursor: "pointer", position: "relative",
                    transition: "all 0.3s", flexShrink: 0
                  }}>
                    <input type="checkbox" checked={value} onChange={() => setNotifications({ ...notifications, [key]: !value })}
                      style={{ display: "none" }} />
                    <span style={{
                      width: 22, height: 22, background: "#fff", borderRadius: "50%",
                      position: "absolute", top: 2, left: value ? 24 : 2,
                      transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                    }}></span>
                  </label>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? "✅ Saved!" : "Save Notification Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "display" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Display Settings</h2>
              <div className="form-group">
                <label>Theme</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {["dark", "light", "system"].map((t) => (
                    <div key={t} onClick={() => setTheme(t)} style={{
                      flex: 1, padding: "16px", borderRadius: 12,
                      border: `2px solid ${theme === t ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                      background: theme === t ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>
                        {t === "dark" ? "🌙" : t === "light" ? "☀️" : "💻"}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", textTransform: "capitalize" }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Map Provider</label>
                <select value={mapProvider} onChange={(e) => setMapProvider(e.target.value)} style={{ width: "100%" }}>
                  <option value="openstreetmap">OpenStreetMap</option>
                  <option value="mapbox">Mapbox (requires API key)</option>
                  <option value="google">Google Maps (requires API key)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Compact Mode</label>
                <select style={{ width: "100%" }}>
                  <option value="off">Off - Full layout</option>
                  <option value="partial">Partial - Compact sidebar</option>
                  <option value="full">Full - Minimal layout</option>
                </select>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? "✅ Saved!" : "Save Display Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Security Settings</h2>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <select style={{ width: "100%" }}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="1440">Never (24h)</option>
                </select>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  {saved ? "✅ Saved!" : "Update Password"}
                </button>
                <button className="btn btn-secondary">🔑 Change API Key</button>
              </div>
            </div>
          )}

          {activeSection === "integrations" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Integrations</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "Google Maps API", desc: "Enable Google Maps for enhanced mapping", status: "Not configured", icon: "🗺️" },
                  { name: "Twilio SMS", desc: "Send SMS alerts for critical events", status: "Not configured", icon: "📱" },
                  { name: "Slack Webhook", desc: "Post alerts and reports to Slack channels", status: "Not configured", icon: "💬" },
                  { name: "Email SMTP", desc: "Configure email server for report delivery", status: "Connected", icon: "📧" },
                ].map((integration) => (
                  <div key={integration.name} className="card" style={{
                    padding: 16, display: "flex", alignItems: "center", gap: 16,
                    background: "rgba(15,23,42,0.4)"
                  }}>
                    <div style={{ fontSize: 24 }}>{integration.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{integration.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{integration.desc}</div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 6,
                      background: integration.status === "Connected" ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                      color: integration.status === "Connected" ? "#22c55e" : "#64748b"
                    }}>
                      {integration.status === "Connected" ? "✅ Connected" : "⚙️ Configure"}
                    </span>
                    <button className="btn btn-secondary btn-sm">
                      {integration.status === "Connected" ? "Settings" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Settings;