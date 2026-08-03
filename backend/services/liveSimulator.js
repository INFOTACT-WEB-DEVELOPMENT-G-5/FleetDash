const Vehicle = require("../models/Vehicle");
const realtime = require("./realtime");
const { checkGeofence } = require("./geofenceService");

let timer = null;

function jitter(value, amount) {
  return value + (Math.random() - 0.5) * amount;
}

async function tick() {
  try {
    const vehicles = await Vehicle.find({ status: { $ne: "Offline" } }).limit(50);
    if (!vehicles.length) return;

    const updates = [];

    for (const vehicle of vehicles) {
      if (!vehicle.location?.lat || !vehicle.location?.lng) continue;

      const moving = Math.random() > 0.25;
      const nextLat = moving
        ? jitter(vehicle.location.lat, 0.002)
        : vehicle.location.lat;
      const nextLng = moving
        ? jitter(vehicle.location.lng, 0.002)
        : vehicle.location.lng;
      const nextSpeed = moving
        ? Math.max(5, Math.min(95, (vehicle.speed || 40) + (Math.random() - 0.5) * 20))
        : 0;
      const nextFuel = Math.max(
        5,
        Math.min(100, (vehicle.fuel || 50) - Math.random() * 0.3)
      );

      vehicle.location = { lat: nextLat, lng: nextLng };
      vehicle.speed = Math.round(nextSpeed);
      vehicle.fuel = Math.round(nextFuel * 10) / 10;
      vehicle.status = moving ? "Active" : vehicle.status;

      await vehicle.save();

      const payload = {
        _id: vehicle._id,
        vehicleId: vehicle.vehicleId,
        driver: vehicle.driver,
        status: vehicle.status,
        speed: vehicle.speed,
        fuel: vehicle.fuel,
        type: vehicle.type,
        location: vehicle.location,
        lat: nextLat,
        lng: nextLng,
        timestamp: Date.now(),
      };

      updates.push(payload);

      setImmediate(() => {
        checkGeofence(vehicle.vehicleId, nextLat, nextLng).catch(() => {});
      });
    }

    if (updates.length) {
      await realtime.publishVehicleUpdate(updates);
    }
  } catch (err) {
    console.error("Live simulator error:", err.message);
  }
}

function startLiveSimulator(intervalMs = 3000) {
  if (process.env.ENABLE_LIVE_SIMULATOR === "false") {
    console.log("ℹ️ Live simulator disabled");
    return;
  }

  if (timer) return;

  const ms = Number(process.env.SIMULATOR_INTERVAL_MS || intervalMs);
  timer = setInterval(tick, ms);
  console.log(`🚗 Live vehicle simulator started (${ms}ms)`);
}

function stopLiveSimulator() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = { startLiveSimulator, stopLiveSimulator };
