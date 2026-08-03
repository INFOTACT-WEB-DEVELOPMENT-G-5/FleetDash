const mongoose = require('mongoose');
require('dotenv').config();

const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const Depot = require('./models/Depot');
const Incident = require('./models/Incident');
const WorkOrder = require('./models/WorkOrder');
const Document = require('./models/Document');
const Cost = require('./models/Cost');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const Alert = require('./models/Alert');
const Fuel = require('./models/Fuel');
const Geofence = require('./models/Geofence');
const Notification = require('./models/Notification');

// ============ VEHICLES (15 records) ============
const vehicles = [
  { vehicleId: "FD-001", driver: "Arun Kumar", phone: "+91-9876543210", status: "Active", speed: 65, fuel: 80, distance: 12500, type: "Truck", location: { lat: 19.076, lng: 72.877 } },
  { vehicleId: "FD-002", driver: "Rahul Sharma", phone: "+91-9876543211", status: "Active", speed: 45, fuel: 45, distance: 8300, type: "Truck", location: { lat: 12.971, lng: 77.594 } },
  { vehicleId: "FD-003", driver: "Priya Singh", phone: "+91-9876543212", status: "Active", speed: 0, fuel: 70, distance: 5600, type: "Van", location: { lat: 28.613, lng: 77.209 } },
  { vehicleId: "FD-004", driver: "Sunil Verma", phone: "+91-9876543213", status: "Offline", speed: 0, fuel: 15, distance: 15200, type: "Truck", location: { lat: 23.022, lng: 72.571 } },
  { vehicleId: "FD-005", driver: "Anita Patel", phone: "+91-9876543214", status: "Active", speed: 55, fuel: 60, distance: 9800, type: "Truck", location: { lat: 18.520, lng: 73.856 } },
  { vehicleId: "FD-006", driver: "Vikram Joshi", phone: "+91-9876543215", status: "Active", speed: 70, fuel: 90, distance: 4100, type: "Van", location: { lat: 13.082, lng: 80.273 } },
  { vehicleId: "FD-007", driver: "Kavya Reddy", phone: "+91-9876543216", status: "Active", speed: 50, fuel: 35, distance: 11200, type: "Truck", location: { lat: 17.385, lng: 78.486 } },
  { vehicleId: "FD-008", driver: "Manoj Kumar", phone: "+91-9876543217", status: "Active", speed: 85, fuel: 55, distance: 6700, type: "Truck", location: { lat: 22.572, lng: 88.364 } },
  { vehicleId: "FD-009", driver: "Deepa Nair", phone: "+91-9876543218", status: "Active", speed: 40, fuel: 75, distance: 3200, type: "Van", location: { lat: 9.925, lng: 78.119 } },
  { vehicleId: "FD-010", driver: "Ramesh Iyer", phone: "+91-9876543219", status: "Offline", speed: 0, fuel: 20, distance: 18900, type: "Truck", location: { lat: 11.016, lng: 76.955 } },
  { vehicleId: "FD-011", driver: "Sneha Gupta", phone: "+91-9876543220", status: "Active", speed: 60, fuel: 65, distance: 5400, type: "Truck", location: { lat: 26.912, lng: 75.787 } },
  { vehicleId: "FD-012", driver: "Rajesh Singh", phone: "+91-9876543221", status: "Active", speed: 35, fuel: 85, distance: 2800, type: "Van", location: { lat: 21.170, lng: 72.831 } },
  { vehicleId: "FD-013", driver: "Meena Kumari", phone: "+91-9876543222", status: "Active", speed: 75, fuel: 40, distance: 7600, type: "Truck", location: { lat: 15.299, lng: 74.124 } },
  { vehicleId: "FD-014", driver: "Suresh Babu", phone: "+91-9876543223", status: "Offline", speed: 0, fuel: 10, distance: 21000, type: "Truck", location: { lat: 13.083, lng: 80.270 } },
  { vehicleId: "FD-015", driver: "Lakshmi Menon", phone: "+91-9876543224", status: "Active", speed: 48, fuel: 72, distance: 4300, type: "Van", location: { lat: 10.790, lng: 78.704 } }
];

