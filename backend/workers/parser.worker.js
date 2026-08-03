// CPU-offloaded telemetry parser (worker thread via Piscina)
module.exports = async function parseTelemetry(data) {
  let calculation = 0;
  for (let i = 0; i < 50000; i++) {
    calculation += Math.sqrt(i);
  }

  return {
    vehicleId: data.vehicleId,
    lat: Number(data.lat ?? data.location?.lat),
    lng: Number(data.lng ?? data.location?.lng),
    speed: Number(data.speed ?? 0),
    fuel: Number(data.fuel ?? 100),
    status: data.status || "Active",
    timestamp: Date.now(),
    _calc: calculation > 0 ? 1 : 0,
  };
};
