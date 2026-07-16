import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { vehiclesAPI } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";

function Telemetry() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setTelemetryHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          speed: Math.floor(Math.random() * 100),
          fuel: Math.floor(Math.random() * 100),
          temperature: Math.floor(Math.random() * 40) + 60
        };
        return [...prev.slice(-20), newPoint];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await vehiclesAPI.getAll();
      const data = res.data || [];
      setVehicles(data);
      if (data.length > 0) setSelectedVehicle(data[0]);
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateHistory = () => {
    const history = [];
    for (let i = 20; i >= 0; i--) {
      const time = new Date(Date.now() - i * 3000);
      history.push({
        time: time.toLocaleTimeString(),
        speed: Math.floor(Math.random() * 100),
        fuel: Math.floor(Math.random() * 100),
        temperature: Math.floor(Math.random() * 40) + 60
      });
    }
    setTelemetryHistory(history);
  };

  useEffect(() => {
    if (vehicles.length > 0) generateHistory();
  }, [vehicles]);

  const stats = [
    { label: "Events/sec", value: "1,247", icon: "⚡", color: "#6366f1" },
    { label: "Data Points", value: "2.4M", icon: "💾", color: "#22c55e" },
    { label: "Active Streams", value: vehicles.filter(v => v.status === "Active").length.toString(), icon: "📡", color: "#3b82f6" },
    { label: "Avg Latency", value: "12ms", icon: "⚡", color: "#f59e0b" }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>📡 Telemetry</h1>
          <p>Real-time vehicle telemetry data streaming</p>
        </div>
        <div className="page-header-right">
          <select
            value={selectedVehicle?._id || ""}
            onChange={(e) => {
              const v = vehicles.find(v => v._id === e.target.value);
              setSelectedVehicle(v);
              generateHistory();
            }}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "13px",
              outline: "none"
            }}
          >
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>{v.vehicleId}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <div className="card" key={i} style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${stat.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading telemetry...</div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3>📊 Speed Telemetry</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={telemetryHistory}>
                  <defs>
                    <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="speed" stroke="#6366f1" fill="url(#speedGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3>⛽ Fuel Telemetry</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={telemetryHistory}>
                  <defs>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#1a2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="fuel" stroke="#22c55e" fill="url(#fuelGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3>📋 Live Telemetry Data</h3>
            <div className="table-container" style={{ border: "none", background: "transparent" }}>
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Speed</th>
                    <th>Fuel</th>
                    <th>Temperature</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 10).map((v) => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{v.vehicleId}</td>
                      <td>{v.speed} km/h</td>
                      <td>{Math.round(v.fuel)}%</td>
                      <td>{Math.floor(Math.random() * 40) + 60}°C</td>
                      <td>
                        <span className={`status-badge ${v.status === "Active" ? "status-active" : "status-offline"}`}>
                          {v.status}
                        </span>
                      </td>
                      <td>{new Date(v.lastUpdated).toLocaleTimeString()}</td>
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

export default Telemetry;