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
  loading: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)" },
  warning: { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" },
  critical: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }
};

const DOC_TYPES = ["Insurance", "Registration", "Fitness Certificate", "Pollution Certificate", "Driving License", "Medical Certificate", "Training Certificate"];

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [expiryData, setExpiryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vehicleId: "", type: "Insurance", documentNumber: "", issueDate: "", expiryDate: "", notes: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      const [docRes, expRes] = await Promise.allSettled([
        API.get(`/enterprise/documents?${params}`),
        API.get("/enterprise/documents/expiring")
      ]);
      if (docRes.status === "fulfilled") setDocuments(docRes.value.data.documents || []);
      if (expRes.status === "fulfilled") setExpiryData(expRes.value.data);
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
        await API.put(`/enterprise/documents/${editing._id}`, form);
      } else {
        await API.post("/enterprise/documents", form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ vehicleId: "", type: "Insurance", documentNumber: "", issueDate: "", expiryDate: "", notes: "" });
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try { await API.delete(`/enterprise/documents/${id}`); fetchData(); } catch (err) { alert(err.message); }
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({ vehicleId: doc.vehicleId || "", type: doc.type, documentNumber: doc.documentNumber || "", issueDate: doc.issueDate ? doc.issueDate.split("T")[0] : "", expiryDate: doc.expiryDate ? doc.expiryDate.split("T")[0] : "", notes: doc.notes || "" });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ vehicleId: "", type: "Insurance", documentNumber: "", issueDate: "", expiryDate: "", notes: "" });
    setShowModal(true);
  };

  if (loading) return <Layout><div style={s.loading}><div className="loading-spinner"></div> Loading documents...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div></Layout>;

  const total = documents.length;
  const valid = documents.filter(d => d.status === "Valid").length;
  const expiring = documents.filter(d => d.status === "Expiring Soon").length;
  const expired = documents.filter(d => d.status === "Expired").length;

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1>📄 Document Management</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Track vehicle and driver documents & expiry</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Document</button>
        </div>

        {expiryData && expiryData.expiredCount > 0 && (
          <div style={s.critical}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div><strong style={{ color: "#ef4444" }}>{expiryData.expiredCount} document(s) expired!</strong><p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px" }}>Immediate renewal required to avoid compliance issues.</p></div>
          </div>
        )}
        {expiryData && expiryData.expiringCount > 0 && (
          <div style={s.warning}>
            <span style={{ fontSize: "24px" }}>⏰</span>
            <div><strong style={{ color: "#f59e0b" }}>{expiryData.expiringCount} document(s) expiring soon</strong><p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px" }}>Renew within 30 days to avoid expiry.</p></div>
          </div>
        )}

        <div style={s.grid4}>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{total}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total</div></div>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#22c55e" }}>{valid}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Valid</div></div>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#f59e0b" }}>{expiring}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Expiring Soon</div></div>
          <div style={s.statCard}><div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>{expired}</div><div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Expired</div></div>
        </div>

        <div style={s.filters}>
          <select style={s.select} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={s.select} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">📄</span><h3>No documents found</h3></div>
        ) : (
          <div className="table-container">
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>Vehicle</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Document No.</th>
                <th style={s.th}>Issue Date</th>
                <th style={s.th}>Expiry Date</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr></thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc._id}>
                    <td style={{ ...s.td, fontWeight: 600, color: "var(--text-primary)" }}>{doc.vehicleId || "N/A"}</td>
                    <td style={s.td}>{doc.type}</td>
                    <td style={s.td}>{doc.documentNumber || "N/A"}</td>
                    <td style={s.td}>{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : "N/A"}</td>
                    <td style={s.td}>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "N/A"}</td>
                    <td style={s.td}><span className={`status-badge ${doc.status === "Valid" ? "status-active" : doc.status === "Expiring Soon" ? "status-warning" : "status-critical"}`}>{doc.status}</span></td>
                    <td style={s.td}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)} style={{ marginRight: "6px" }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc._id)}>Delete</button>
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
                <h2>{editing ? "Edit Document" : "Add Document"}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={s.formGroup}><label style={s.label}>Vehicle ID</label><input style={s.input} value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Type</label><select style={s.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div style={s.formGroup}><label style={s.label}>Document Number</label><input style={s.input} value={form.documentNumber} onChange={e => setForm(f => ({ ...f, documentNumber: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Issue Date</label><input style={s.input} type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Expiry Date *</label><input style={s.input} type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
              <div style={s.formGroup}><label style={s.label}>Notes</label><textarea style={{ ...s.input, minHeight: "60px" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
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

export default Documents;