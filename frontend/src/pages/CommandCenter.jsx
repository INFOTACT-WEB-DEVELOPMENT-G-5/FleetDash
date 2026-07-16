import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { aiAPI } from "../services/api";
import "./CommandCenter.css";

function CommandCenter() {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alerts");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vRes, mRes, dRes] = await Promise.allSettled([
        aiAPI.getAllHealthCards(),
        aiAPI.getMaintenance(),
        aiAPI.getDriverScores()
      ]);

      if (vRes.status === "fulfilled") setVehicles(vRes.value.data || []);
      if (mRes.status === "fulfilled") {
        const preds = mRes.value.data || [];
        setMaintenance(preds);
        setAlerts(preds.filter(p => p.severity === "Critical" || p.severity === "High"));
      }
      if (dRes.status === "fulfilled") setDrivers(dRes.value.data || []);
    } catch (err) {
      console.error("Command center error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case "Critical": return "var(--alert-critical)";
      case "High": return "var(--alert-high)";
      case "Medium": return "var(--alert-medium)";
      default: return "var(--alert-low)";
    }
  };

  return (
    <Layout>
      <div className="command-center">
        <div className="cc-header">
          <div>
            <h1 className="cc-title">🚀 Command Center</h1>
            <p className="cc-subtitle">Real-time Fleet Operations Control Room</p>
          </div>
          <div className="cc-live-badge">
            <span className="cc-pulse"></span>
            LIVE
          </div>
        </div>

        <div className="cc-metrics-grid">
          <div className="cc-metric-card">
            <div className="cc-metric-icon">🚛</div>
            <div className="cc-metric-value">{vehicles.length}</div>
            <div className="cc-metric-label">Total Vehicles</div>
          </div>
          <div className="cc-metric-card">
            <div className="cc-metric-icon">🟢</div>
            <div className="cc-metric-value">{vehicles.filter(v => v.status === "Active").length}</div>
            <div className="cc-metric-label">Active</div>
          </div>
          <div className="cc-metric-card">
            <div className="cc-metric-icon">⚠️</div>
            <div className="cc-metric-value">{alerts.length}</div>
            <div className="cc-metric-label">Active Alerts</div>
          </div>
          <div className="cc-metric-card">
            <div className="cc-metric-icon">🔴</div>
            <div className="cc-metric-value">{drivers.filter(d => d.rating === "Risky").length}</div>
            <div className="cc-metric-label">Risky Drivers</div>
          </div>
          <div className="cc-metric-card">
            <div className="cc-metric-icon">🔧</div>
            <div className="cc-metric-value">{maintenance.filter(p => p.severity === "Critical").length}</div>
            <div className="cc-metric-label">Critical Maintenance</div>
          </div>
          <div className="cc-metric-card">
            <div className="cc-metric-icon">💚</div>
            <div className="cc-metric-value">{vehicles.filter(v => (v.overallScore || 70) > 70).length}</div>
            <div className="cc-metric-label">Healthy Vehicles</div>
          </div>
        </div>

        <div className="cc-tabs">
          <button className={`cc-tab ${activeTab === "alerts" ? "active" : ""}`} onClick={() => setActiveTab("alerts")}>🚨 Active Alerts</button>
          <button className={`cc-tab ${activeTab === "vehicles" ? "active" : ""}`} onClick={() => setActiveTab("vehicles")}>🚛 Critical Vehicles</button>
          <button className={`cc-tab ${activeTab === "drivers" ? "active" : ""}`} onClick={() => setActiveTab("drivers")}>👤 Driver Risks</button>
          <button className={`cc-tab ${activeTab === "maintenance" ? "active" : ""}`} onClick={() => setActiveTab("maintenance")}>🔧 Maintenance</button>
        </div>

        <div className="cc-panel">
          {activeTab === "alerts" && (
            <div className="cc-alerts-list">
              {loading ? (
                <div className="cc-loading">Loading command center data...</div>
              ) : alerts.length === 0 ? (
                <div className="cc-empty">No active alerts. Fleet operating normally.</div>
              ) : (
                alerts.map((alert, i) => (
                  <div key={i} className="cc-alert-item" style={{ borderLeftColor: getAlertColor(alert.severity) }}>
                    <div className="cc-alert-severity" style={{ background: getAlertColor(alert.severity) }}>
                      {alert.severity === "Critical" ? "CRIT" : alert.severity === "High" ? "HIGH" : "MED"}
                    </div>
                    <div className="cc-alert-content">
                      <div className="cc-alert-vehicle">{alert.vehicleId}</div>
                      <div className="cc-alert-message">{alert.component ? `${alert.component} - ${alert.probability}% probability` : alert.message || "Alert triggered"}</div>
                    </div>
                    <div className="cc-alert-time">{alert.predictedDays ? `Due: ${alert.predictedDays}d` : "Now"}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="cc-vehicles-grid">
              {vehicles.filter(v => (v.overallScore || 70) < 60).map((v, i) => (
                <div key={i} className="cc-vehicle-card critical">
                  <div className="cc-v-header">
                    <span className="cc-v-id">{v.vehicleId}</span>
                    <span className="cc-v-score" style={{ color: "#ef4444" }}>{v.overallScore || 0}%</span>
                  </div>
                  <div className="cc-v-detail">Driver: {v.driver}</div>
                  <div className="cc-v-detail">Speed: {v.speed} km/h</div>
                  <div className="cc-v-detail">Fuel: {Math.round(v.fuel)}%</div>
                  <div className="cc-v-status-badge" style={{ background: "#ef4444" }}>NEEDS ATTENTION</div>
                </div>
              ))}
              {vehicles.filter(v => (v.overallScore || 70) < 60).length === 0 && !loading && (
                <div className="cc-empty">All vehicles operating within normal parameters.</div>
              )}
            </div>
          )}

          {activeTab === "drivers" && (
            <div className="cc-drivers-list">
              {drivers.filter(d => d.rating === "Risky").map((d, i) => (
                <div key={i} className="cc-driver-card risky">
                  <div className="cc-d-header">
                    <span>👤 {d.driver}</span>
                    <span className="cc-d-rating" style={{ color: "#ef4444" }}>{d.rating}</span>
                  </div>
                  <div className="cc-d-detail">Vehicle: {d.vehicleId}</div>
                  <div className="cc-d-detail">Score: {d.safetyScore}</div>
                  <div className="cc-d-detail">Violations: {d.speedViolations} | Hard Brakes: {d.hardBraking}</div>
                </div>
              ))}
              {drivers.filter(d => d.rating === "Risky").length === 0 && !loading && (
                <div className="cc-empty">No risky drivers detected.</div>
              )}
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="cc-maintenance-list">
              {maintenance.filter(p => p.severity === "Critical" || p.severity === "High").map((m, i) => (
                <div key={i} className="cc-maint-card" style={{ borderLeftColor: m.severity === "Critical" ? "#ef4444" : "#f97316" }}>
                  <div className="cc-m-header">
                    <span>{m.vehicleId}</span>
                    <span className={`cc-m-severity ${m.severity.toLowerCase()}`}>{m.severity}</span>
                  </div>
                  <div className="cc-m-detail">{m.component}</div>
                  <div className="cc-m-detail">Probability: {m.probability}% | Due: {m.predictedDays}d</div>
                  <div className="cc-m-detail">Est. Cost: ₹{m.estimatedCost?.toLocaleString()}</div>
                </div>
              ))}
              {maintenance.filter(p => p.severity === "Critical" || p.severity === "High").length === 0 && !loading && (
                <div className="cc-empty">No pending critical maintenance.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CommandCenter;