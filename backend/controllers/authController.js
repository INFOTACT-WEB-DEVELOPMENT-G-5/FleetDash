const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");



exports.login = async(req,res)=>{


try{


const {
email,
password
}=req.body;



const user = await User.findOne({
email
});



if(!user){

return res.status(404).json({

message:"User not found"

});

}



const match = await bcrypt.compare(

password,

user.password

);



if(!match){

return res.status(401).json({

message:"Invalid Password"

});

}




const token = jwt.sign(

{

id:user._id,

role:user.role

},

process.env.JWT_SECRET,

{

expiresIn:"1d"

}

);




res.json({

token,

user:{


name:user.name,

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