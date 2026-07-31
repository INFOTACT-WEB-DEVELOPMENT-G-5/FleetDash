import { useState, useEffect } from "react";
import "./LiveAlerts.css";

function LiveAlerts({ vehicles }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = [];
    vehicles.forEach((vehicle) => {
      if (vehicle.speed > 80) {
        newAlerts.push({
          id: vehicle._id + "_speed",
          message: `${vehicle.vehicleId} High Speed ${vehicle.speed} km/h`,
          type: "Overspeed",
          severity: "Critical",
          time: new Date().toLocaleTimeString()
        });
      }
      if (vehicle.status === "Offline") {
        newAlerts.push({
          id: vehicle._id + "_offline",
          message: `${vehicle.vehicleId} is Offline`,
          type: "Offline",
          severity: "High",
          time: new Date().toLocaleTimeString()
        });
      }
      if ((vehicle.fuel || 100) < 15) {
        newAlerts.push({
          id: vehicle._id + "_fuel",
          message: `${vehicle.vehicleId} Low Fuel (${Math.round(vehicle.fuel)}%)`,
          type: "Low Fuel",
          severity: "High",
          time: new Date().toLocaleTimeString()
        });
      }
    });
    setAlerts(newAlerts.slice(0, 10));
  }, [vehicles]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.2)" };
      case "High": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" };
      default: return { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.2)" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Overspeed": return "🚀";
      case "Offline": return "📡";
      case "Low Fuel": return "⛽";
      default: return "⚠️";
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>🔔 Live Alerts</h3>
        <span style={{ fontSize: 11, color: "#64748b" }}>{alerts.length} active</span>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: 13 }}>
            ✅ No active alerts. Fleet operating normally.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alerts.map((alert) => {
              const colors = getSeverityColor(alert.severity);
              return (
                <div key={alert.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 8,
                  background: colors.bg, border: `1px solid ${colors.border}`
                }}>
                  <span style={{ fontSize: 16 }}>{getTypeIcon(alert.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0" }}>{alert.message}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{alert.time}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600 }}>
                    {alert.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveAlerts;