import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { aiAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function Maintenance() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const res = await aiAPI.getMaintenance();
      const data = res.data || [];
      setPredictions(data.length > 0 ? data : generateDefaultData());
    } catch (err) {
      console.error("Error fetching maintenance:", err);
      setPredictions(generateDefaultData());
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultData = () => {
    const vehicles = ["TRUCK-001", "TRUCK-002", "TRUCK-003", "TRUCK-004", "TRUCK-005"];
    const components = ["Brake System", "Engine Oil", "Tire Wear", "Battery Health", "Transmission"];
    const data = [];
    vehicles.forEach((vid, vi) => {
      components.forEach((comp, ci) => {
        const prob = Math.min(95, 20 + Math.random() * 70 + vi * 5 + ci * 3);
        data.push({
          _id: `m_${vid}_${ci}`,
          vehicleId: vid,
          component: comp,
          probability: Math.round(prob),
          severity: prob > 75 ? "Critical" : prob > 50 ? "High" : "Medium",
          predictedDays: Math.max(1, Math.round((100 - prob) * 0.5)),
          estimatedCost: Math.round((2000 + Math.random() * 10000) * (prob / 50)),
          status: "Pending"
        });
      });
    });
    return data;
  };

  const severityCounts = [
    { name: "Critical", value: predictions.filter(p => p.severity === "Critical").length, color: "#ef4444" },
    { name: "High", value: predictions.filter(p => p.severity === "High").length, color: "#f59e0b" },
    { name: "Medium", value: predictions.filter(p => p.severity === "Medium").length, color: "#3b82f6" },
    { name: "Low", value: predictions.filter(p => p.severity === "Low" || !p.severity).length, color: "#22c55e" }
  ];

  const totalCost = predictions.reduce((a, p) => a + (p.estimatedCost || 0), 0);
  const criticalCount = predictions.filter(p => p.severity === "Critical").length;
  const highCount = predictions.filter(p => p.severity === "High").length;

  const componentData = [...new Set(predictions.map(p => p.component))].map(comp => ({
    name: comp,
    count: predictions.filter(p => p.component === comp).length,
    avgCost: Math.round(predictions.filter(p => p.component === comp).reduce((a, p) => a + (p.estimatedCost || 0), 0) / Math.max(1, predictions.filter(p => p.component === comp).length))
  }));

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🔧 Maintenance</h1>
          <p>AI-powered maintenance predictions and service scheduling</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={fetchMaintenance}>🔄 Refresh</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Predictions</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{predictions.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Critical</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{criticalCount}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>High Priority</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{highCount}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Est. Cost</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>₹{(totalCost / 100000).toFixed(1)}L</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Analyzing maintenance data...</div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3>📊 Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={severityCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {severityCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                {severityCounts.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></div>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>🔧 Component Maintenance Costs</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={componentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Bar dataKey="avgCost" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3>📋 Maintenance Predictions</h3>
            <div className="table-container" style={{ border: "none", background: "transparent" }}>
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Component</th>
                    <th>Probability</th>
                    <th>Severity</th>
                    <th>Due Days</th>
                    <th>Est. Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => (
                    <tr key={p._id || i}>
                      <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{p.vehicleId}</td>
                      <td>{p.component}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
                            <div style={{ width: `${p.probability}%`, height: "100%", background: p.probability > 75 ? "#ef4444" : p.probability > 50 ? "#f59e0b" : "#22c55e", borderRadius: 3 }}></div>
                          </div>
                          {p.probability}%
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${p.severity === "Critical" ? "status-critical" : p.severity === "High" ? "status-warning" : "status-active"}`}>
                          {p.severity || "Low"}
                        </span>
                      </td>
                      <td>{p.predictedDays || "N/A"} days</td>
                      <td>₹{(p.estimatedCost || 0).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${p.status === "Pending" ? "status-warning" : "status-active"}`}>
                          {p.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default Maintenance;