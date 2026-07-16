const mongoose = require("mongoose");


const vehicleSchema = new mongoose.Schema({

    vehicleId:{
        type:String,
        required:true,
        unique:true
    },


    driver:{
        type:String,
        default:"Unknown"
    },

    phone:{
        type:String,
        default:"+91-9876543210"
    },

    status:{
        type:String,
        default:"Offline"
    },


    speed:{
        type:Number,
        default:0
    },


    location:{

        lat:{
            type:Number,
            default:0
        },

        lng:{
            type:Number,
            default:0
        }

    },


    fuel:{
        type:Number,
        default:100
    },


    distance:{
        type:Number,
        default:0
    },


    lastUpdated:{
        type:Date,
        default:Date.now
    }


});


module.exports = mongoose.model(
    "Vehicle",
    vehicleSchema
);