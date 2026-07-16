import Layout from "../components/Layout/Layout";


import DashboardCards 
from "../components/DashboardCards/DashboardCards";


import VehicleTable 
from "../components/VehicleTable/VehicleTable";


import DashboardCharts 
from "../components/DashboardCharts/DashboardCharts";


import LiveAlerts 
from "../components/LiveAlerts/LiveAlerts";


import LiveMap 
from "../components/LiveMap/LiveMap";


import useVehicles 
from "../hooks/useVehicles";


import { useEffect } from "react";


import socket 
from "../services/socket";



function Dashboard(){


    const {
        vehicles,
        loading,
        refresh
    } = useVehicles();




    useEffect(()=>{


        socket.on(
            "vehicleUpdate",
            ()=>{


                refresh();


            }
        );



        return()=>{


            socket.off(
                "vehicleUpdate"
            );


        };


    },[]);





    return(


        <Layout>


            <div className="dashboard-header">


                <h1>
                    FleetDash Dashboard
                </h1>



                <p>
                    Real Time Fleet Telemetry Monitoring
                </p>


            </div>





            {

            loading ?


            (

                <h2>
                    Loading Vehicles...
                </h2>


            )


            :


            (


            <>


                {/* Statistics Cards */}


                <DashboardCards

                    vehicles={vehicles}

                />





                {/* Vehicle Data Table */}


                <VehicleTable

                    vehicles={vehicles}

                />






                {/* Speed Analytics */}


                <DashboardCharts

                    vehicles={vehicles}

                />







                {/* Live Alerts */}


                <LiveAlerts

                    vehicles={vehicles}

                />








                {/* Live Map */}


                <LiveMap

                    vehicles={vehicles}

                />



            </>


            )


            }



        </Layout>


    );


}



export default Dashboard;