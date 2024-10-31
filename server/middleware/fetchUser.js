const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;

const fetchUser = (req,res,next)=>{
    
    const token = req.header('auth-token');
    if(!token) return res.status(404).json({success:false,message:"There was some problem!"});
    try{const data = jwt.verify(token,secret); //so basically this verifies the token and gives the payload
    req.user= data.user; //we give all  the routes the user it wants 
    next();}catch(err){
        console.log(err);
        return res.status(404).json({success:false,message:"There was some problem!"});
    }

}

module.exports = fetchUser;
