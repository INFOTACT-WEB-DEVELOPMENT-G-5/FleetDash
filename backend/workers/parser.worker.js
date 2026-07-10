const { parentPort } = require('worker_threads');
const redis = require('../config/redis');

parentPort.on('message', async (rawData) => {
  // Simulate heavy parsing (e.g., CSV, protobuf)
  const parsed = parseData(rawData); // custom parsing
  // Publish to Redis
  await redis.publish('vehicle:updates', JSON.stringify(parsed));
  parentPort.postMessage('done');
});

function parseData(raw) {
  // parse raw buffer or string into vehicle object
  return { vehicleId: raw.id, lat: raw.lat, lng: raw.lng, speed: raw.speed };
}