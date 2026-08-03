const { encode } = require("@msgpack/msgpack");
const redisConfig = require("../config/redis");

let io = null;

function setIO(socketIO) {
  io = socketIO;
}

function getIO() {
  return io;
}

function emitVehicleUpdate(payload) {
  if (!io) return;

  const data = Array.isArray(payload) ? payload : [payload];
  io.emit("vehicleUpdate", data);

  try {
    const binary = encode(data);
    io.emit("vehicleUpdateBinary", binary);
  } catch (err) {
    console.error("Binary encode failed:", err.message);
  }
}

function emitAlert(alert) {
  if (!io) return;
  io.emit("alert", alert);
}

async function publishVehicleUpdate(payload) {
  emitVehicleUpdate(payload);

  if (redisConfig.isRedisConnected() && redisConfig.redis) {
    try {
      await redisConfig.redis.publish(
        "vehicle:updates",
        JSON.stringify(payload)
      );
    } catch (err) {
      console.error("Redis publish vehicle failed:", err.message);
    }
  }
}

async function publishAlert(alert) {
  emitAlert(alert);

  if (redisConfig.isRedisConnected() && redisConfig.redis) {
    try {
      await redisConfig.redis.publish("alerts", JSON.stringify(alert));
    } catch (err) {
      console.error("Redis publish alert failed:", err.message);
    }
  }
}

module.exports = {
  setIO,
  getIO,
  emitVehicleUpdate,
  emitAlert,
  publishVehicleUpdate,
  publishAlert,
};
