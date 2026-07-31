import "./DashboardCards.css";

function DashboardCards({ vehicles }) {
  const total = vehicles.length;
  const active = vehicles.filter(v => v.status === "Active").length;
  const offline = vehicles.filter(v => v.status === "Offline").length;
  const avgSpeed = total > 0 ? Math.round(vehicles.reduce((a, b) => a + b.speed, 0) / total) : 0;
  const avgFuel = total > 0 ? Math.round(vehicles.reduce((a, b) => a + (b.fuel || 0), 0) / total) : 0;
  const totalDistance = vehicles.reduce((a, b) => a + (b.distance || 0), 0);
  const overspeed = vehicles.filter(v => v.speed > 80).length;
  const healthScore = total > 0 ? Math.round(100 - (offline / total) * 50 - (overspeed / total) * 30) : 0;

  const cards = [
    { icon: "🚛", value: total, label: "Total Vehicles", color: "#6366f1", change: "+2 this week", positive: true },
    { icon: "🟢", value: active, label: "Active", color: "#22c55e", change: `${Math.round((active / (total || 1)) * 100)}% fleet active`, positive: true },
    { icon: "⭕", value: offline, label: "Offline", color: "#64748b", change: `${offline} vehicles offline`, positive: false },
    { icon: "📊", value: `${avgSpeed} km/h`, label: "Avg Speed", color: "#f59e0b", change: overspeed > 0 ? `${overspeed} overspeeding` : "Normal", positive: overspeed === 0 },
    { icon: "⛽", value: `${avgFuel}%`, label: "Avg Fuel", color: "#3b82f6", change: `${totalDistance.toLocaleString()} km total`, positive: true },
    { icon: "❤️", value: `${healthScore}%`, label: "Fleet Health", color: healthScore > 70 ? "#22c55e" : healthScore > 50 ? "#f59e0b" : "#ef4444", change: healthScore > 70 ? "Good" : healthScore > 50 ? "Fair" : "Critical", positive: healthScore > 70 }
  ];

  return (
    <div className="cards">
      {cards.map((card, i) => (
        <div className="card-stats" key={i}>
          <div className="card-stats-header">
            <div className="card-stats-icon" style={{ background: `${card.color}15` }}>
              {card.icon}
            </div>
            <div>
              <div className="card-stats-value">{card.value}</div>
              <div className="card-stats-label">{card.label}</div>
            </div>
          </div>
          <div className={`card-stats-change ${card.positive ? "change-positive" : "change-negative"}`}>
            {card.change}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
