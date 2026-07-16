const User = require("../models/User");

const bcrypt = require("bcrypt");



exports.createUser = async(req,res)=>{


try{


const {
    name,
    email,
    password
}=req.body;




const existingUser = await User.findOne({

    email

});




if(existingUser){


return res.status(400).json({

    message:"User already exists"

});


}





const hashedPassword = await bcrypt.hash(

    password,

    10

);





const user = await User.create({


    name,

    email,

    password:hashedPassword,

    role:"Admin"


});






res.json({


message:"User Created Successfully",



user:{


    name:user.name,

    email:user.email,

    role:user.role


}



});



}


catch(error){


res.status(500).json({


    message:error.message


});


}



};