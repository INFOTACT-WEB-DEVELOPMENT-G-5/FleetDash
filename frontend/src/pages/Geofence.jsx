import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";

function Geofence() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "warehouse", lat: "19.0760", lng: "72.8777", radius: "500", color: "#6366f1" });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = () => {
    const defaultZones = [
      { id: "z1", name: "Mumbai Warehouse", type: "warehouse", lat: "19.0760", lng: "72.8777", radius: 500, color: "#6366f1", alerts: 3, status: "Active" },
      { id: "z2", name: "Delhi Distribution", type: "warehouse", lat: "28.7041", lng: "77.1025", radius: 400, color: "#22c55e", alerts: 1, status: "Active" },
      { id: "z3", name: "Bangalore Hub", type: "delivery", lat: "12.9716", lng: "77.5946", radius: 300, color: "#f59e0b", alerts: 0, status: "Active" },
      { id: "z4", name: "Chennai Restricted Zone", type: "restricted", lat: "13.0827", lng: "80.2707", radius: 200, color: "#ef4444", alerts: 5, status: "Active" },
      { id: "z5", name: "Pune Factory", type: "warehouse", lat: "18.5204", lng: "73.8567", radius: 600, color: "#3b82f6", alerts: 2, status: "Active" }
    ];
    setTimeout(() => {
      setZones(defaultZones);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newZone = {
      id: "z" + Date.now(),
      ...formData,
      radius: parseInt(formData.radius),
      alerts: 0,
      status: "Active"
    };
    setZones([...zones, newZone]);
    setShowModal(false);
    setFormData({ name: "", type: "warehouse", lat: "19.0760", lng: "72.8777", radius: "500", color: "#6366f1" });
  };

  const handleDelete = (id) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const typeColors = {
    warehouse: { bg: "rgba(99, 102, 241, 0.1)", text: "#6366f1", icon: "🏭" },
    delivery: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", icon: "📦" },
    restricted: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", icon: "🚫" }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>📍 Geofence Zones</h1>
          <p>Create and manage geographic boundaries for your fleet</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Create Zone</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Zones</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{zones.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{zones.reduce((a, z) => a + (z.alerts || 0), 0)}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Warehouses</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>{zones.filter(z => z.type === "warehouse").length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Restricted</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{zones.filter(z => z.type === "restricted").length}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading zones...</div>
      ) : zones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📍</div>
          <h3>No Geofence Zones</h3>
          <p>Create your first geofence zone to start monitoring.</p>
        </div>
      ) : (
        <div className="grid-3">
          {zones.map((zone) => {
            const tc = typeColors[zone.type] || typeColors.warehouse;
            return (
              <div className="card" key={zone.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {tc.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{zone.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{zone.type} Zone</div>
                  </div>
                  <span className="status-badge status-active">🟢 Active</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Latitude</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{zone.lat}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Longitude</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{zone.lng}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Radius</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{zone.radius}m</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Alerts</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: zone.alerts > 0 ? "#ef4444" : "#64748b" }}>{zone.alerts} triggered</div>
                  </div>
                </div>

                <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: 16 }}>
                  <div style={{ width: `${Math.min(100, (zone.radius / 600) * 100)}%`, height: "100%", background: zone.color, borderRadius: 2 }}></div>
                </div>

                <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={() => handleDelete(zone.id)}>🗑️ Delete Zone</button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📍 Create Geofence Zone</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Zone Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Mumbai Warehouse" />
              </div>
              <div className="form-group">
                <label>Zone Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="warehouse">🏭 Warehouse</option>
                  <option value="delivery">📦 Delivery Zone</option>
                  <option value="restricted">🚫 Restricted Zone</option>
                </select>
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input type="number" step="0.0001" required value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input type="number" step="0.0001" required value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Radius (meters)</label>
                <input type="number" required value={formData.radius} onChange={(e) => setFormData({ ...formData, radius: e.target.value })} min="50" max="5000" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">📍 Create Zone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Geofence;