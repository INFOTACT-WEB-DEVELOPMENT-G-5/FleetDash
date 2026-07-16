const Vehicle = require("../models/Vehicle");
const {
    sendUpdate
} = require("../socket/socket");
const {
    analyzeMaintenanceNeeds,
    analyzeDriverScore,
    detectFuelFraud
} = require("../services/aiService");



setInterval(async()=>{


    try{


        const vehicles = await Vehicle.find();



        for(const vehicle of vehicles){


            vehicle.speed =
            Math.floor(
                Math.random()*100
            );



            vehicle.status =
            vehicle.speed > 0 ? "Active" : "Offline";

            // Simulate fuel consumption
            if (vehicle.speed > 0) {
                vehicle.fuel = Math.max(0, vehicle.fuel - (Math.random() * 2));
            }
            vehicle.distance = (vehicle.distance || 0) + (vehicle.speed * 0.1);

            if(vehicle.location)
            {


                vehicle.location.lat +=
                (Math.random()-0.5)/100;



                vehicle.location.lng +=
                (Math.random()-0.5)/100;


            }

            vehicle.lastUpdated =
            new Date();

            await vehicle.save();

            // AI Analysis
            await analyzeMaintenanceNeeds(vehicle);
            await analyzeDriverScore(vehicle);
            await detectFuelFraud(vehicle);

            sendUpdate(vehicle);


        }


        // Send analytics update
        sendUpdate({
            type: "analytics_tick",
            timestamp: new Date(),
            vehicleCount: vehicles.length
        });

    }
    catch(error){


        console.log(
            "Telemetry Error:",
            error.message
        );


    }



},5000);