// ============ DEPOTS (5 records) ============
const depots = [
  { name: "Chennai Central Depot", address: "123 Port Road, Chennai", location: { lat: 13.0827, lng: 80.2707 }, vehicleCount: 25, availableVehicles: 18, maintenanceVehicles: 7 },
  { name: "Coimbatore Hub", address: "45 Industrial Area, Coimbatore", location: { lat: 11.0168, lng: 76.9558 }, vehicleCount: 18, availableVehicles: 14, maintenanceVehicles: 4 },
  { name: "Bengaluru Depot", address: "78 Tech Park, Bengaluru", location: { lat: 12.9716, lng: 77.5946 }, vehicleCount: 30, availableVehicles: 22, maintenanceVehicles: 8 },
  { name: "Hyderabad Center", address: "90 Highway Rd, Hyderabad", location: { lat: 17.3850, lng: 78.4867 }, vehicleCount: 20, availableVehicles: 15, maintenanceVehicles: 5 },
  { name: "Madurai Facility", address: "55 Temple Street, Madurai", location: { lat: 9.9252, lng: 78.1198 }, vehicleCount: 15, availableVehicles: 12, maintenanceVehicles: 3 }
];

// ============ INCIDENTS (5 records) ============
const incidents = [
  { incidentId: "INC-0001", type: "Overspeed", description: "Vehicle exceeded 90 km/h in zone", severity: "High", vehicleId: "FD-001", status: "Open" },
  { incidentId: "INC-0002", type: "Engine Warning", description: "Check engine light activated", severity: "Medium", vehicleId: "FD-002", status: "Investigating" },
  { incidentId: "INC-0003", type: "Accident", description: "Minor collision at junction", severity: "Critical", vehicleId: "FD-003", status: "Open" },
  { incidentId: "INC-0004", type: "Geofence Breach", description: "Vehicle exited designated zone", severity: "High", vehicleId: "FD-004", status: "Resolved" },
  { incidentId: "INC-0005", type: "Low Fuel", description: "Fuel level below 20%", severity: "Medium", vehicleId: "FD-005", status: "Open" }
];

// ============ WORK ORDERS (5 records) ============
const workOrders = [
  { title: "Brake Inspection", description: "Routine brake system check", vehicleId: "FD-001", priority: "High", status: "Pending" },
  { title: "Engine Service", description: "Complete engine overhaul", vehicleId: "FD-002", priority: "Critical", status: "In Progress" },
  { title: "Tire Replacement", description: "Replace all tires", vehicleId: "FD-003", priority: "Medium", status: "Pending" },
  { title: "Oil Change", description: "Scheduled oil change", vehicleId: "FD-004", priority: "Low", status: "Completed" },
  { title: "Battery Replacement", description: "Replace old battery", vehicleId: "FD-005", priority: "Medium", status: "Pending" }
];

// ============ DOCUMENTS (5 records) ============
const documents = [
  { name: "Vehicle Registration FD-001", type: "Registration", vehicleId: "FD-001", expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: "Active" },
  { name: "Insurance FD-002", type: "Insurance", vehicleId: "FD-002", expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), status: "Active" },
  { name: "Pollution Certificate FD-003", type: "Pollution", vehicleId: "FD-003", expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), status: "Active" },
  { name: "Driver License - Arun Kumar", type: "License", driverId: "d1", expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), status: "Active" },
  { name: "Compliance Certificate", type: "Compliance", expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), status: "Active" }
];

