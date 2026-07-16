const Vehicle = require("./models/Vehicle");


function startSimulator(io){


    setInterval(async()=>{


        try{


            const vehicles = await Vehicle.find();



            const updatedVehicles = vehicles.map(vehicle=>{


                if(vehicle.location){


                    vehicle.location.latitude += 
                    (Math.random()-0.5) * 0.001;


                    vehicle.location.longitude += 
                    (Math.random()-0.5) * 0.001;


                }



                vehicle.speed =
                Math.floor(
                    Math.random()*100
                );



                return vehicle;


            });



            io.emit(
                "vehicleUpdate",
                updatedVehicles
            );



            console.log(
                "Live vehicles updated"
            );



        }

        catch(error){


            console.log(
                error
            );


        }



    },5000);


}



module.exports = startSimulator;