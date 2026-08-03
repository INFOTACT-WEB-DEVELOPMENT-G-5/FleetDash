const turf = require("@turf/turf");
const Geofence = require("../models/Geofence");
const Alert = require("../models/Alert");
const Notification = require("../models/Notification");
const realtime = require("./realtime");

// key: `${vehicleId}:${zoneId}` => boolean (inside)
const vehicleZoneState = new Map();

function buildPolygon(zone) {
  if (zone.type === "polygon" && Array.isArray(zone.points) && zone.points.length >= 3) {
    const ring = zone.points.map((p) => [p.lng, p.lat]);
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([...first]);
    }
    return turf.polygon([ring]);
  }

  if (zone.center?.lat != null && zone.center?.lng != null) {
    const center = turf.point([zone.center.lng, zone.center.lat]);
    const radiusKm = (zone.radius || 1000) / 1000;
    return turf.circle(center, radiusKm, { steps: 64, units: "kilometers" });
  }

  return null;
}

async function checkGeofence(vehicleId, lat, lng) {
  if (lat == null || lng == null || !vehicleId) return [];

  const point = turf.point([Number(lng), Number(lat)]);
  const zones = await Geofence.find({ active: true });
  const createdAlerts = [];

  for (const zone of zones) {
    if (Array.isArray(zone.vehicleIds) && zone.vehicleIds.length > 0) {
      if (!zone.vehicleIds.includes(vehicleId)) continue;
    }

    const polygon = buildPolygon(zone);
    if (!polygon) continue;

    const inside = turf.booleanPointInPolygon(point, polygon);
    const key = `${vehicleId}:${zone._id}`;
    const previous = vehicleZoneState.get(key);

    if (previous === undefined) {
      vehicleZoneState.set(key, inside);
      continue;
    }

    if (previous === inside) continue;

    vehicleZoneState.set(key, inside);

    const isEntry = inside && !previous;
    const isExit = !inside && previous;

    if (isEntry && !zone.alertOnEntry) continue;
    if (isExit && !zone.alertOnExit) continue;

    const alertType = isEntry ? "ENTER" : "EXIT";
    const message = `Vehicle ${vehicleId} ${alertType === "ENTER" ? "entered" : "exited"} zone "${zone.name}"`;

    const alert = await Alert.create({
      type: "Geofence",
      message,
      severity: isExit ? "High" : "Medium",
      vehicleId,
      acknowledged: false,
    });

    try {
      await Notification.create({
        title: `Geofence ${alertType}`,
        message,
        type: "warning",
        read: false,
        vehicleId,
        link: "/alerts",
      });
    } catch (_) {
      // notification model may differ; ignore
    }

    const payload = {
      _id: alert._id,
      type: "Geofence",
      message,
      severity: alert.severity,
      vehicleId,
      zoneId: zone._id,
      zoneName: zone.name,
      alertType,
      location: { lat: Number(lat), lng: Number(lng) },
      createdAt: alert.createdAt || new Date(),
      acknowledged: false,
    };

    await realtime.publishAlert(payload);
    createdAlerts.push(payload);
  }

  return createdAlerts;
}

module.exports = { checkGeofence, vehicleZoneState };