// ============ DRIVERS (10 records) ============
const drivers = [
  { name: "Arun Kumar", email: "arun@fleetdash.com", phone: "+91-9876543210", licenseNumber: "DL-2024-001", experience: 8, currentStatus: "Available", safetyScore: 92, assignedVehicle: "FD-001", totalTrips: 245, rating: 4.8 },
  { name: "Rahul Sharma", email: "rahul@fleetdash.com", phone: "+91-9876543211", licenseNumber: "DL-2024-002", experience: 5, currentStatus: "On Trip", safetyScore: 88, assignedVehicle: "FD-002", totalTrips: 189, rating: 4.6 },
  { name: "Priya Singh", email: "priya@fleetdash.com", phone: "+91-9876543212", licenseNumber: "DL-2024-003", experience: 12, currentStatus: "Available", safetyScore: 95, assignedVehicle: "FD-003", totalTrips: 412, rating: 4.9 },
  { name: "Sunil Verma", email: "sunil@fleetdash.com", phone: "+91-9876543213", licenseNumber: "DL-2024-004", experience: 3, currentStatus: "Off Duty", safetyScore: 78, assignedVehicle: "FD-004", totalTrips: 67, rating: 4.2 },
  { name: "Anita Patel", email: "anita@fleetdash.com", phone: "+91-9876543214", licenseNumber: "DL-2024-005", experience: 7, currentStatus: "On Trip", safetyScore: 85, assignedVehicle: "FD-005", totalTrips: 198, rating: 4.7 },
  { name: "Vikram Joshi", email: "vikram@fleetdash.com", phone: "+91-9876543215", licenseNumber: "DL-2024-006", experience: 15, currentStatus: "Available", safetyScore: 90, assignedVehicle: "FD-006", totalTrips: 523, rating: 4.8 },
  { name: "Kavya Reddy", email: "kavya@fleetdash.com", phone: "+91-9876543216", licenseNumber: "DL-2024-007", experience: 4, currentStatus: "On Leave", safetyScore: 82, assignedVehicle: "FD-007", totalTrips: 112, rating: 4.5 },
  { name: "Manoj Kumar", email: "manoj@fleetdash.com", phone: "+91-9876543217", licenseNumber: "DL-2024-008", experience: 10, currentStatus: "On Trip", safetyScore: 87, assignedVehicle: "FD-008", totalTrips: 287, rating: 4.6 },
  { name: "Deepa Nair", email: "deepa@fleetdash.com", phone: "+91-9876543218", licenseNumber: "DL-2024-009", experience: 6, currentStatus: "Available", safetyScore: 84, assignedVehicle: "FD-009", totalTrips: 156, rating: 4.4 },
  { name: "Ramesh Iyer", email: "ramesh@fleetdash.com", phone: "+91-9876543219", licenseNumber: "DL-2024-010", experience: 11, currentStatus: "Off Duty", safetyScore: 81, assignedVehicle: "FD-010", totalTrips: 345, rating: 4.3 }
];

