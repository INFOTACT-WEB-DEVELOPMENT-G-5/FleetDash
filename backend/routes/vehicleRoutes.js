const express = require("express");

const router = express.Router();

const {
    getVehicles,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");

const auth = require("../middleware/auth");


// GET ALL VEHICLES

router.get(
    "/",
    auth,
    getVehicles
);


// GET VEHICLE BY ID

router.get(
    "/:id",
    auth,
    getVehicleById
);


// ADD VEHICLE

router.post(
    "/",
    auth,
    addVehicle
);


// UPDATE VEHICLE

router.put(
    "/:id",
    auth,
    updateVehicle
);


// DELETE VEHICLE

router.delete(
    "/:id",
    auth,
    deleteVehicle
);


module.exports = router;