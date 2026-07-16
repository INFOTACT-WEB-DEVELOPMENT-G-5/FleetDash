import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import useVehicles from "../hooks/useVehicles";
import socket from "../services/socket";

function Alerts() {
  const { vehicles } = useVehicles();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    socket.on("vehicleUpdate", (data) => {
      if (data.type && data.type !== "analytics_tick") {
        const alert = {
          id: Date.now(),
          type: data.type,
          message: data.message,
          severity: data.severity || "Medium",
          vehicleId: data.vehicleId,
          timestamp: new Date(data.timestamp || Date.now()),
          acknowledged: false
        };
        setLiveAlerts(prev => [alert, ...prev].slice(0, 50));
      }
    });
    return () => socket.off("vehicleUpdate");
  }, []);

  const generateAlerts = () => {
    const newAlerts = [];
    vehicles.forEach(v => {
      if (v.speed > 80) {
        newAlerts.push({
          id: `speed_${v._id}`,
          type: "Overspeed",
          message: `${v.vehicleId} overspeeding at ${v.speed} km/h`,
          severity: "Critical",
          vehicleId: v.vehicleId,
          timestamp: new Date(),
          acknowledged: false
        });
      }
      if (v.status === "Offline") {
        newAlerts.push({
          id: `offline_${v._id}`,
          type: "Vehicle Offline",
          message: `${v.vehicleId} is offline`,
          severity: "High",
          vehicleId: v.vehicleId,
          timestamp: new Date(),
          acknowledged: false
        });
      }
      if ((v.fuel || 100) < 15) {
        newAlerts.push({
          id: `fuel_${v._id}`,
          type: "Low Fuel",
          message: `${v.vehicleId} fuel level critically low at ${Math.round(v.fuel)}%`,
          severity: "High",
          vehicleId: v.vehicleId,
          timestamp: new Date(),
          acknowledged: false
        });
      }
    });
    setAlerts(newAlerts);
  };

  useEffect(() => {
    generateAlerts();
    const interval = setInterval(generateAlerts, 10000);
    return () => clearInterval(interval);
  }, [vehicles]);

  const allAlerts = [...liveAlerts, ...alerts].filter((alert, index, self) =>
    index === self.findIndex(a => a.id === alert.id)
  );
  const unacknowledged = allAlerts.filter(a => !a.acknowledged).length;

  const filtered = allAlerts.filter(a => {
    const matchesFilter = filter === "All" || a.type === filter;
    const matchesSeverity = severityFilter === "All" || a.severity === severityFilter;
    return matchesFilter && matchesSeverity;
  });

  const acknowledge = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    setLiveAlerts(liveAlerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAll = () => {
    setAlerts(alerts.map(a => ({ ...a, acknowledged: true })));
    setLiveAlerts(liveAlerts.map(a => ({ ...a, acknowledged: true })));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.2)" };
      case "High": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" };
      case "Medium": return { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.2)" };
      default: return { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "rgba(34,197,94,0.2)" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Overspeed": return "🚀";
      case "Vehicle Offline": return "📡";
      case "Low Fuel": return "⛽";
      case "maintenance_alert": return "🔧";
      case "fuel_fraud_alert": return "💰";
      case "driver_risk_alert": return "👤";
      default: return "⚠️";
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🔔 Alert Center</h1>
          <p>Real-time fleet alerts and notifications - {unacknowledged} unacknowledged</p>
        </div>
        <div className="page-header-right">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
            <option value="All">All Types</option>
            <option value="Overspeed">Overspeed</option>
            <option value="Vehicle Offline">Offline</option>
            <option value="Low Fuel">Low Fuel</option>
            <option value="maintenance_alert">Maintenance</option>
            <option value="fuel_fraud_alert">Fuel Fraud</option>
            <option value="driver_risk_alert">Driver Risk</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
            <option value="All">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button className="btn btn-secondary" onClick={acknowledgeAll}>✅ Acknowledge All</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{allAlerts.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Critical</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{allAlerts.filter(a => a.severity === "Critical").length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Unacknowledged</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{unacknowledged}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Overspeed</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{allAlerts.filter(a => a.type === "Overspeed").length}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>No Alerts</h3>
          <p>No alerts match your current filters. Fleet operating normally.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 100).map((alert) => {
            const colors = getSeverityColor(alert.severity);
            return (
              <div key={alert.id} className="card" style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderLeft: `3px solid ${alert.acknowledged ? "transparent" : colors.text}`,
                opacity: alert.acknowledged ? 0.6 : 1
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: colors.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                }}>
                  {getTypeIcon(alert.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{alert.message}</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600 }}>
                      {alert.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {alert.type} • {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "Just now"} • {alert.vehicleId}
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button className="btn btn-secondary btn-sm" onClick={() => acknowledge(alert.id)}>✅ Acknowledge</button>
                )}
                {alert.acknowledged && <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>✓ Acknowledged</span>}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

export default Alerts;