// ============ TRIPS (20 records) ============
const trips = [
  { vehicleId: "FD-001", driver: "Arun Kumar", origin: "Mumbai Hub", destination: "Delhi Distribution", status: "Active", distance: 1420, duration: "18h 30m", startTime: new Date(Date.now() - 3600000 * 5) },
  { vehicleId: "FD-002", driver: "Rahul Sharma", origin: "Bangalore Hub", destination: "Chennai Port", status: "Active", distance: 350, duration: "5h 15m", startTime: new Date(Date.now() - 3600000 * 2) },
  { vehicleId: "FD-005", driver: "Anita Patel", origin: "Pune Factory", destination: "Nagpur Depot", status: "Completed", distance: 720, duration: "9h 45m", startTime: new Date(Date.now() - 86400000), endTime: new Date(Date.now() - 86400000 + 3600000 * 10) },
  { vehicleId: "FD-006", driver: "Vikram Joshi", origin: "Ahmedabad Terminal", destination: "Jaipur Hub", status: "Scheduled", distance: 650, duration: "8h 20m", startTime: new Date(Date.now() + 3600000 * 6) },
  { vehicleId: "FD-003", driver: "Priya Singh", origin: "Hyderabad Center", destination: "Kolkata Depot", status: "Active", distance: 1520, duration: "20h 00m", startTime: new Date(Date.now() - 3600000 * 8) },
  { vehicleId: "FD-004", driver: "Sunil Verma", origin: "Lucknow Hub", destination: "Kanpur Depot", status: "Completed", distance: 85, duration: "1h 30m", startTime: new Date(Date.now() - 172800000), endTime: new Date(Date.now() - 172800000 + 5400000) },
  { vehicleId: "FD-007", driver: "Kavya Reddy", origin: "Coimbatore Hub", destination: "Madurai Facility", status: "Active", distance: 250, duration: "4h 00m", startTime: new Date(Date.now() - 3600000) },
  { vehicleId: "FD-008", driver: "Manoj Kumar", origin: "Kolkata Port", destination: "Bhubaneswar Hub", status: "Active", distance: 440, duration: "6h 30m", startTime: new Date(Date.now() - 3600000 * 3) },
  { vehicleId: "FD-009", driver: "Deepa Nair", origin: "Madurai Facility", destination: "Chennai Central Depot", status: "Completed", distance: 460, duration: "6h 45m", startTime: new Date(Date.now() - 259200000), endTime: new Date(Date.now() - 259200000 + 24300000) },
  { vehicleId: "FD-011", driver: "Sneha Gupta", origin: "Jaipur Hub", destination: "Delhi Distribution", status: "Active", distance: 280, duration: "4h 15m", startTime: new Date(Date.now() - 3600000 * 4) },
  { vehicleId: "FD-012", driver: "Rajesh Singh", origin: "Surat Hub", destination: "Mumbai Hub", status: "Completed", distance: 290, duration: "5h 00m", startTime: new Date(Date.now() - 345600000), endTime: new Date(Date.now() - 345600000 + 18000000) },
  { vehicleId: "FD-013", driver: "Meena Kumari", origin: "Goa Port", destination: "Bengaluru Depot", status: "Active", distance: 560, duration: "8h 30m", startTime: new Date(Date.now() - 3600000 * 6) },
  { vehicleId: "FD-015", driver: "Lakshmi Menon", origin: "Trichy Hub", destination: "Coimbatore Hub", status: "Scheduled", distance: 180, duration: "3h 00m", startTime: new Date(Date.now() + 3600000 * 12) },
  { vehicleId: "FD-001", driver: "Arun Kumar", origin: "Delhi Distribution", destination: "Jaipur Hub", status: "Completed", distance: 280, duration: "4h 30m", startTime: new Date(Date.now() - 432000000), endTime: new Date(Date.now() - 432000000 + 16200000) },
  { vehicleId: "FD-002", driver: "Rahul Sharma", origin: "Chennai Port", destination: "Bangalore Hub", status: "Completed", distance: 350, duration: "5h 15m", startTime: new Date(Date.now() - 518400000), endTime: new Date(Date.now() - 518400000 + 18900000) },
  { vehicleId: "FD-003", driver: "Priya Singh", origin: "Kolkata Depot", destination: "Bhubaneswar Hub", status: "Completed", distance: 440, duration: "6h 30m", startTime: new Date(Date.now() - 604800000), endTime: new Date(Date.now() - 604800000 + 23400000) },
  { vehicleId: "FD-005", driver: "Anita Patel", origin: "Nagpur Depot", destination: "Nashik Hub", status: "Scheduled", distance: 380, duration: "5h 45m", startTime: new Date(Date.now() + 3600000 * 24) },
  { vehicleId: "FD-006", driver: "Vikram Joshi", origin: "Jaipur Hub", destination: "Udaipur Terminal", status: "Completed", distance: 260, duration: "4h 00m", startTime: new Date(Date.now() - 691200000), endTime: new Date(Date.now() - 691200000 + 14400000) },
  { vehicleId: "FD-008", driver: "Manoj Kumar", origin: "Bhubaneswar Hub", destination: "Ranchi Depot", status: "Scheduled", distance: 320, duration: "5h 00m", startTime: new Date(Date.now() + 3600000 * 48) },
  { vehicleId: "FD-011", driver: "Sneha Gupta", origin: "Delhi Distribution", destination: "Chandigarh Hub", status: "Completed", distance: 250, duration: "4h 00m", startTime: new Date(Date.now() - 777600000), endTime: new Date(Date.now() - 777600000 + 14400000) }
];

// ============ ALERTS (10 records) ============
const alerts = [
  { type: "Overspeed", message: "Vehicle FD-001 exceeded 90 km/h", severity: "High", vehicleId: "FD-001", acknowledged: false },
  { type: "Low Fuel", message: "FD-002 fuel level below 20%", severity: "Medium", vehicleId: "FD-002", acknowledged: false },
  { type: "Maintenance Due", message: "FD-003 service overdue", severity: "Critical", vehicleId: "FD-003", acknowledged: true },
  { type: "Geofence", message: "FD-001 exited designated zone", severity: "Medium", vehicleId: "FD-001", acknowledged: false },
  { type: "Engine Warning", message: "FD-004 check engine light", severity: "High", vehicleId: "FD-004", acknowledged: false },
  { type: "Battery Low", message: "FD-005 battery voltage low", severity: "Medium", vehicleId: "FD-005", acknowledged: true },
  { type: "Overspeed", message: "FD-007 exceeded 95 km/h", severity: "High", vehicleId: "FD-007", acknowledged: false },
  { type: "Tire Pressure", message: "FD-008 tire pressure below recommended", severity: "Low", vehicleId: "FD-008", acknowledged: false },
  { type: "Critical Temperature", message: "FD-010 engine temperature critical", severity: "Critical", vehicleId: "FD-010", acknowledged: false },
  { type: "Vehicle Offline", message: "FD-014 went offline unexpectedly", severity: "High", vehicleId: "FD-014", acknowledged: false }
];

