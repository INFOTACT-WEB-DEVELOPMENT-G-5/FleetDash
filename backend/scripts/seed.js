require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Vehicle = require("../models/Vehicle");


const seedData = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected for seeding");


        // Clear old data
        await User.deleteMany({});
        await Vehicle.deleteMany({});


        // Create Admin User

        const hashedPassword = await bcrypt.hash("123456", 10);


        await User.create({
            name: "Admin",
            email: "admin@fleetdash.com",
            password: hashedPassword,
            role: "Admin"
        });


        console.log("Admin created");


        // Sample Vehicles

        const vehicles = [

            {
                vehicleId: "TN01AB1234",
                driver: "Arun",
                status: "Active",
                speed: 60,
                location:{
                    lat:11.0168,
                    lng:76.9558
                },
                fuel:80,
                distance:500
            },


            {
                vehicleId:"TN02CD5678",
                driver:"Kumar",
                status:"Offline",
                speed:0,
                location:{
                    lat:11.0200,
                    lng:76.9600
                },
                fuel:40,
                distance:300
            },


            {
                vehicleId:"TN03EF9012",
                driver:"Ravi",
                status:"Active",
                speed:90,
                location:{
                    lat:11.0300,
                    lng:76.9700
                },
                fuel:65,
                distance:800
            }

        ];


        await Vehicle.insertMany(vehicles);


        console.log("Vehicles inserted");


        console.log("Seed completed");


        process.exit();


    }
    catch(error){

        console.log(error);

        process.exit(1);

    }

};


seedData();