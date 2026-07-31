import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import API from "../api/axios";

const s = {
  container: { padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
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

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "Assigned", "In Progress", "Waiting Parts", "Completed", "Cancelled"];

function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vehicleId: "", issue: "", priority: "Medium", assignedTechnician: "", workshop: "", estimatedCost: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      const res = await API.get(`/enterprise/work-orders?${params}`);
      setWorkOrders(res.data.workOrders || []);
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
        await API.put(`/enterprise/work-orders/${editing._id}`, form);
      } else {
        await API.post("/enterprise/work-orders", form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ vehicleId: "", issue: "", priority: "Medium", assignedTechnician: "", workshop: "", estimatedCost: "" });
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEdit = (wo) => {
    setEditing(wo);
    setForm({ vehicleId: wo.vehicleId, issue: wo.issue, priority: wo.priority, assignedTechnician: wo.assignedTechnician || "", workshop: wo.workshop || "", estimatedCost: wo.estimatedCost || "" });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ vehicleId: "", issue: "", priority: "Medium", assignedTechnician: "", workshop: "", estimatedCost: "" });
    setShowModal(true);
  };

  if (loading) return <Layout><div style={s.loading}><div className="loading-spinner"></div> Loading work orders...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div></Layout>;

  const total = workOrders.length;
  const open = workOrders.filter(w => w.status === "Open" || w.status === "Assigned").length;
  const inProgress = workOrders.filter(w => w.status === "In Progress" || w.status === "Waiting Parts").length;
  const completed = workOrders.filter(w => w.status === "Completed").length;

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1>🔧 Work Orders</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Manage maintenance work orders</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Work Order</button>
        </div>

        <div style={s.grid4}>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{total}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total</div></div>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#f59e0b" }}>{open}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Open</div></div>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#3b82f6" }}>{inProgress}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>In Progress</div></div>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#22c55e" }}>{completed}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Completed</div></div>
        </div>

        <div style={s.filters}>
          <select style={s.select} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={s.select} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {workOrders.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">🔧</span><h3>No work orders found</h3></div>
        ) : (
          <div className="table-container">
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Vehicle</th>
                <th style={s.th}>Issue</th>
                <th style={s.th}>Priority</th>
                <th style={s.th}>Technician</th>
                <th style={s.th}>Est. Cost</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr></thead>
              <tbody>
                {workOrders.map(wo => (
                  <tr key={wo._id}>
                    <td style={s.td}>{wo.workOrderId}</td>
                    <td style={{ ...s.td, fontWeight: 600, color: "var(--text-primary)" }}>{wo.vehicleId}</td>
                    <td style={s.td}>{wo.issue}</td>
                    <td style={s.td}><span className={`status-badge ${wo.priority === "Critical" ? "status-critical" : wo.priority === "High" ? "status-warning" : "status-active"}`}>{wo.priority}</span></td>
                    <td style={s.td}>{wo.assignedTechnician || "Unassigned"}</td>
                    <td style={s.td}>₹{(wo.estimatedCost || 0).toLocaleString()}</td>
                    <td style={s.td}>{wo.status}</td>
                    <td style={s.td}><button className="btn btn-secondary btn-sm" onClick={() => openEdit(wo)}>Edit</button></td>
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
                <h2>{editing ? "Edit Work Order" : "New Work Order"}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={s.formGroup}><label style={s.label}>Vehicle ID *</label><input style={s.input} value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Issue *</label><input style={s.input} value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Priority</label><select style={s.input} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div style={s.formGroup}><label style={s.label}>Technician</label><input style={s.input} value={form.assignedTechnician} onChange={e => setForm(f => ({ ...f, assignedTechnician: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Workshop</label><input style={s.input} value={form.workshop} onChange={e => setForm(f => ({ ...f, workshop: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Estimated Cost (₹)</label><input style={s.input} type="number" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} /></div>
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

export default WorkOrders;