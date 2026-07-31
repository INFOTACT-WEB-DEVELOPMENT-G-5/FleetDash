import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import API from "../api/axios";

const s = {
  container: { padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  filters: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  select: { padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" },
  input: { padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none", width: "200px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" },
  td: { padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)" }
};

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ user: "", action: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.user) params.append("user", filters.user);
      if (filters.action) params.append("action", filters.action);
      params.append("limit", "100");
      const res = await API.get(`/ai/audit?${params}`);
      setLogs(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  if (loading) return <Layout><div style={s.loading}><div className="loading-spinner"></div> Loading audit logs...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div></Layout>;

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1>📋 Audit Log</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>System activity and audit trail</p>
          </div>
        </div>

        <div style={s.filters}>
          <input style={s.input} placeholder="Filter by user..." value={filters.user} onChange={e => setFilters(f => ({ ...f, user: e.target.value }))} />
          <input style={s.input} placeholder="Filter by action..." value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} />
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ user: "", action: "" })}>Clear</button>
        </div>

        {logs.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">📋</span><h3>No audit logs found</h3></div>
        ) : (
          <div className="table-container">
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>User</th>
                <th style={s.th}>Action</th>
                <th style={s.th}>Resource</th>
                <th style={s.th}>Details</th>
                <th style={s.th}>IP</th>
                <th style={s.th}>Timestamp</th>
              </tr></thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id || i}>
                    <td style={{ ...s.td, fontWeight: 500, color: "var(--text-primary)" }}>{log.user}</td>
                    <td style={s.td}>{log.action}</td>
                    <td style={s.td}>{log.resource || "—"}</td>
                    <td style={s.td}>{log.details || "—"}</td>
                    <td style={s.td}>{log.ip || "—"}</td>
                    <td style={s.td}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AuditLog;