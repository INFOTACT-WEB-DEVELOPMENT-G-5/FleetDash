import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { vehiclesAPI } from "../services/api";
import { useSearchParams } from "react-router-dom";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    driver: "",
    status: "Active",
    speed: 0,
    fuel: 100,
    distance: 0,
    location: { lat: 19.0760, lng: 72.8777 }
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehiclesAPI.getAll();
      setVehicles(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle._id, formData);
        setVehicles(vehicles.map(v => v._id === editingVehicle._id ? { ...v, ...formData } : v));
      } else {
        const res = await vehiclesAPI.create(formData);
        setVehicles([...vehicles, res.data]);
      }
      setShowModal(false);
      setEditingVehicle(null);
    } catch (err) {
      console.error("Vehicle save error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehiclesAPI.delete(id);
      setVehicles(vehicles.filter(v => v._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filtered = vehicles.filter(v => {
    const matchesSearch = 
      v.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = vehicles.length;
  const active = vehicles.filter(v => v.status === "Active").length;
  const offline = vehicles.filter(v => v.status === "Offline").length;
  const avgSpeed = total > 0 ? Math.round(vehicles.reduce((a, v) => a + (v.speed || 0), 0) / total) : 0;

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🚛 Vehicles</h1>
          <p>Manage your fleet vehicles - {total} total, {active} active</p>
        </div>
        <div className="page-header-right">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "13px",
              outline: "none",
              width: "200px"
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "13px",
              outline: "none"
            }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Offline">Offline</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingVehicle(null); setFormData({ vehicleId: "", driver: "", status: "Active", speed: 0, fuel: 100, distance: 0, location: { lat: 19.0760, lng: 72.8777 } }); setShowModal(true); }}>
            ➕ Add Vehicle
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Vehicles</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{total}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Active</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{active}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Offline</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#64748b" }}>{offline}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Avg Speed</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{avgSpeed} km/h</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading vehicles...</div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button className="btn btn-secondary" onClick={fetchVehicles} style={{ marginTop: 12 }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚛</div>
          <h3>No Vehicles Found</h3>
          <p>{searchQuery ? "No vehicles match your search." : "Add a new vehicle to get started."}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Speed</th>
                <th>Fuel</th>
                <th>Distance</th>
                <th>Location</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{v.vehicleId}</td>
                  <td>{v.driver || "Unknown"}</td>
                  <td>
                    <span className={`status-badge ${v.status === "Active" ? "status-active" : "status-offline"}`}>
                      {v.status === "Active" ? "🟢 Active" : "⭕ Offline"}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: v.speed > 80 ? "#ef4444" : v.speed > 50 ? "#f59e0b" : "#22c55e" }}>
                      {v.speed || 0} km/h
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                        <div style={{ width: `${v.fuel || 0}%`, height: "100%", background: (v.fuel || 0) > 50 ? "#22c55e" : (v.fuel || 0) > 25 ? "#f59e0b" : "#ef4444", borderRadius: 2 }}></div>
                      </div>
                      {Math.round(v.fuel || 0)}%
                    </div>
                  </td>
                  <td>{(v.distance || 0).toLocaleString()} km</td>
                  <td style={{ fontSize: 11, color: "#64748b" }}>
                    {v.location?.lat?.toFixed(2)}, {v.location?.lng?.toFixed(2)}
                  </td>
                  <td style={{ fontSize: 11, color: "#64748b" }}>
                    {v.lastUpdated ? new Date(v.lastUpdated).toLocaleString() : "N/A"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingVehicle(v); setFormData({ vehicleId: v.vehicleId, driver: v.driver || "", status: v.status, speed: v.speed || 0, fuel: v.fuel || 100, distance: v.distance || 0, location: v.location || { lat: 19.0760, lng: 72.8777 } }); setShowModal(true); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle ID</label>
                <input type="text" required value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} placeholder="e.g., TRUCK-001" />
              </div>
              <div className="form-group">
                <label>Driver</label>
                <input type="text" value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} placeholder="Driver name" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div className="form-group">
                <label>Initial Speed (km/h)</label>
                <input type="number" value={formData.speed} onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Fuel Level (%)</label>
                <input type="number" min="0" max="100" value={formData.fuel} onChange={(e) => setFormData({ ...formData, fuel: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Distance (km)</label>
                <input type="number" value={formData.distance} onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="0.0001" value={formData.location.lat} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, lat: parseFloat(e.target.value) || 0 } })} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="0.0001" value={formData.location.lng} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, lng: parseFloat(e.target.value) || 0 } })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? "💾 Update Vehicle" : "➕ Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Vehicles;