// ============ FUEL RECORDS (20 records) ============
const fuelRecords = [
  { vehicleId: "FD-001", litres: 45, cost: 4500, date: new Date(Date.now() - 86400000), efficiency: 12.5, mileage: 560, station: "HP Petrol Pump Mumbai" },
  { vehicleId: "FD-002", litres: 38, cost: 3800, date: new Date(Date.now() - 172800000), efficiency: 11.8, mileage: 449, station: "Indian Oil Bangalore" },
  { vehicleId: "FD-003", litres: 52, cost: 5200, date: new Date(Date.now() - 259200000), efficiency: 13.2, mileage: 686, station: "BP Delhi" },
  { vehicleId: "FD-004", litres: 30, cost: 3000, date: new Date(Date.now() - 345600000), efficiency: 10.5, mileage: 315, station: "HP Ahmedabad" },
  { vehicleId: "FD-005", litres: 48, cost: 4800, date: new Date(Date.now() - 432000000), efficiency: 12.0, mileage: 576, station: "Indian Oil Pune" },
  { vehicleId: "FD-006", litres: 42, cost: 4200, date: new Date(Date.now() - 518400000), efficiency: 12.8, mileage: 538, station: "BP Chennai" },
  { vehicleId: "FD-007", litres: 35, cost: 3500, date: new Date(Date.now() - 604800000), efficiency: 11.2, mileage: 392, station: "HP Hyderabad" },
  { vehicleId: "FD-008", litres: 50, cost: 5000, date: new Date(Date.now() - 691200000), efficiency: 12.5, mileage: 625, station: "Indian Oil Kolkata" },
  { vehicleId: "FD-009", litres: 28, cost: 2800, date: new Date(Date.now() - 777600000), efficiency: 13.5, mileage: 378, station: "BP Madurai" },
  { vehicleId: "FD-010", litres: 55, cost: 5500, date: new Date(Date.now() - 864000000), efficiency: 10.8, mileage: 594, station: "HP Coimbatore" },
  { vehicleId: "FD-011", litres: 40, cost: 4000, date: new Date(Date.now() - 950400000), efficiency: 12.0, mileage: 480, station: "Indian Oil Jaipur" },
  { vehicleId: "FD-012", litres: 32, cost: 3200, date: new Date(Date.now() - 1036800000), efficiency: 13.0, mileage: 416, station: "BP Surat" },
  { vehicleId: "FD-013", litres: 46, cost: 4600, date: new Date(Date.now() - 1123200000), efficiency: 11.5, mileage: 529, station: "HP Goa" },
  { vehicleId: "FD-015", litres: 36, cost: 3600, date: new Date(Date.now() - 1209600000), efficiency: 12.2, mileage: 439, station: "Indian Oil Trichy" },
  { vehicleId: "FD-001", litres: 42, cost: 4200, date: new Date(Date.now() - 1296000000), efficiency: 12.8, mileage: 538, station: "HP Petrol Pump Mumbai" },
  { vehicleId: "FD-002", litres: 35, cost: 3500, date: new Date(Date.now() - 1382400000), efficiency: 12.0, mileage: 420, station: "Indian Oil Bangalore" },
  { vehicleId: "FD-003", litres: 48, cost: 4800, date: new Date(Date.now() - 1468800000), efficiency: 13.5, mileage: 648, station: "BP Delhi" },
  { vehicleId: "FD-005", litres: 44, cost: 4400, date: new Date(Date.now() - 1555200000), efficiency: 11.8, mileage: 519, station: "Indian Oil Pune" },
  { vehicleId: "FD-006", litres: 40, cost: 4000, date: new Date(Date.now() - 1641600000), efficiency: 13.0, mileage: 520, station: "BP Chennai" },
  { vehicleId: "FD-008", litres: 47, cost: 4700, date: new Date(Date.now() - 1728000000), efficiency: 12.3, mileage: 578, station: "Indian Oil Kolkata" }
];

