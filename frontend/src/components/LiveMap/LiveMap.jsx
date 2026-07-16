import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css";
import { useEffect, useState } from "react";
import useVehicles from "../../hooks/useVehicles";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function LiveMap({ vehicles: propVehicles }) {
  const { vehicles: hookVehicles } = useVehicles();
  const vehicles = propVehicles || hookVehicles;
  const [mapVehicles, setMapVehicles] = useState([]);

  useEffect(() => {
    setMapVehicles(vehicles);
  }, [vehicles]);

  const getMarkerColor = (status, speed) => {
    if (status === "Offline") return "#64748b";
    if (speed > 80) return "#ef4444";
    if (speed > 50) return "#f59e0b";
    return "#22c55e";
  };

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
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="
                    width: 12px; height: 12px; 
                    background: ${getMarkerColor(vehicle.status, vehicle.speed)}; 
                    border: 2px solid #fff; 
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  "></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              >
                <Popup>
                  <div style={{ fontFamily: "Inter, sans-serif", minWidth: 180 }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#1a2332" }}>🚛 {vehicle.vehicleId}</h4>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
                      <div>👤 Driver: {vehicle.driver || "Unknown"}</div>
                      <div>📊 Speed: <strong>{vehicle.speed || 0} km/h</strong></div>
                      <div>⛽ Fuel: <strong>{Math.round(vehicle.fuel || 0)}%</strong></div>
                      <div>📍 {vehicle.location.lat?.toFixed(4)}, {vehicle.location.lng?.toFixed(4)}</div>
                      <div>📡 Status: <span style={{ color: vehicle.status === "Active" ? "#22c55e" : "#ef4444" }}>{vehicle.status}</span></div>
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