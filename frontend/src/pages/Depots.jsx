import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import API from "../api/axios";

const s = {
  container: { padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  card: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  modalContent: { background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)" }
};

function Depots() {
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", lat: "", lng: "", vehicleCount: 0, availableVehicles: 0, maintenanceVehicles: 0 });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/enterprise/depots");
      setDepots(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        address: form.address,
        location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
        vehicleCount: parseInt(form.vehicleCount) || 0,
        availableVehicles: parseInt(form.availableVehicles) || 0,
        maintenanceVehicles: parseInt(form.maintenanceVehicles) || 0
      };
      if (editing) {
        await API.put(`/enterprise/depots/${editing._id}`, payload);
      } else {
        await API.post("/enterprise/depots", payload);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", address: "", lat: "", lng: "", vehicleCount: 0, availableVehicles: 0, maintenanceVehicles: 0 });
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEdit = (depot) => {
    setEditing(depot);
    setForm({
      name: depot.name,
      address: depot.address || "",
      lat: depot.location?.lat || "",
      lng: depot.location?.lng || "",
      vehicleCount: depot.vehicleCount || 0,
      availableVehicles: depot.availableVehicles || 0,
      maintenanceVehicles: depot.maintenanceVehicles || 0
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", address: "", lat: "", lng: "", vehicleCount: 0, availableVehicles: 0, maintenanceVehicles: 0 });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this depot?")) return;
    try { await API.delete(`/enterprise/depots/${id}`); fetchData(); } catch (err) { alert(err.message); }
  };

  if (loading) return <Layout><div style={s.loading}><div className="loading-spinner"></div> Loading depots...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div></Layout>;

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1>🏭 Fleet Depots</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Manage fleet locations and depots</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Depot</button>
        </div>

        {depots.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">🏭</span><h3>No depots found</h3></div>
        ) : (
          <div style={s.grid3}>
            {depots.map(depot => (
              <div key={depot._id} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>{depot.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{depot.address || "No address"}</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(depot)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(depot._id)}>✕</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-primary)" }}>{depot.vehicleCount || 0}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#22c55e" }}>{depot.availableVehicles || 0}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Available</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#f59e0b" }}>{depot.maintenanceVehicles || 0}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Maintenance</div>
                  </div>
                </div>
                {depot.location?.lat && depot.location?.lng && (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px", textAlign: "center" }}>
                    📍 {depot.location.lat.toFixed(4)}, {depot.location.lng.toFixed(4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={s.modal} onClick={() => setShowModal(false)}>
            <div style={s.modalContent} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? "Edit Depot" : "Add Depot"}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={s.formGroup}><label style={s.label}>Name *</label><input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Address</label><input style={s.input} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Latitude</label><input style={s.input} type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Longitude</label><input style={s.input} type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Vehicle Count</label><input style={s.input} type="number" value={form.vehicleCount} onChange={e => setForm(f => ({ ...f, vehicleCount: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Available Vehicles</label><input style={s.input} type="number" value={form.availableVehicles} onChange={e => setForm(f => ({ ...f, availableVehicles: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Maintenance Vehicles</label><input style={s.input} type="number" value={form.maintenanceVehicles} onChange={e => setForm(f => ({ ...f, maintenanceVehicles: e.target.value }))} /></div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>{editing ? "Update" : "Create"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Depots;