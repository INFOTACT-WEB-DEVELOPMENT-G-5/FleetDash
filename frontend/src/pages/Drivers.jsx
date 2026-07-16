import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { vehiclesAPI } from "../services/api";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    experience: "",
    status: "Available"
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await vehiclesAPI.getAll();
      const vehicles = res.data || [];
      const driverMap = {};
      vehicles.forEach(v => {
        if (v.driver && v.driver !== "Unknown") {
          const key = v.driver;
          if (!driverMap[key]) {
            driverMap[key] = {
              id: v._id,
              name: v.driver,
              vehicleId: v.vehicleId,
              status: v.status,
              speed: v.speed || 0,
              fuel: v.fuel || 0,
              score: Math.floor(Math.random() * 40) + 60
            };
          }
        }
      });
      // Add some default drivers if none exist
      const defaultDrivers = [
        { id: "d1", name: "Rajesh Kumar", vehicleId: "TRUCK-001", status: "Active", speed: 65, fuel: 72, score: 92, email: "rajesh@fleet.com", phone: "+91-9876543210", licenseNumber: "DL-2024-001", experience: 8 },
        { id: "d2", name: "Priya Singh", vehicleId: "TRUCK-002", status: "Active", speed: 55, fuel: 80, score: 88, email: "priya@fleet.com", phone: "+91-9876543211", licenseNumber: "DL-2024-002", experience: 5 },
        { id: "d3", name: "Amit Sharma", vehicleId: "TRUCK-003", status: "Offline", speed: 0, fuel: 45, score: 75, email: "amit@fleet.com", phone: "+91-9876543212", licenseNumber: "DL-2024-003", experience: 10 },
        { id: "d4", name: "Sunil Verma", vehicleId: "TRUCK-004", status: "Active", speed: 82, fuel: 35, score: 62, email: "sunil@fleet.com", phone: "+91-9876543213", licenseNumber: "DL-2024-004", experience: 3 },
        { id: "d5", name: "Anita Patel", vehicleId: "TRUCK-005", status: "Active", speed: 45, fuel: 90, score: 95, email: "anita@fleet.com", phone: "+91-9876543214", licenseNumber: "DL-2024-005", experience: 7 }
      ];
      const combined = Object.values(driverMap).length > 0 ? Object.values(driverMap) : defaultDrivers;
      setDrivers(combined);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newDriver = {
      ...formData,
      id: editingDriver ? editingDriver.id : "d" + Date.now(),
      score: Math.floor(Math.random() * 40) + 60,
      vehicleId: formData.vehicleId || "Unassigned",
      status: formData.status === "Available" ? "Offline" : "Active"
    };
    if (editingDriver) {
      setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...d, ...newDriver } : d));
    } else {
      setDrivers([...drivers, newDriver]);
    }
    setShowModal(false);
    setEditingDriver(null);
    setFormData({ name: "", email: "", phone: "", licenseNumber: "", experience: "", status: "Available" });
  };

  const handleDelete = (id) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email || "",
      phone: driver.phone || "",
      licenseNumber: driver.licenseNumber || "",
      experience: driver.experience?.toString() || "",
      status: driver.status === "Active" ? "Available" : "Offline"
    });
    setShowModal(true);
  };

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.vehicleId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>👤 Drivers</h1>
          <p>Manage fleet drivers and their performance</p>
        </div>
        <div className="page-header-right">
          <input
            type="text"
            placeholder="Search drivers..."
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
              width: "220px"
            }}
          />
          <button className="btn btn-primary" onClick={() => { setEditingDriver(null); setFormData({ name: "", email: "", phone: "", licenseNumber: "", experience: "", status: "Available" }); setShowModal(true); }}>
            ➕ Add Driver
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          Loading drivers...
        </div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button className="btn btn-secondary" onClick={fetchDrivers} style={{ marginTop: 12 }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>No Drivers Found</h3>
          <p>Add a new driver to get started.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((driver) => (
            <div className="card" key={driver.id} style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px"
                }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>{driver.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{driver.vehicleId || "Unassigned"}</div>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: getScoreColor(driver.score),
                  background: `${getScoreColor(driver.score)}15`,
                  border: `2px solid ${getScoreColor(driver.score)}30`
                }}>
                  {driver.score}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</div>
                  <span className={`status-badge ${driver.status === "Active" ? "status-active" : "status-offline"}`}>
                    {driver.status === "Active" ? "🟢 Active" : "⭕ Offline"}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Speed</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{driver.speed} km/h</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fuel</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{Math.round(driver.fuel)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Experience</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{driver.experience || "N/A"} yrs</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(driver)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(driver.id)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter driver name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input type="text" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="Enter license number" />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} placeholder="Years of experience" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDriver ? "💾 Update Driver" : "➕ Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Drivers;