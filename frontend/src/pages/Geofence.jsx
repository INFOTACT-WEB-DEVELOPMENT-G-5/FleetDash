import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { aiAPI } from "../services/api";

function Geofence() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "circle",
    lat: "19.0760",
    lng: "72.8777",
    radius: "500",
    alertOnExit: true,
    alertOnEntry: true,
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await aiAPI.getGeofenceZones();
      setZones(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load geofence zones");
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: formData.name,
        type: "circle",
        center: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
        radius: parseInt(formData.radius, 10),
        alertOnExit: !!formData.alertOnExit,
        alertOnEntry: !!formData.alertOnEntry,
        active: true,
      };
      await aiAPI.createGeofenceZone(payload);
      setShowModal(false);
      setFormData({
        name: "",
        type: "circle",
        lat: "19.0760",
        lng: "72.8777",
        radius: "500",
        alertOnExit: true,
        alertOnEntry: true,
      });
      fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create zone");
    }
  };

  const handleDelete = async (id) => {
    try {
      await aiAPI.deleteGeofenceZone(id);
      fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete zone");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Geofence Zones</h1>
          <p>Create geographic boundaries and receive live breach alerts</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Zone
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, color: "#ef4444" }}>
          {error}
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Zones</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{zones.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Active</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
            {zones.filter((z) => z.active !== false).length}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Exit Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>
            {zones.filter((z) => z.alertOnExit).length}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Entry Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>
            {zones.filter((z) => z.alertOnEntry).length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>Loading zones...
        </div>
      ) : zones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📍</div>
          <h3>No Geofence Zones</h3>
          <p>Create your first geofence zone to start monitoring.</p>
        </div>
      ) : (
        <div className="grid-3">
          {zones.map((zone) => (
            <div className="card" key={zone._id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(99, 102, 241, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  📍
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{zone.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>
                    {zone.type || "circle"} zone
                  </div>
                </div>
                <span className="status-badge status-active">
                  {zone.active === false ? "Inactive" : "Active"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Latitude</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                    {zone.center?.lat ?? "-"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Longitude</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                    {zone.center?.lng ?? "-"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Radius</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{zone.radius || 0}m</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Vehicles</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                    {zone.vehicleIds?.length || "All"}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-danger btn-sm"
                style={{ width: "100%" }}
                onClick={() => handleDelete(zone._id)}
              >
                Delete Zone
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Geofence Zone</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Zone Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mumbai Warehouse"
                />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Radius (meters)</label>
                <input
                  type="number"
                  required
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  min="50"
                  max="50000"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Geofence;