// ============ GEOFENCES (5 records) ============
const geofences = [
  { name: "Chennai Depot Zone", type: "circle", center: { lat: 13.0827, lng: 80.2707 }, radius: 2000, vehicleIds: ["FD-006", "FD-009"], alertOnExit: true, active: true },
  { name: "Bengaluru Tech Park", type: "circle", center: { lat: 12.9716, lng: 77.5946 }, radius: 1500, vehicleIds: ["FD-002"], alertOnExit: true, active: true },
  { name: "Mumbai Port Area", type: "circle", center: { lat: 19.076, lng: 72.877 }, radius: 3000, vehicleIds: ["FD-001", "FD-012"], alertOnExit: true, active: true },
  { name: "Hyderabad Highway", type: "circle", center: { lat: 17.385, lng: 78.4867 }, radius: 5000, vehicleIds: ["FD-007", "FD-013"], alertOnExit: true, active: true },
  { name: "Delhi Distribution Center", type: "circle", center: { lat: 28.613, lng: 77.209 }, radius: 2500, vehicleIds: ["FD-003", "FD-011"], alertOnExit: true, active: true }
];

// ============ NOTIFICATIONS (10 records) ============
const notifications = [
  { title: "Overspeed Alert", message: "Vehicle FD-001 exceeded speed limit on Highway 48", type: "warning", read: false, vehicleId: "FD-001", link: "/alerts" },
  { title: "Maintenance Due", message: "FD-003 is overdue for scheduled maintenance", type: "critical", read: false, vehicleId: "FD-003", link: "/maintenance" },
  { title: "Trip Completed", message: "Trip from Pune to Nagpur completed successfully", type: "success", read: false, vehicleId: "FD-005", link: "/trips" },
  { title: "Low Fuel Warning", message: "FD-002 fuel level below 20%", type: "warning", read: true, vehicleId: "FD-002", link: "/alerts" },
  { title: "New Work Order", message: "Brake inspection work order created for FD-001", type: "info", read: false, vehicleId: "FD-001", link: "/work-orders" },
  { title: "Document Expiring", message: "Insurance for FD-002 expires in 180 days", type: "warning", read: true, vehicleId: "FD-002", link: "/documents" },
  { title: "Driver Available", message: "Driver Priya Singh is now available for assignment", type: "info", read: true, link: "/drivers" },
  { title: "Geofence Breach", message: "FD-001 exited the Mumbai Port Area zone", type: "warning", read: false, vehicleId: "FD-001", link: "/alerts" },
  { title: "Cost Report Ready", message: "Monthly cost analysis report is available", type: "info", read: true, link: "/cost-analytics" },
  { title: "Battery Alert", message: "FD-005 battery voltage is low", type: "warning", read: false, vehicleId: "FD-005", link: "/alerts" }
];

// ============ COSTS (10 records) ============
const costs = [
  { category: "Fuel", amount: 4500, vehicleId: "FD-001", description: "Diesel refill", date: new Date(Date.now() - 86400000) },
  { category: "Maintenance", amount: 8500, vehicleId: "FD-002", description: "Brake service", date: new Date(Date.now() - 172800000) },
  { category: "Insurance", amount: 25000, vehicleId: "FD-003", description: "Annual premium", date: new Date(Date.now() - 259200000) },
  { category: "Toll", amount: 1200, vehicleId: "FD-004", description: "Highway toll charges", date: new Date(Date.now() - 345600000) },
  { category: "Repair", amount: 5500, vehicleId: "FD-005", description: "Engine repair", date: new Date(Date.now() - 432000000) },
  { category: "Fuel", amount: 3800, vehicleId: "FD-006", description: "Diesel refill", date: new Date(Date.now() - 518400000) },
  { category: "Maintenance", amount: 3200, vehicleId: "FD-007", description: "Oil change", date: new Date(Date.now() - 604800000) },
  { category: "Fuel", amount: 5200, vehicleId: "FD-008", description: "Diesel refill", date: new Date(Date.now() - 691200000) },
  { category: "Toll", amount: 950, vehicleId: "FD-009", description: "Toll charges", date: new Date(Date.now() - 777600000) },
  { category: "Repair", amount: 7800, vehicleId: "FD-010", description: "Transmission repair", date: new Date(Date.now() - 864000000) }
];

