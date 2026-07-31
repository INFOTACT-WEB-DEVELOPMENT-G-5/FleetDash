import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { vehiclesAPI } from "../services/api";

function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    driver: "",
    origin: "",
    destination: "",
    status: "Active"
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await vehiclesAPI.getAll();
      const vehiclesData = res.data || [];
      setVehicles(vehiclesData);

      const defaultTrips = [
        { id: "t1", vehicleId: "TRUCK-001", driver: "Rajesh Kumar", origin: "Mumbai Warehouse", destination: "Delhi Distribution", status: "Active", distance: 1420, duration: "18h 30m", startTime: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: "t2", vehicleId: "TRUCK-002", driver: "Priya Singh", origin: "Bangalore Hub", destination: "Chennai Port", status: "Active", distance: 350, duration: "5h 15m", startTime: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: "t3", vehicleId: "TRUCK-003", driver: "Amit Sharma", origin: "Pune Factory", destination: "Nagpur Depot", status: "Completed", distance: 720, duration: "9h 45m", startTime: new Date(Date.now() - 86400000).toISOString() },
        { id: "t4", vehicleId: "TRUCK-004", driver: "Sunil Verma", origin: "Ahmedabad Terminal", destination: "Jaipur Hub", status: "Scheduled", distance: 650, duration: "8h 20m", startTime: new Date(Date.now() + 3600000 * 6).toISOString() },
        { id: "t5", vehicleId: "TRUCK-005", driver: "Anita Patel", origin: "Hyderabad Center", destination: "Kolkata Depot", status: "Active", distance: 1520, duration: "20h 00m", startTime: new Date(Date.now() - 3600000 * 8).toISOString() }
      ];

      const generatedTrips = vehiclesData.slice(0, 10).map((v, i) => ({
        id: v._id || "t_gen_" + i,
        vehicleId: v.vehicleId,
        driver: v.driver || "Unknown",
        origin: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune"][i % 5] + " Hub",
        destination: ["Kolkata", "Ahmedabad", "Jaipur", "Hyderabad", "Lucknow"][i % 5] + " Depot",
        status: i % 3 === 0 ? "Active" : i % 3 === 1 ? "Completed" : "Scheduled",
        distance: Math.floor(Math.random() * 1500) + 100,
        duration: Math.floor(Math.random() * 20) + 2 + "h " + Math.floor(Math.random() * 60) + "m",
        startTime: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
      }));

      setTrips(generatedTrips.length > 0 ? generatedTrips : defaultTrips);
    } catch (err) {
      setError(err.message);
      setTrips([
        { id: "t1", vehicleId: "TRUCK-001", driver: "Rajesh Kumar", origin: "Mumbai Warehouse", destination: "Delhi Distribution", status: "Active", distance: 1420, duration: "18h 30m" },
        { id: "t2", vehicleId: "TRUCK-002", driver: "Priya Singh", origin: "Bangalore Hub", destination: "Chennai Port", status: "Active", distance: 350, duration: "5h 15m" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTrip = {
      ...formData,
      id: editingTrip ? editingTrip.id : "t" + Date.now(),
      distance: Math.floor(Math.random() * 1000) + 100,
      duration: Math.floor(Math.random() * 15) + 2 + "h 00m",
      startTime: new Date().toISOString()
    };
    if (editingTrip) {
      setTrips(trips.map(t => t.id === editingTrip.id ? { ...t, ...newTrip } : t));
    } else {
      setTrips([...trips, newTrip]);
    }
    setShowModal(false);
    setEditingTrip(null);
    setFormData({ vehicleId: "", driver: "", origin: "", destination: "", status: "Active" });
  };

  const handleDelete = (id) => {
    setTrips(trips.filter(t => t.id !== id));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active": return "status-active";
      case "Completed": return "status-warning";
      case "Scheduled": return "status-offline";
      default: return "status-offline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active": return "🟢";
      case "Completed": return "✅";
      case "Scheduled": return "📅";
      default: return "⭕";
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🛣️ Trips</h1>
          <p>Track and manage fleet trips</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => { setEditingTrip(null); setFormData({ vehicleId: "", driver: "", origin: "", destination: "", status: "Active" }); setShowModal(true); }}>
            ➕ New Trip
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading trips...</div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button className="btn btn-secondary" onClick={fetchTrips} style={{ marginTop: 12 }}>Retry</button>
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛣️</div>
          <h3>No Trips Found</h3>
          <p>Create a new trip to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{trip.vehicleId}</td>
                  <td>{trip.driver}</td>
                  <td>{trip.origin}</td>
                  <td>{trip.destination}</td>
                  <td>{trip.distance} km</td>
                  <td>{trip.duration}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(trip.status)}`}>
                      {getStatusIcon(trip.status)} {trip.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingTrip(trip); setFormData({ vehicleId: trip.vehicleId, driver: trip.driver, origin: trip.origin, destination: trip.destination, status: trip.status }); setShowModal(true); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(trip.id)}>🗑️</button>
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
              <h2>{editingTrip ? "Edit Trip" : "Create Trip"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle</label>
                <select value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v.vehicleId}>{v.vehicleId}</option>
                  ))}
                  <option value="TRUCK-001">TRUCK-001</option>
                  <option value="TRUCK-002">TRUCK-002</option>
                  <option value="TRUCK-003">TRUCK-003</option>
                </select>
              </div>
              <div className="form-group">
                <label>Driver</label>
                <input type="text" required value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} placeholder="Driver name" />
              </div>
              <div className="form-group">
                <label>Origin</label>
                <input type="text" required value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} placeholder="Starting location" />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input type="text" required value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="End location" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTrip ? "💾 Update" : "🚀 Create Trip"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Trips;