const redis = require("../config/redis");

module.exports = async function parseTelemetry(data) {

    // simulate heavy parsing
    let calculation = 0;

    for (let i = 0; i < 100000; i++) {
        calculation += Math.sqrt(i);
    }

    const payload = {
        vehicleId: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        fuel: data.fuel,
        status: data.status,
        timestamp: Date.now()
    };

    await redis.publish(
        "vehicle:updates",
        JSON.stringify(payload)
    );

    return payload;
};