// ============ SEED FUNCTIONS ============
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
  const demos = [
    { name: 'Fleet Admin', email: 'admin@fleetdash.com', password: '123456', role: 'Admin' },
    { name: 'Fleet Manager', email: 'manager@fleetdash.com', password: '123456', role: 'Manager' },
    { name: 'Fleet Driver', email: 'driver@fleetdash.com', password: '123456', role: 'Driver' },
  ];

  for (const demo of demos) {
    const exists = await User.findOne({ email: demo.email });
    if (!exists) {
      await User.create(demo);
      console.log(`Created demo user: ${demo.email}`);
    }
  }
};

const seedDepots = async () => {
  for (const d of depots) {
    const exists = await Depot.findOne({ name: d.name });
    if (!exists) {
      await Depot.create(d);
      console.log(`Created depot: ${d.name}`);
    }
  }
};

const seedIncidents = async () => {
  for (const inc of incidents) {
    const exists = await Incident.findOne({ type: inc.type, vehicleId: inc.vehicleId });
    if (!exists) {
      await Incident.create(inc);
      console.log(`Created incident: ${inc.type} - ${inc.vehicleId}`);
    }
  }
};

const seedWorkOrders = async () => {
  for (const wo of workOrders) {
    const exists = await WorkOrder.findOne({ title: wo.title, vehicleId: wo.vehicleId });
    if (!exists) {
      await WorkOrder.create(wo);
      console.log(`Created work order: ${wo.title}`);
    }
  }
};

const seedDocuments = async () => {
  for (const doc of documents) {
    const exists = await Document.findOne({ name: doc.name });
    if (!exists) {
      await Document.create(doc);
      console.log(`Created document: ${doc.name}`);
    }
  }
};

const seedCosts = async () => {
  for (const c of costs) {
    const exists = await Cost.findOne({ category: c.category, vehicleId: c.vehicleId, amount: c.amount });
    if (!exists) {
      await Cost.create(c);
      console.log(`Created cost: ${c.category} - ${c.amount}`);
    }
  }
};

const seedDrivers = async () => {
  for (const d of drivers) {
    const exists = await Driver.findOne({ name: d.name, licenseNumber: d.licenseNumber });
    if (!exists) {
      await Driver.create(d);
      console.log(`Created driver: ${d.name}`);
    }
  }
};

const seedTrips = async () => {
  for (const t of trips) {
    const exists = await Trip.findOne({ vehicleId: t.vehicleId, origin: t.origin, destination: t.destination, startTime: t.startTime });
    if (!exists) {
      await Trip.create(t);
      console.log(`Created trip: ${t.vehicleId} - ${t.origin} to ${t.destination}`);
    }
  }
};

const seedAlerts = async () => {
  for (const a of alerts) {
    const exists = await Alert.findOne({ type: a.type, vehicleId: a.vehicleId, message: a.message });
    if (!exists) {
      await Alert.create(a);
      console.log(`Created alert: ${a.type} - ${a.vehicleId}`);
    }
  }
};

const seedFuel = async () => {
  for (const f of fuelRecords) {
    const exists = await Fuel.findOne({ vehicleId: f.vehicleId, date: f.date, litres: f.litres });
    if (!exists) {
      await Fuel.create(f);
      console.log(`Created fuel record: ${f.vehicleId} - ${f.litres}L`);
    }
  }
};

const seedGeofences = async () => {
  for (const g of geofences) {
    const exists = await Geofence.findOne({ name: g.name });
    if (!exists) {
      await Geofence.create(g);
      console.log(`Created geofence: ${g.name}`);
    }
  }
};

const seedNotifications = async () => {
  for (const n of notifications) {
    const exists = await Notification.findOne({ title: n.title, message: n.message });
    if (!exists) {
      await Notification.create(n);
      console.log(`Created notification: ${n.title}`);
    }
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...\n');
    await seedVehicles();
    await seedUsers();
    await seedDrivers();
    await seedTrips();
    await seedAlerts();
    await seedFuel();
    await seedDepots();
    await seedIncidents();
    await seedWorkOrders();
    await seedDocuments();
    await seedCosts();
    await seedGeofences();
    await seedNotifications();
    console.log('\nSeeding complete');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

run();