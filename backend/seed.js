const mongoose = require('mongoose');
require('dotenv').config();

const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const Depot = require('./models/Depot');
const Incident = require('./models/Incident');
const WorkOrder = require('./models/WorkOrder');
const Document = require('./models/Document');
const Cost = require('./models/Cost');

const vehicles = [
  { vehicleId: "FD-001", driver: "Arun Kumar", status: "Active", speed: 65, fuel: 80, location: { lat: 19.076, lng: 72.877 }, type: "Truck", phone: "+91-9876543210", distance: 12500 },
  { vehicleId: "FD-002", driver: "Rahul Sharma", status: "Active", speed: 45, fuel: 45, location: { lat: 12.971, lng: 77.594 }, type: "Truck", phone: "+91-9876543211", distance: 8300 },
  { vehicleId: "FD-003", driver: "Priya Singh", status: "Active", speed: 0, fuel: 70, location: { lat: 28.613, lng: 77.209 }, type: "Van", phone: "+91-9876543212", distance: 5600 },
  { vehicleId: "FD-004", driver: "Sunil Verma", status: "Offline", speed: 0, fuel: 15, location: { lat: 23.022, lng: 72.571 }, type: "Truck", phone: "+91-9876543213", distance: 15200 },
  { vehicleId: "FD-005", driver: "Anita Patel", status: "Active", speed: 55, fuel: 60, location: { lat: 18.520, lng: 73.856 }, type: "Truck", phone: "+91-9876543214", distance: 9800 },
  { vehicleId: "FD-006", driver: "Vikram Joshi", status: "Active", speed: 70, fuel: 90, location: { lat: 13.082, lng: 80.273 }, type: "Van", phone: "+91-9876543215", distance: 4100 },
  { vehicleId: "FD-007", driver: "Kavya Reddy", status: "Active", speed: 50, fuel: 35, location: { lat: 17.385, lng: 78.486 }, type: "Truck", phone: "+91-9876543216", distance: 11200 }
];

const seedVehicles = async () => {
  for (const v of vehicles) {
    const exists = await Vehicle.findOne({ vehicleId: v.vehicleId });
    if (!exists) {
      await Vehicle.create(v);
      console.log(`Created vehicle: ${v.vehicleId}`);
    }
  }
};

const seedUsers = async () => {
  const demo = { email: 'manager@fleetdash.com', password: 'password123', role: 'Manager' };
  const exists = await User.findOne({ email: demo.email });
  if (!exists) {
    await User.create(demo);
    console.log(`Created demo user: ${demo.email}`);
  }
};

const seedDepots = async () => {
  const depots = [
    { name: "Chennai Central Depot", address: "123 Port Road, Chennai", location: { lat: 13.0827, lng: 80.2707 }, vehicleCount: 25, availableVehicles: 18, maintenanceVehicles: 7 },
    { name: "Coimbatore Hub", address: "45 Industrial Area, Coimbatore", location: { lat: 11.0168, lng: 76.9558 }, vehicleCount: 18, availableVehicles: 14, maintenanceVehicles: 4 },
    { name: "Bengaluru Depot", address: "78 Tech Park, Bengaluru", location: { lat: 12.9716, lng: 77.5946 }, vehicleCount: 30, availableVehicles: 22, maintenanceVehicles: 8 },
    { name: "Hyderabad Center", address: "90 Highway Rd, Hyderabad", location: { lat: 17.3850, lng: 78.4867 }, vehicleCount: 20, availableVehicles: 15, maintenanceVehicles: 5 },
    { name: "Madurai Facility", address: "55 Temple Street, Madurai", location: { lat: 9.9252, lng: 78.1198 }, vehicleCount: 15, availableVehicles: 12, maintenanceVehicles: 3 }
  ];
  for (const d of depots) {
    const exists = await Depot.findOne({ name: d.name });
    if (!exists) {
      await Depot.create(d);
      console.log(`Created depot: ${d.name}`);
    }
  }
};

