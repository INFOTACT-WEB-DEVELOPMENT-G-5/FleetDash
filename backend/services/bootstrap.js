const Vehicle = require("../models/Vehicle");
const Geofence = require("../models/Geofence");
const User = require("../models/User");

const demoVehicles = [
  { vehicleId: "FD-001", driver: "Arun Kumar", phone: "+91-9876543210", status: "Active", speed: 65, fuel: 80, distance: 12500, type: "Truck", location: { lat: 19.076, lng: 72.877 } },
  { vehicleId: "FD-002", driver: "Rahul Sharma", phone: "+91-9876543211", status: "Active", speed: 45, fuel: 45, distance: 8300, type: "Truck", location: { lat: 12.971, lng: 77.594 } },
  { vehicleId: "FD-003", driver: "Priya Singh", phone: "+91-9876543212", status: "Active", speed: 0, fuel: 70, distance: 5600, type: "Van", location: { lat: 28.613, lng: 77.209 } },
  { vehicleId: "FD-004", driver: "Sunil Verma", phone: "+91-9876543213", status: "Offline", speed: 0, fuel: 15, distance: 15200, type: "Truck", location: { lat: 23.022, lng: 72.571 } },
  { vehicleId: "FD-005", driver: "Anita Patel", phone: "+91-9876543214", status: "Active", speed: 55, fuel: 60, distance: 9800, type: "Truck", location: { lat: 18.520, lng: 73.856 } },
  { vehicleId: "FD-006", driver: "Vikram Joshi", phone: "+91-9876543215", status: "Active", speed: 70, fuel: 90, distance: 4100, type: "Van", location: { lat: 13.082, lng: 80.273 } },
  { vehicleId: "FD-007", driver: "Kavya Reddy", phone: "+91-9876543216", status: "Active", speed: 50, fuel: 35, distance: 11200, type: "Truck", location: { lat: 17.385, lng: 78.486 } },
  { vehicleId: "FD-008", driver: "Manoj Kumar", phone: "+91-9876543217", status: "Active", speed: 85, fuel: 55, distance: 6700, type: "Truck", location: { lat: 22.572, lng: 88.364 } },
];

const demoZones = [
  { name: "Mumbai Port Area", type: "circle", center: { lat: 19.076, lng: 72.877 }, radius: 3000, vehicleIds: ["FD-001"], alertOnExit: true, alertOnEntry: true, active: true },
  { name: "Bengaluru Tech Park", type: "circle", center: { lat: 12.9716, lng: 77.5946 }, radius: 1500, vehicleIds: ["FD-002"], alertOnExit: true, alertOnEntry: true, active: true },
  { name: "Chennai Depot Zone", type: "circle", center: { lat: 13.0827, lng: 80.2707 }, radius: 2000, vehicleIds: ["FD-006"], alertOnExit: true, alertOnEntry: true, active: true },
];

const demoUsers = [
  { name: "Fleet Admin", email: "admin@fleetdash.com", password: "123456", role: "Admin" },
  { name: "Fleet Manager", email: "manager@fleetdash.com", password: "123456", role: "Manager" },
  { name: "Fleet Driver", email: "driver@fleetdash.com", password: "123456", role: "Driver" },
];

async function bootstrapDemoData() {
  for (const demo of demoUsers) {
    const exists = await User.findOne({ email: demo.email });
    if (!exists) await User.create(demo);
  }

  const vehicleCount = await Vehicle.countDocuments();
  if (vehicleCount === 0) {
    await Vehicle.insertMany(demoVehicles);
    console.log(`✅ Seeded ${demoVehicles.length} demo vehicles`);
  }

  const zoneCount = await Geofence.countDocuments();
  if (zoneCount === 0) {
    await Geofence.insertMany(demoZones);
    console.log(`✅ Seeded ${demoZones.length} geofence zones`);
  }
}

module.exports = { bootstrapDemoData };
