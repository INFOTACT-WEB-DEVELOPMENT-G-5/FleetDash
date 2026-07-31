import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import API from "../api/axios";

const styles = {
  container: { padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  tabs: { display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "0" },
  tab: { padding: "10px 20px", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", borderBottom: "2px solid transparent", transition: "all 0.2s" },
  tabActive: { padding: "10px 20px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--accent-primary)", borderBottom: "2px solid var(--accent-primary)" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  card: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" },
  metric: { textAlign: "center", padding: "16px" },
  metricValue: { fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" },
  metricLabel: { fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" },
  td: { padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)" },
  badge: { display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)" }
};

const TABS = ["Overview", "Telemetry", "Trips", "Maintenance", "Fuel", "Alerts", "Documents"];

function VehicleDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [vehicle, setVehicle] = useState(null);
  const [healthCard, setHealthCard] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [trips, setTrips] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vRes, hRes, mRes, fRes, tRes, dRes, aRes] = await Promise.allSettled([
          API.get(`/vehicles/${id}`),
          API.get(`/ai/health/${id}`),
          API.get(`/ai/maintenance?vehicleId=${id}`),
          API.get(`/ai/fuel?vehicleId=${id}`),
          API.get(`/enterprise/trips?vehicleId=${id}`),
          API.get(`/enterprise/documents?vehicleId=${id}`),
          API.get(`/alerts?vehicleId=${id}`)
        ]);

        if (vRes.status === "fulfilled") setVehicle(vRes.value.data);
        if (hRes.status === "fulfilled") setHealthCard(hRes.value.data);
        if (mRes.status === "fulfilled") setMaintenance(mRes.value.data || []);
        if (fRes.status === "fulfilled") setFuelRecords(fRes.value.data || []);
        if (tRes.status === "fulfilled") setTrips(tRes.value.data?.trips || []);
        if (dRes.status === "fulfilled") setDocuments(dRes.value.data?.documents || []);
        if (aRes.status === "fulfilled") setAlerts(aRes.value.data?.alerts || aRes.value.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Layout><div style={styles.loading}><div className="loading-spinner"></div> Loading vehicle data...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button></div></Layout>;
  if (!vehicle) return <Layout><div className="empty-state"><span className="empty-state-icon">🚛</span><h3>Vehicle not found</h3></div></Layout>;

  const score = healthCard?.overallScore || 85;
  const statusColor = score > 70 ? "#22c55e" : score > 50 ? "#f59e0b" : "#ef4444";
  const statusLabel = score > 70 ? "Healthy" : score > 50 ? "Needs Attention" : "Critical";

  const renderOverview = () => (
    <div>
      <div style={styles.grid3}>
        <div style={styles.card}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚛</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{vehicle.vehicleId}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{vehicle.type || "Vehicle"}</div>
            <div style={{ marginTop: "12px" }}>
              <span className={`status-badge ${vehicle.status === "Active" ? "status-active" : "status-offline"}`}>
                {vehicle.status || "Unknown"}
              </span>
            </div>
          </div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>📍 Location & Driver</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div><span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Driver:</span> <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{vehicle.driver || "Unassigned"}</span></div>
            <div><span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Phone:</span> <span style={{ color: "var(--text-primary)" }}>{vehicle.phone || "N/A"}</span></div>
            <div><span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Latitude:</span> <span style={{ color: "var(--text-primary)" }}>{vehicle.location?.lat || "N/A"}</span></div>
            <div><span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Longitude:</span> <span style={{ color: "var(--text-primary)" }}>{vehicle.location?.lng || "N/A"}</span></div>
          </div>
        </div>
        <div style={styles.card}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Fleet Health Score</div>
            <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto" }}>
              <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={statusColor} strokeWidth="8" strokeDasharray={`${(score / 100) * 327} 327`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: statusColor }}>{score}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>/100</div>
              </div>
            </div>
            <div style={{ marginTop: "8px", color: statusColor, fontWeight: 600, fontSize: "13px" }}>{statusLabel}</div>
          </div>
        </div>
      </div>
      <div style={{ ...styles.grid3, marginTop: "20px" }}>
        <div style={styles.card}><div style={styles.metric}><div style={styles.metricValue}>{vehicle.speed || 0}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}> km/h</span></div><div style={styles.metricLabel}>Live Speed</div></div></div>
        <div style={styles.card}><div style={styles.metric}><div style={styles.metricValue}>{vehicle.fuel || 0}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}>%</span></div><div style={styles.metricLabel}>Fuel Level</div></div></div>
        <div style={styles.card}><div style={styles.metric}><div style={styles.metricValue}>{vehicle.engineTemp || 0}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}>°C</span></div><div style={styles.metricLabel}>Engine Temp</div></div></div>
        <div style={styles.card}><div style={styles.metric}><div style={styles.metricValue}>{vehicle.batteryLevel || 0}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}>%</span></div><div style={styles.metricLabel}>Battery</div></div></div>
        <div style={styles.card}><div style={styles.metric}><div style={styles.metricValue}>{vehicle.distance?.toLocaleString() || 0}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}> km</span></div><div style={styles.metricLabel}>Total Distance</div></div></div>
        <div style={styles.card}><div style={styles.metric}><div style={styles.metricValue}>{vehicle.tirePressure || 0}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}> PSI</span></div><div style={styles.metricLabel}>Tire Pressure</div></div></div>
      </div>
    </div>
  );

  const renderTelemetry = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "16px" }}>📡 Telemetry Timeline</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)" }}>Last Updated</span>
          <span style={{ color: "var(--text-primary)" }}>{vehicle.lastUpdated ? new Date(vehicle.lastUpdated).toLocaleString() : "N/A"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)" }}>Speed</span>
          <span style={{ color: vehicle.speed > 80 ? "#ef4444" : "var(--text-primary)" }}>{vehicle.speed || 0} km/h</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)" }}>Heading</span>
          <span style={{ color: "var(--text-primary)" }}>{vehicle.heading || 0}°</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)" }}>Fuel Level</span>
          <span style={{ color: vehicle.fuel > 20 ? "var(--text-primary)" : "#ef4444" }}>{vehicle.fuel || 0}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)" }}>Engine Temperature</span>
          <span style={{ color: vehicle.engineTemp > 95 ? "#ef4444" : "var(--text-primary)" }}>{vehicle.engineTemp || 0}°C</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)" }}>Battery Level</span>
          <span style={{ color: vehicle.batteryLevel > 20 ? "var(--text-primary)" : "#ef4444" }}>{vehicle.batteryLevel || 0}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
          <span style={{ color: "var(--text-muted)" }}>Tire Pressure</span>
          <span style={{ color: "var(--text-primary)" }}>{vehicle.tirePressure || 0} PSI</span>
        </div>
      </div>
    </div>
  );

  const renderTrips = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "16px" }}>🛣️ Trip History</h3>
      {trips.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "100px" }}><p>No trips found for this vehicle.</p></div>
      ) : (
        <div className="table-container" style={{ border: "none", background: "transparent" }}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Trip ID</th>
              <th style={styles.th}>Origin</th>
              <th style={styles.th}>Destination</th>
              <th style={styles.th}>Distance</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
            </tr></thead>
            <tbody>
              {trips.map(t => (
                <tr key={t._id}>
                  <td style={styles.td}>{t.tripId}</td>
                  <td style={styles.td}>{t.origin?.address || "N/A"}</td>
                  <td style={styles.td}>{t.destination?.address || "N/A"}</td>
                  <td style={styles.td}>{t.distance || 0} km</td>
                  <td style={styles.td}><span className={`status-badge ${t.status === "Completed" ? "status-active" : t.status === "In Progress" ? "status-warning" : "status-offline"}`}>{t.status}</span></td>
                  <td style={styles.td}>{t.startTime ? new Date(t.startTime).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMaintenance = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "16px" }}>🔧 Maintenance Predictions</h3>
      {maintenance.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "100px" }}><p>No maintenance predictions.</p></div>
      ) : (
        <div className="table-container" style={{ border: "none", background: "transparent" }}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Component</th>
              <th style={styles.th}>Probability</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Est. Cost</th>
              <th style={styles.th}>Due Date</th>
            </tr></thead>
            <tbody>
              {maintenance.map(m => (
                <tr key={m._id}>
                  <td style={styles.td}>{m.component}</td>
                  <td style={styles.td}>{m.probability}%</td>
                  <td style={styles.td}><span className={`status-badge ${m.severity === "Critical" ? "status-critical" : m.severity === "High" ? "status-warning" : "status-active"}`}>{m.severity}</span></td>
                  <td style={styles.td}>{m.status}</td>
                  <td style={styles.td}>₹{m.estimatedCost?.toLocaleString() || 0}</td>
                  <td style={styles.td}>{m.recommendedServiceDate ? new Date(m.recommendedServiceDate).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFuel = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "16px" }}>⛽ Fuel Records</h3>
      {fuelRecords.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "100px" }}><p>No fuel records found.</p></div>
      ) : (
        <div className="table-container" style={{ border: "none", background: "transparent" }}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Fuel Level</th>
              <th style={styles.th}>Consumed</th>
              <th style={styles.th}>Anomaly Score</th>
              <th style={styles.th}>Fraud Alert</th>
              <th style={styles.th}>Timestamp</th>
            </tr></thead>
            <tbody>
              {fuelRecords.slice(0, 20).map(f => (
                <tr key={f._id}>
                  <td style={styles.td}>{f.fuelLevel}%</td>
                  <td style={styles.td}>{f.fuelConsumed} L</td>
                  <td style={styles.td}>{Math.round(f.anomalyScore)}</td>
                  <td style={styles.td}>{f.isFraud ? <span style={{ color: "#ef4444" }}>⚠️ Yes</span> : "No"}</td>
                  <td style={styles.td}>{f.timestamp ? new Date(f.timestamp).toLocaleString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "16px" }}>🔔 Alerts</h3>
      {alerts.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "100px" }}><p>No alerts for this vehicle.</p></div>
      ) : (
        <div className="table-container" style={{ border: "none", background: "transparent" }}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
            </tr></thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a._id}>
                  <td style={styles.td}>{a.type}</td>
                  <td style={styles.td}>{a.message}</td>
                  <td style={styles.td}><span className={`status-badge ${a.severity === "Critical" ? "status-critical" : a.severity === "High" ? "status-warning" : "status-active"}`}>{a.severity}</span></td>
                  <td style={styles.td}>{a.acknowledged ? "Acknowledged" : "Pending"}</td>
                  <td style={styles.td}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "16px" }}>📄 Documents</h3>
      {documents.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "100px" }}><p>No documents found.</p></div>
      ) : (
        <div className="table-container" style={{ border: "none", background: "transparent" }}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Document No.</th>
              <th style={styles.th}>Issue Date</th>
              <th style={styles.th}>Expiry Date</th>
              <th style={styles.th}>Status</th>
            </tr></thead>
            <tbody>
              {documents.map(d => (
                <tr key={d._id}>
                  <td style={styles.td}>{d.type}</td>
                  <td style={styles.td}>{d.documentNumber}</td>
                  <td style={styles.td}>{d.issueDate ? new Date(d.issueDate).toLocaleDateString() : "N/A"}</td>
                  <td style={styles.td}>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "N/A"}</td>
                  <td style={styles.td}><span className={`status-badge ${d.status === "Valid" ? "status-active" : d.status === "Expiring Soon" ? "status-warning" : "status-critical"}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview": return renderOverview();
      case "Telemetry": return renderTelemetry();
      case "Trips": return renderTrips();
      case "Maintenance": return renderMaintenance();
      case "Fuel": return renderFuel();
      case "Alerts": return renderAlerts();
      case "Documents": return renderDocuments();
      default: return renderOverview();
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1>🚛 {vehicle.vehicleId}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Vehicle 360° View · {vehicle.driver || "Unassigned"}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className={`status-badge ${vehicle.status === "Active" ? "status-active" : "status-offline"}`}>{vehicle.status}</span>
          </div>
        </div>

        <div style={styles.tabs}>
          {TABS.map(tab => (
            <div key={tab} style={activeTab === tab ? styles.tabActive : styles.tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </Layout>
  );
}

export default VehicleDetails;