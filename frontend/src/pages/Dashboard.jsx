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

import CanvasFleetMap
from "../components/CanvasFleetMap/CanvasFleetMap";


import useVehicles 
from "../hooks/useVehicles";



function Dashboard(){


    const {
        vehicles,
        loading
    } = useVehicles();





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

                <div style={{ marginTop: 24 }}>
                  <CanvasFleetMap vehicles={vehicles} />
                </div>

            </>


            )


            }



        </Layout>


    );


}



export default Dashboard;