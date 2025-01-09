const express = require('express');
const router = express.Router();
const Team = require('../models/Team')
const generateTeamCode = require('../generateTeam')
const {body,validationResult} = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require ('dotenv').config();
const mailtransport = nodemailer.createTransport({
    service :"gmail",
    auth:{
        user:"nodemailing05@gmail.com",
        pass:process.env.Pass
    },
});


//creation of a team 
//as soon as user logs in team should be created self team(that happeened in signUp), i can be part of many teams 
router.post('/createTeam',[
    body("name","Enter a valid name").isLength({min:2})
],async(req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()) return res.status(400).json({success:false , message : "There is some problem"});
    const owner = req.user.id;
    const user = await User.findById(owner);
    if(!user) return res.status(400).json({success:false , message : "There is some problem"});
    const teamName = req.body.name;
    const desc = req.body.description;
    const code = await generateTeamCode();   
    //now creating a team 
    try
   { const newTeam  = await Team.create({
        name : teamName,
        description: desc,
        teamCode : code,
        userId : owner,
        members:owner
    });
    const email = user.email;
    details = {
        from: "nodemailing05@gmail.com",
        to: email,
        subject: "Your team is sucessfully created!",
        html: `<p><h3>Hi ${user.name},</h3></p>
          <p>Thanks for using <strong>Tasker!</strong> We're excited to help you streamline your tasks and projects.</p>
          <p>Your team code is  is <b>${code}</b>. Share this code to people to add them to your team.</p>
          <p>If you need assistance, you can <a href="mailto:nodemailing05@gmail.com">send an email</a> to nodemailing05@gmail.com.</p>
          <p>Regards,<br>Pearl Mody</p>
        `,
      };
      await mailtransport.sendMail(details);
    return res.status(200).json({success:true, message: "Team created"});
    }catch(err){
        console.log(err);
        return res.status(500).json({success:false , message : "There is some problem"});
    }
    
})


//update the teams means updating name of team /description 
router.put('/updateTeam/:id',[body("name","Enter a valid name ").isLength({min:2}),
    body("description","Enter a valid description").isLength({nim:4}) 
],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({success:false , message : "There is some problem"});
    const newName = req.body.name;
    const newdesc = req.body.description;
    const teamId = req.params.id;
    const userId = req.user.id;
    //now i have everything i just need to change team name
    const team = await Team.findById(teamId);
    try{team.name = newName;
    team.description=newdesc;
    await team.save();
    return res.status(200).json({success:true,message:"Updations done successfully!"})
    //now team is saved and updated
    }catch(err){
        console.log(err);
        return res.status(500).json({success:false , message : "There is some problem"});
    }
})

//Reading all the teams
router.get('/getTeams',async(req,res)=>{
    const userId = req.user.id;
    try{
        const teams = await Team.find({
            $or:[
                {userId: userId},
                {members:userId}
            ]
        })
        return res.status(200).json({success:true,teams})
    }catch(err){
        console.log(err);
        return res.status(500).json({success:false , message : "There is some problem"});
    }
})

//joining a team
router.post('/joiningTeam',async(req,res)=>{
    const code = req.body.teamCode;
    const team = await Team.findOne({teamCode:code});
    if(!team)  return res.status(500).json({success:false , message : "There is some problem"});
    try{
    if(team.members.includes(req.user.id)){
        return res.status(400).json({success:false , message : "You are already part of the team"});
    }
    team.members.push(req.user.id);
    await team.save();
    return res.status(200).json({success:true,message:"Joined successfully!"})
    }catch(err){
        console.log(err);
        return res.status(500).json({success:false , message : "There is some problem"});
    }
})


// Delete a team
router.delete('/deleteTeam/:id', async (req, res) => {
    const teamId = req.params.id;
    const userId = req.user.id;

    try {
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        // Check if the current user is the owner of the team
        if (team.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Only the owner can delete this team" });
        }

        // Delete the team
        await Team.findByIdAndDelete(teamId);

        return res.status(200).json({ success: true, message: "Team deleted successfully!" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "There is some problem" });
    }
});




module.exports = router;