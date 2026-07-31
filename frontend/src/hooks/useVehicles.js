import {
useEffect,
useState
}
from "react";


import API from "../api/axios";


import socket from "../services/socket";



function useVehicles(){


    const [vehicles,setVehicles]=useState([]);

    const [loading,setLoading]=useState(true);



    const fetchVehicles=async()=>{


        try{


            const response =
            await API.get("/vehicles");


            setVehicles(response.data);


        }
        catch(error){


            console.log(
                error
            );


        }
        finally{


            setLoading(false);


        }


    };




    useEffect(()=>{


        fetchVehicles();



        socket.on(
            "vehicleUpdate",
            (updatedVehicle)=>{


                setVehicles(
                    (previous)=>{


                        return previous.map(
                            (vehicle)=>

                            vehicle._id === updatedVehicle._id

                            ?

                            updatedVehicle

                            :

                            vehicle

                        );


                    }

                );


            }
        );




        return()=>{


            socket.off(
                "vehicleUpdate"
            );


        };


    },[]);



    return{

        vehicles,

        loading,

        refresh:fetchVehicles

    };


}



export default useVehicles;