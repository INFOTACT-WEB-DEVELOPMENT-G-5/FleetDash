import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import API from "../api/axios";

const s = {
  container: { padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  card: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" },
  statCard: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", textAlign: "center" },
  filters: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  select: { padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" },
  td: { padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  modalContent: { background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)" }
};

const INCIDENT_TYPES = ["Accident", "Breakdown", "Overspeed", "Geofence Breach", "Unauthorized Movement", "Driver Safety", "Mechanical Issue"];
const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "Investigating", "Resolved", "Closed"];

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: "", severity: "", status: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vehicleId: "", driver: "", type: "Accident", severity: "Medium", description: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.status) params.append("status", filters.status);
      const [incRes, statsRes] = await Promise.allSettled([
        API.get(`/enterprise/incidents?${params}`),
        API.get("/enterprise/incidents/stats")
      ]);
      if (incRes.status === "fulfilled") setIncidents(incRes.value.data.incidents || []);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await API.put(`/enterprise/incidents/${editing._id}`, form);
      } else {
        await API.post("/enterprise/incidents", form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ vehicleId: "", driver: "", type: "Accident", severity: "Medium", description: "" });
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this incident?")) return;
    try {
      await API.delete(`/enterprise/incidents/${id}`);
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({ vehicleId: inc.vehicleId, driver: inc.driver || "", type: inc.type, severity: inc.severity, description: inc.description || "" });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ vehicleId: "", driver: "", type: "Accident", severity: "Medium", description: "" });
    setShowModal(true);
  };

  if (loading) return <Layout><div style={s.loading}><div className="loading-spinner"></div> Loading incidents...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div></Layout>;

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1>🚨 Incident Management</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Track and manage fleet incidents</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Incident</button>
        </div>

        {stats && (
          <div style={s.grid4}>
            <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{stats.total}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total Incidents</div></div>
            <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#f59e0b" }}>{stats.open}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Open</div></div>
            <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>{stats.critical}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Critical</div></div>
            <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#22c55e" }}>{stats.resolved}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Resolved</div></div>
          </div>
        )}

        <div style={s.filters}>
          <select style={s.select} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={s.select} value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={s.select} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {incidents.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">🚨</span><h3>No incidents found</h3><p>No incidents match your current filters.</p></div>
        ) : (
          <div className="table-container">
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Vehicle</th>
                <th style={s.th}>Driver</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Severity</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Actions</th>
              </tr></thead>
              <tbody>
                {incidents.map(inc => (
                  <tr key={inc._id}>
                    <td style={s.td}>{inc.incidentId}</td>
                    <td style={{ ...s.td, fontWeight: 600, color: "var(--text-primary)" }}>{inc.vehicleId}</td>
                    <td style={s.td}>{inc.driver || "N/A"}</td>
                    <td style={s.td}>{inc.type}</td>
                    <td style={s.td}><span className={`status-badge ${inc.severity === "Critical" ? "status-critical" : inc.severity === "High" ? "status-warning" : "status-active"}`}>{inc.severity}</span></td>
                    <td style={s.td}>{inc.status}</td>
                    <td style={s.td}>{inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td style={s.td}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(inc)} style={{ marginRight: "6px" }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inc._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div style={s.modal} onClick={() => setShowModal(false)}>
            <div style={s.modalContent} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? "Edit Incident" : "New Incident"}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Vehicle ID *</label>
                <input style={s.input} value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} placeholder="e.g. VF-1001" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Driver</label>
                <input style={s.input} value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} placeholder="Driver name" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Type *</label>
                <select style={s.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Severity *</label>
                <select style={s.input} value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Description</label>
                <textarea style={{ ...s.input, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the incident..." />
              </div>
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

export default Incidents;