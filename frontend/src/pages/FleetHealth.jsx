import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { vehiclesAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function FleetHealth() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await vehiclesAPI.getAll();
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Fleet health fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const vehicleHealth = vehicles.map(v => {
    const speedScore = Math.max(0, 100 - (v.speed > 80 ? 30 : v.speed > 60 ? 15 : 0));
    const fuelScore = Math.max(0, (v.fuel || 50));
    const mileageScore = Math.max(0, 100 - Math.min(60, (v.distance || 0) / 300));
    const overallScore = Math.round((speedScore + fuelScore + mileageScore) / 3);
    return {
      ...v,
      speedScore,
      fuelScore,
      mileageScore,
      overallScore,
      status: overallScore > 75 ? "Healthy" : overallScore > 50 ? "Warning" : "Critical"
    };
  });

  const healthy = vehicleHealth.filter(v => v.status === "Healthy").length;
  const warning = vehicleHealth.filter(v => v.status === "Warning").length;
  const critical = vehicleHealth.filter(v => v.status === "Critical").length;
  const avgScore = vehicleHealth.length > 0
    ? Math.round(vehicleHealth.reduce((a, v) => a + v.overallScore, 0) / vehicleHealth.length)
    : 0;

  const statusColors = { Healthy: "#22c55e", Warning: "#f59e0b", Critical: "#ef4444" };

  const chartData = vehicleHealth.slice(0, 15).map(v => ({
    name: v.vehicleId?.slice(-4) || "N/A",
    score: v.overallScore,
    fill: v.overallScore > 75 ? "#22c55e" : v.overallScore > 50 ? "#f59e0b" : "#ef4444"
  }));

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>❤️ Fleet Health</h1>
          <p>Real-time fleet health monitoring and diagnostics</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16, borderLeft: "3px solid #6366f1" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Fleet Health Score</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: avgScore > 75 ? "#22c55e" : avgScore > 50 ? "#f59e0b" : "#ef4444" }}>{avgScore}%</div>
        </div>
        <div className="card" style={{ padding: 16, borderLeft: "3px solid #22c55e" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Healthy</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>{healthy}</div>
        </div>
        <div className="card" style={{ padding: 16, borderLeft: "3px solid #f59e0b" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Warning</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f59e0b" }}>{warning}</div>
        </div>
        <div className="card" style={{ padding: 16, borderLeft: "3px solid #ef4444" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Critical</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#ef4444" }}>{critical}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Analyzing fleet health...</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3>📊 Vehicle Health Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-3">
            {vehicleHealth.map((v) => (
              <div className="card" key={v._id} style={{
                padding: 20,
                borderLeft: `3px solid ${statusColors[v.status]}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{v.vehicleId}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{v.driver || "Unknown"}</div>
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700,
                    color: statusColors[v.status],
                    background: `${statusColors[v.status]}15`,
                    border: `2px solid ${statusColors[v.status]}30`
                  }}>
                    {v.overallScore}%
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  {[
                    { label: "Engine Health", score: v.speedScore, color: v.speedScore > 75 ? "#22c55e" : "#f59e0b" },
                    { label: "Fuel System", score: v.fuelScore, color: v.fuelScore > 75 ? "#22c55e" : "#f59e0b" },
                    { label: "Mileage", score: v.mileageScore, color: v.mileageScore > 75 ? "#22c55e" : "#f59e0b" }
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                        <span>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 600 }}>{item.score}%</span>
                      </div>
                      <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                        <div style={{ width: `${item.score}%`, height: "100%", background: item.color, borderRadius: 2 }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <span className={`status-badge ${v.status === "Healthy" ? "status-active" : v.status === "Warning" ? "status-warning" : "status-critical"}`}>
                  {v.status === "Healthy" ? "🟢" : v.status === "Warning" ? "🟡" : "🔴"} {v.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}

export default FleetHealth;