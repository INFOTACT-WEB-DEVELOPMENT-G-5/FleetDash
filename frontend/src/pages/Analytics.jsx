import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { aiAPI } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import "./Analytics.css";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await aiAPI.getFleetAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="analytics-loading">
          <div className="skeleton-card" style={{ height: 200 }}></div>
          <div className="skeleton-card" style={{ height: 300 }}></div>
          <div className="skeleton-card" style={{ height: 300 }}></div>
        </div>
      </Layout>
    );
  }

  const costData = [
    { name: "Fuel", current: analytics?.predictions?.nextMonthFuelCost || 0, projected: (analytics?.predictions?.nextMonthFuelCost || 0) * 1.1 },
    { name: "Maintenance", current: analytics?.predictions?.nextMonthMaintenanceCost || 0, projected: (analytics?.predictions?.nextMonthMaintenanceCost || 0) * 1.15 }
  ];

  const efficiencyData = [
    { name: "Efficiency", value: analytics?.predictions?.fleetEfficiency || 70 },
    { name: "Room for Growth", value: 100 - (analytics?.predictions?.fleetEfficiency || 70) }
  ];

  const COLORS = ["#22c55e", "#1e293b"];

  return (
    <Layout>
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>📊 Fleet Analytics Intelligence</h1>
          <p>AI-powered cost prediction and fleet performance trends</p>
        </div>

        <div className="analytics-predictions">
          <div className="prediction-card">
            <div className="pred-icon">⛽</div>
            <div className="pred-content">
              <span className="pred-label">Predicted Fuel Cost (Month)</span>
              <span className="pred-value">₹{(analytics?.predictions?.nextMonthFuelCost || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="prediction-card">
            <div className="pred-icon">🔧</div>
            <div className="pred-content">
              <span className="pred-label">Predicted Maintenance (Month)</span>
              <span className="pred-value">₹{(analytics?.predictions?.nextMonthMaintenanceCost || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="prediction-card">
            <div className="pred-icon">📈</div>
            <div className="pred-content">
              <span className="pred-label">Fleet Efficiency</span>
              <span className="pred-value">{analytics?.predictions?.fleetEfficiency || 0}%</span>
            </div>
          </div>
          <div className="prediction-card">
            <div className="pred-icon">💰</div>
            <div className="pred-content">
              <span className="pred-label">Cost Per Km</span>
              <span className="pred-value">₹{analytics?.predictions?.projectedCostPerKm || 0}</span>
            </div>
          </div>
        </div>

        <div className="analytics-charts">
          <div className="chart-card">
            <h3>Cost Prediction (Monthly)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projected" fill="#f97316" name="Projected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Fleet Efficiency Score</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={efficiencyData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={5}>
                  {efficiencyData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-label-center">
              <span className="pie-score">{analytics?.predictions?.fleetEfficiency || 0}%</span>
            </div>
          </div>
        </div>

        <div className="analytics-trends">
          <h3>Performance Trends</h3>
          <div className="trend-grid">
            <div className={`trend-item ${analytics?.trends?.fuelTrend === "decreasing" ? "good" : "warning"}`}>
              <span className="trend-icon">{analytics?.trends?.fuelTrend === "decreasing" ? "📉" : "📈"}</span>
              <div>
                <div className="trend-label">Fuel Trend</div>
                <div className="trend-value">{analytics?.trends?.fuelTrend === "decreasing" ? "Improving" : "Increasing"}</div>
              </div>
            </div>
            <div className={`trend-item ${analytics?.trends?.maintenanceTrend === "stable" ? "good" : "warning"}`}>
              <span className="trend-icon">{analytics?.trends?.maintenanceTrend === "stable" ? "✅" : "⚠️"}</span>
              <div>
                <div className="trend-label">Maintenance Trend</div>
                <div className="trend-value">{analytics?.trends?.maintenanceTrend === "stable" ? "Stable" : "Increasing"}</div>
              </div>
            </div>
            <div className="trend-item good">
              <span className="trend-icon">📊</span>
              <div>
                <div className="trend-label">Quarterly Fuel Cost</div>
                <div className="trend-value">₹{(analytics?.predictions?.quarterlyFuelCost || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="trend-item good">
              <span className="trend-icon">🔧</span>
              <div>
                <div className="trend-label">Quarterly Maintenance</div>
                <div className="trend-value">₹{(analytics?.predictions?.quarterlyMaintenanceCost || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;