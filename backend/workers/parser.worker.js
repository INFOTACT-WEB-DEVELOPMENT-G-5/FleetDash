const redis = require("../config/redis");

module.exports = async function parseTelemetry(data) {

    // simulate CPU-heavy parsing
    let calculation = 0;

    for (let i = 0; i < 100000; i++) {
        calculation += Math.sqrt(i);
    }

    return {
        vehicleId: data.vehicleId,
        lat: Number(data.lat),
        lng: Number(data.lng),
        speed: Number(data.speed),
        fuel: Number(data.fuel),
        status: data.status,
        timestamp: Date.now()
    };
};