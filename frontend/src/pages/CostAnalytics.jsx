import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import API from "../api/axios";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const s = {
  container: { padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  card: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" },
  statCard: { background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", textAlign: "center" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)" }
};

const COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#8b5cf6"];

function formatINR(amount) {
  if (!amount && amount !== 0) return "₹0";
  const num = Math.round(amount);
  const str = num.toString();
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  if (rest === "") return `₹${last3}`;
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${formatted},${last3}`;
}

function CostAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/enterprise/costs/analytics");
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Layout><div style={s.loading}><div className="loading-spinner"></div> Loading cost analytics...</div></Layout>;
  if (error) return <Layout><div className="error-state"><p>Error: {error}</p><button className="btn btn-primary" onClick={fetchData}>Retry</button></div></Layout>;
  if (!data) return <Layout><div className="empty-state"><h3>No data available</h3></div></Layout>;

  const byTypeData = (data.byType || []).map(d => ({ name: d._id, value: d.total, count: d.count }));
  const byVehicleData = (data.byVehicle || []).map(d => ({ name: d._id, value: d.total }));
  const monthlyData = (data.monthlyTrends || []).map(d => ({ month: d._id, cost: d.total }));

  return (
    <Layout>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h1>💰 Fleet Cost Analytics</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Financial overview and cost tracking</p>
          </div>
        </div>

        <div style={s.grid4}>
          <div style={s.statCard}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-primary)" }}>{formatINR(data.totalCost)}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total Cost</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#22c55e" }}>₹{data.costPerKm?.toFixed(2) || "0.00"}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Cost per Km</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#3b82f6" }}>{(data.totalDistance || 0).toLocaleString()} km</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Total Distance</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#f59e0b" }}>{data.byType?.length || 0}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Cost Categories</div>
          </div>
        </div>

        <div style={s.grid2}>
          <div style={s.card}>
            <h3 style={{ marginBottom: "16px" }}>Cost by Type</h3>
            {byTypeData.length === 0 ? <div className="empty-state" style={{ minHeight: "200px" }}><p>No data</p></div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byTypeData}>
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }} formatter={(v) => formatINR(v)} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={s.card}>
            <h3 style={{ marginBottom: "16px" }}>Cost Distribution</h3>
            {byTypeData.length === 0 ? <div className="empty-state" style={{ minHeight: "200px" }}><p>No data</p></div> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={byTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {byTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }} formatter={(v) => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={s.card}>
            <h3 style={{ marginBottom: "16px" }}>Monthly Cost Trends</h3>
            {monthlyData.length === 0 ? <div className="empty-state" style={{ minHeight: "200px" }}><p>No data</p></div> : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }} formatter={(v) => formatINR(v)} />
                  <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={s.card}>
            <h3 style={{ marginBottom: "16px" }}>Cost by Vehicle</h3>
            {byVehicleData.length === 0 ? <div className="empty-state" style={{ minHeight: "200px" }}><p>No data</p></div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byVehicleData} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 12 }} width={80} />
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }} formatter={(v) => formatINR(v)} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CostAnalytics;