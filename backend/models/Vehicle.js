const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
        unique: true
    },
    driver: {
        type: String,
        required: true
    },
    driverName: {
        type: String
    },
    phone: {
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    location: {
        lat: Number,
        lng: Number
    },
    speed: {
        type: Number,
        default: 0
    },
    fuel: {
        type: Number,
        default: 100
    },
    distance: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: "Truck"
    }
},
    {
        timestamps: true
    });


module.exports = mongoose.model(
    "Vehicle",
    vehicleSchema
);