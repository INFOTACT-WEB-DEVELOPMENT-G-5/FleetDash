const Vehicle = require("../models/Vehicle");


// GET ALL VEHICLES

const getVehicles = async(req,res)=>{

    try{

        const vehicles = await Vehicle.find();


        res.status(200).json(
            vehicles
        );


    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



// GET VEHICLE BY ID

const getVehicleById = async(req,res)=>{

    try{

        const vehicle = await Vehicle.findById(req.params.id);

        if(!vehicle){
            return res.status(404).json({message:"Vehicle not found"});
        }

        res.status(200).json(vehicle);

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



// ADD VEHICLE

const addVehicle = async(req,res)=>{

    try{


        const vehicle = new Vehicle({

            vehicleId:req.body.vehicleId,

            driver:req.body.driver,

            status:req.body.status,

            speed:req.body.speed,


            location:{

                lat:req.body.location.lat,

                lng:req.body.location.lng

            },


            fuel:req.body.fuel,

            distance:req.body.distance

        });



        const savedVehicle =
        await vehicle.save();



        res.status(201).json(
            savedVehicle
        );


    }
    catch(error){


        res.status(400).json({

            message:error.message

        });


    }

};



// UPDATE VEHICLE

const updateVehicle = async(req,res)=>{

    try{

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true, runValidators:true}
        );

        if(!vehicle){
            return res.status(404).json({message:"Vehicle not found"});
        }

        res.status(200).json(vehicle);

    }
    catch(error){

        res.status(400).json({
            message:error.message
        });

    }

};



// DELETE VEHICLE

const deleteVehicle = async(req,res)=>{

    try{

        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

        if(!vehicle){
            return res.status(404).json({message:"Vehicle not found"});
        }

        res.status(200).json({message:"Vehicle deleted successfully"});

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



module.exports = {

    getVehicles,

    getVehicleById,

    addVehicle,

    updateVehicle,

    deleteVehicle

};