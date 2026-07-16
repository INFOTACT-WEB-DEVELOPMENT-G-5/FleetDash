import { useNavigate } from "react-router-dom";
import "./VehicleTable.css";

function VehicleTable({ vehicles }) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>🚛 Vehicle Overview</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/vehicles")}>View All</button>
      </div>
      <div className="table-container" style={{ border: "none", background: "transparent" }}>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Speed</th>
              <th>Fuel</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.slice(0, 10).map((v) => (
              <tr key={v._id} style={{ cursor: "pointer" }} onClick={() => navigate("/vehicles")}>
                <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{v.vehicleId}</td>
                <td>{v.driver || "Unknown"}</td>
                <td>
                  <span className={`status-badge ${v.status === "Active" ? "status-active" : "status-offline"}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <span style={{ color: v.speed > 80 ? "#ef4444" : v.speed > 50 ? "#f59e0b" : "#22c55e" }}>
                    {v.speed || 0} km/h
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                      <div style={{ width: `${v.fuel || 0}%`, height: "100%", background: (v.fuel || 0) > 50 ? "#22c55e" : (v.fuel || 0) > 25 ? "#f59e0b" : "#ef4444", borderRadius: 2 }}></div>
                    </div>
                    {Math.round(v.fuel || 0)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VehicleTable;