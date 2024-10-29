const express = require('express')
const {body,validationResult} = require('express-validator')
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mailtransport = nodemailer.createTransport({
    service:"gmail",
    auth:{
user :"nodemailing05@gmail.com",
pass:"vric lnkx vfrl wdzr",
    },
})


const jwt = require('jsonwebtoken');
require('dotenv').config();



//signup
router.post('/signup',[
    body("name","Enter valid name").isLength({min:3}),
    body("email","Enter valid email").isEmail(),
    body("password","password must be 8 charecters long").isLength({min:8}),
],
async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()) return res.status(400).json({error});
    //now we hv got correct info in server we need to check if present if not 
    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).send("This email already exists");
    }
    //not present therefore save it to database 
    let secPass = await bcrypt.hash(req.body.password,10); //encripting password
    //saving it
    user =await User.create({
        name : req.body.name,
        email:req.body.email,
        password:secPass,
        isVerified:false,
    })
    return res.status(200).send("saved to db");
    //data saved 
    
}
);


//otp genrate
const generateOTP = () => new Promise((res,rej) =>
    crypto.randomBytes(3, (err, buffer) => {
        if(err) return rej(err);
        res(
            parseInt(buffer.toString("hex"), 16)
                .toString()
                .substring(0, 6)
        );
    })
);



//making a function that sends and saves otp to database..It gets,details,user and otp in the function calling 
sendOtp = async(details,user,otp,res)=>{
       
      // Send the email with OTP
      let mailsent = await mailtransport.sendMail(details, (err) => {
        if (err) {
            console.log ("Some problem occurred while sending mail\n");
            console.log(err)
        } else {
            console.log("Mail sent successfully.");
        }
    });
    const expireTime = 15 * 60 * 1000;
      //if the otp exists and we want new otp to be saved in db 
      const existingOtp = await Otp.findOne({userId : user.id});
      if(!existingOtp){
      // Store the OTP in the database
      await Otp.create({
          userId: user.id,
          code: otp,
          expiry: new Date(Date.now() + expireTime),
      });
      return res.status(200).json({ success: true, message: "OTP sent successfully and saved to database!" }); //otp has been sent and stored
      }else{
        //if otp exists replace it with new one so when we try to do send otp again so it gets replaced
        existingOtp.code = otp;
        existingOtp.expiry= new Date(Date.now()+expireTime);
        await existingOtp.save();
        return res.status(200).json({ success: true, message: "OTP sent successfully and saved to database!" }); 
      }
      //now otp is saved and sent 
}



//end point for otp sending
router.post('/sendOtp',async (req,res)=>{
    try{
    const email = req.body.email;
    let user = await User.findOne({email});
    if(!user) return res.status(404).send("There was some problem cant get the email you entered...");
      // Generate the OTP code
      const otp = await generateOTP();
      if (!otp) {
          throw new Error("Failed to generate OTP");
      }
      //otp was generated
        //now this otp will be sent in the mail
        details = {
            from: "nodemailing05@gmail.com",
            to: email,
            subject: "Welcome to Tasker!",
            html: `<p><h3>Hi ${user.name},</h3></p>
              <p>Thanks for signing up on <strong>Tasker!</strong> We're excited to help you streamline your tasks and projects.</p>
              <p>Your otp is ${otp}. Please do not share it with anyone!</p>
              <p>To get started, explore our features and create your first project. If you need assistance, you can <a href="mailto:nodemailing05@gmail.com">send an email</a> to nodemailing05@gmail.com.</p>
              <p>Regards,<br>Pearl Mody</p>
            `,
          };
         await sendOtp(details,user,otp,res);
}catch(err){
    console.log("Some error occured: ",err);
    return res.status(500).json({ success: false, message: "Some problem!" }); 
}
});


//now verifying the otp 
router.post('/verifyOtp/:id',async (req,res)=>{
    //now i hv to check otp generated is correct or not
    try{
      let success = false;
    const enteredOtp = req.body.code;
    let userid = req.params.id;
    let user = await User.findById(userid);
    if (!user) {
        return res.status(404).send("User not found");
    }
    //finding otp of user
    let otp = await Otp.findOne({userId:userid});
    if(!otp)  return res.status(404).json({message : "Otp Not Found"});
    //now we have user ka otp and ours
    if(otp.expiry<Date.now())    return res.status(400).json({message:"Otp has been expired"});
    if(otp.code=== enteredOtp) {
        user.isVerified=true;
        await user.save();
        let data = {
            user:{
                id : user.id
            }
        }
        const secret = process.env.JWT_SECRET;
        const authToken = jwt.sign(data,secret);
        if(authToken) {
            success=true;
           return res.status(200).json({success,authToken});
        }
        else return res.status(500).json({success,message:"something went wrong"});
    }else{
      //if otp code is not equal to entered otp then del the user and flag it as invalid otp
      const result = await User.deleteOne({_id:user.id});
      console.log("Since user is not verfied we have Deleted it!, ",result);
      return res.status(404).json({success:false});}
    }
    catch(err){
        return res.status(500).send("Something went wrong!");
    }

});


//login 
router.post('/login', [
    body("email", "Enter a valid email").isEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  ], async (req, res) => {
    let success = false;
  
    // Check if there are validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
  
    const { email, password } = req.body;
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, error: "Please login with correct credentials" });
      }
  
      // Check if the password matches
      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare) {
        return res.status(400).json({ success, error: "Please login with correct credentials" });
      }
  
      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(403).json({ success, error: "Your account is not verified. Please verify your email." });
      }
  
      // Generate JWT token
      const data = {
        user: {
          id: user.id
        }
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
  
      // Send success response
      success = true;
      return res.json({ success, authToken });
  
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  

  //forgot password if user forgets password he will be sent a otp and will have to send and verify otp 
  router.put('/forgotPass',async(req,res)=>{
    try{const email = req.body.email;
    const user = await User.findOne({email:email});
    if(!user){
      return res.status(404).json({message :"The user does not exist try signing up"});
    }
    //now user exist but he has forgotten password so i will send email with otp 
      // Generate the OTP code
      const otp = await generateOTP();
      if (!otp) {
          throw new Error("Failed to generate OTP");
      }     
    details ={
      from : "nodemailing05@gmail.com",
      to: email,
      subject : "Password Recovery - One-Time Password",
      html : `Your One-Time Password (OTP) is: <b>${otp}</b> . Do not shate it with anyone<p> `
    };
    await sendOtp(details,user,otp,res);
}
catch(error){
  console.error(error.message);
  return res.status(500).json({ success: false, message: "Internal server error" });   
}
  })

//change password verifyies otp and changes password
router.put('/changePass', async(req,res)=>{
  const enteredOtp = req.body.code; //entered otp
  const newPass = req.body.password; //taking newly entered password fron user and thenreplacing the old one with one required
  const email = req.body.email;
  const user = await User.findOne({email});
  if(!user){
    //you are not saved to db means you are intruder
    return res.status(400).json({ success: false, message: "Some problem occured" });
  }
  const OtpRec = await (Otp.findOne({userId:user.id}));
  if(!OtpRec) return res.status(404).json({ success: false, message: "Some problem occured" });
  if(OtpRec.code===enteredOtp){
    let secPass = await bcrypt.hash(newPass,10);
  user.password = secPass;
  await user.save();
  return res.status(200).json({success:true,message:"Password changed Successfully!"});
  }else{
    //passwords
    res.status(400).json({success:false,message:"Some Problem Occured"});
  }

})

module.exports = router;