const seedIncidents = async () => {
  const incidents = [
    { type: "Overspeed", description: "Vehicle exceeded 90 km/h in zone", severity: "High", vehicleId: "FD-001", status: "Open" },
    { type: "Engine Warning", description: "Check engine light activated", severity: "Medium", vehicleId: "FD-002", status: "Investigating" },
    { type: "Accident", description: "Minor collision at junction", severity: "Critical", vehicleId: "FD-003", status: "Open" },
    { type: "Geofence Breach", description: "Vehicle exited designated zone", severity: "High", vehicleId: "FD-004", status: "Resolved" },
    { type: "Low Fuel", description: "Fuel level below 20%", severity: "Medium", vehicleId: "FD-005", status: "Open" }
  ];
  for (const inc of incidents) {
    const exists = await Incident.findOne({ type: inc.type, vehicleId: inc.vehicleId });
    if (!exists) {
      await Incident.create(inc);
      console.log(`Created incident: ${inc.type} - ${inc.vehicleId}`);
    }
  }
};

const seedWorkOrders = async () => {
  const workOrders = [
    { title: "Brake Inspection", description: "Routine brake system check", vehicleId: "FD-001", priority: "High", status: "Pending" },
    { title: "Engine Service", description: "Complete engine overhaul", vehicleId: "FD-002", priority: "Critical", status: "In Progress" },
    { title: "Tire Replacement", description: "Replace all tires", vehicleId: "FD-003", priority: "Medium", status: "Pending" },
    { title: "Oil Change", description: "Scheduled oil change", vehicleId: "FD-004", priority: "Low", status: "Completed" },
    { title: "Battery Replacement", description: "Replace old battery", vehicleId: "FD-005", priority: "Medium", status: "Pending" }
  ];
  for (const wo of workOrders) {
    const exists = await WorkOrder.findOne({ title: wo.title, vehicleId: wo.vehicleId });
    if (!exists) {
      await WorkOrder.create(wo);
      console.log(`Created work order: ${wo.title}`);
    }
  }
};

const seedDocuments = async () => {
  const documents = [
    { name: "Vehicle Registration FD-001", type: "Registration", vehicleId: "FD-001", expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: "Active" },
    { name: "Insurance FD-002", type: "Insurance", vehicleId: "FD-002", expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), status: "Active" },
    { name: "Pollution Certificate FD-003", type: "Pollution", vehicleId: "FD-003", expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), status: "Active" },
    { name: "Driver License - Arun Kumar", type: "License", driverId: "d1", expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), status: "Active" },
    { name: "Compliance Certificate", type: "Compliance", expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), status: "Active" }
  ];
  for (const doc of documents) {
    const exists = await Document.findOne({ name: doc.name });
    if (!exists) {
      await Document.create(doc);
      console.log(`Created document: ${doc.name}`);
    }
  }
};

const seedCosts = async () => {
  const costs = [
    { category: "Fuel", amount: 4500, vehicleId: "FD-001", description: "Diesel refill", date: new Date(Date.now() - 86400000) },
    { category: "Maintenance", amount: 8500, vehicleId: "FD-002", description: "Brake service", date: new Date(Date.now() - 172800000) },
    { category: "Insurance", amount: 25000, vehicleId: "FD-003", description: "Annual premium", date: new Date(Date.now() - 259200000) },
    { category: "Toll", amount: 1200, vehicleId: "FD-004", description: "Highway toll charges", date: new Date(Date.now() - 345600000) },
    { category: "Repair", amount: 5500, vehicleId: "FD-005", description: "Engine repair", date: new Date(Date.now() - 432000000) }
  ];
  for (const c of costs) {
    const exists = await Cost.findOne({ category: c.category, vehicleId: c.vehicleId, amount: c.amount });
    if (!exists) {
      await Cost.create(c);
      console.log(`Created cost: ${c.category} - ${c.amount}`);
    }
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
    await seedVehicles();
    await seedUsers();
    await seedDepots();
    await seedIncidents();
    await seedWorkOrders();
    await seedDocuments();
    await seedCosts();
    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

run();