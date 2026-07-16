const { Server } = require("socket.io");


let io;



function initSocket(server){


    io = new Server(
        server,
        {

            cors:{

                origin:"http://localhost:5173",

                methods:[
                    "GET",
                    "POST"
                ]

            }

        }
    );



    io.on(
        "connection",
        (socket)=>{


            console.log(
                "User Connected",
                socket.id
            );



            socket.on(
                "disconnect",
                ()=>{


                    console.log(
                        "User Disconnected",
                        socket.id
                    );


                }
            );


        }
    );


}



function sendUpdate(vehicle){


    if(io){


        io.emit(
            "vehicleUpdate",
            vehicle
        );


    }


}



module.exports={

    initSocket,

    sendUpdate

};