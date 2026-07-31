import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "./DashboardCharts.css";
import { useState, useEffect } from "react";

function DashboardCharts({ vehicles }) {
  const [speedHistory, setSpeedHistory] = useState([]);

  useEffect(() => {
    const history = [];
    for (let i = 20; i >= 0; i--) {
      history.push({
        time: `${i * 5}s ago`,
        speed: Math.floor(Math.random() * 80 + 20),
        fuel: Math.floor(Math.random() * 60 + 20)
      });
    }
    setSpeedHistory(history);
  }, [vehicles]);

  const speedData = vehicles.map(v => ({
    name: v.vehicleId?.slice(-4) || "N/A",
    speed: v.speed || 0
  })).slice(0, 15);

  const fuelData = [
    { name: "0-25%", value: vehicles.filter(v => (v.fuel || 0) <= 25).length, color: "#ef4444" },
    { name: "25-50%", value: vehicles.filter(v => (v.fuel || 0) > 25 && (v.fuel || 0) <= 50).length, color: "#f59e0b" },
    { name: "50-75%", value: vehicles.filter(v => (v.fuel || 0) > 50 && (v.fuel || 0) <= 75).length, color: "#3b82f6" },
    { name: "75-100%", value: vehicles.filter(v => (v.fuel || 0) > 75).length, color: "#22c55e" }
  ];

  const statusData = [
    { name: "Active", value: vehicles.filter(v => v.status === "Active").length, color: "#22c55e" },
    { name: "Offline", value: vehicles.filter(v => v.status === "Offline").length, color: "#64748b" }
  ];

  const distanceData = vehicles.slice(0, 10).map(v => ({
    name: v.vehicleId?.slice(-4) || "N/A",
    distance: Math.round((v.distance || 0) / 100)
  }));

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>📊 Vehicle Speed Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={speedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar dataKey="speed" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>⛽ Fuel Level Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={fuelData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
              {fuelData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Legend formatter={(val) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{val}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>📈 Telemetry Throughput</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={speedHistory}>
            <defs>
              <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="speed" stroke="#6366f1" fill="url(#colorSpeed)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>📏 Distance Analytics</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={distanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar dataKey="distance" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardCharts;