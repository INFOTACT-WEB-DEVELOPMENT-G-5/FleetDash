import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css";
import { useEffect, useState } from "react";
import useVehicles from "../../hooks/useVehicles";
import L from "leaflet";

// Custom vehicle icon factory
const createVehicleIcon = (status, speed) => {
  let color;
  let vehicleType;
  if (status === "Offline") {
    color = "#64748b";
    vehicleType = "truck";
  } else if (speed > 80) {
    color = "#ef4444";
    vehicleType = "truck";
  } else if (speed > 50) {
    color = "#f59e0b";
    vehicleType = "truck";
  } else {
    color = "#22c55e";
    vehicleType = "truck";
  }

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="36" height="36">
      <g transform="translate(24,24)">
        <rect x="-14" y="-10" width="28" height="16" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <rect x="-8" y="-14" width="16" height="6" rx="2" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <rect x="8" y="-6" width="10" height="8" rx="1" fill="${color}" stroke="#fff" stroke-width="1" opacity="0.8"/>
        <circle cx="-8" cy="8" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
        <circle cx="8" cy="8" r="4" fill="#fff" stroke="${color}" stroke-width="1.5"/>
        <rect x="-8" y="-3" width="3" height="5" rx="0.5" fill="#fff" opacity="0.5"/>
        <rect x="5" y="-3" width="4" height="5" rx="0.5" fill="#fff" opacity="0.3"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    className: "vehicle-marker-icon",
    html: svgIcon,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

function LiveMap({ vehicles: propVehicles }) {
  const { vehicles: hookVehicles } = useVehicles();
  const vehicles = propVehicles || hookVehicles;
  const [mapVehicles, setMapVehicles] = useState([]);

  useEffect(() => {
    setMapVehicles(vehicles);
  }, [vehicles]);

  const center = mapVehicles.length > 0 && mapVehicles[0].location
    ? [mapVehicles[0].location.lat, mapVehicles[0].location.lng]
    : [11.0168, 76.9558];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>🗺️ Live Fleet Map</h3>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748b" }}>
          <span><span style={{ color: "#22c55e" }}>●</span> Active</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Warning</span>
          <span><span style={{ color: "#ef4444" }}>●</span> Overspeed</span>
          <span><span style={{ color: "#64748b" }}>●</span> Offline</span>
        </div>
      </div>
      <div className="map-wrapper" style={{ height: 400 }}>
        <MapContainer center={center} zoom={5} className="map" style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapVehicles.map((vehicle) =>
            vehicle.location && (
              <Marker
                key={vehicle._id}
                position={[vehicle.location.lat, vehicle.location.lng]}
                icon={createVehicleIcon(vehicle.status, vehicle.speed)}
              >
                <Popup>
                  <div style={{ fontFamily: "Inter, sans-serif", minWidth: 200 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 15, color: "#1a2332", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                      🚛 {vehicle.vehicleId}
                    </h4>
                    <div style={{ fontSize: 12, color: "#475569", lineHeight: 2 }}>
                      <div><strong>👤 Driver:</strong> {vehicle.driver || "Unknown"}</div>
                      <div><strong>📊 Speed:</strong> <span style={{ color: vehicle.speed > 80 ? "#ef4444" : vehicle.speed > 50 ? "#f59e0b" : "#22c55e", fontWeight: 600 }}>{vehicle.speed || 0} km/h</span></div>
                      <div><strong>⛽ Fuel:</strong> {Math.round(vehicle.fuel || 0)}%</div>
                      <div><strong>📍 Location:</strong> {vehicle.location.lat?.toFixed(4)}, {vehicle.location.lng?.toFixed(4)}</div>
                      <div><strong>📡 Status:</strong> <span style={{ color: vehicle.status === "Active" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{vehicle.status}</span></div>
                      <div><strong>📞 Contact:</strong> {vehicle.phone || "+91-9876543210"}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default LiveMap;