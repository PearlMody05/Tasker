const {body,validationResult,router,User} = require('../commonImports');
const Team = require('../models/Team')
const Task = require('../models/Task');
const { findById } = require('../models/User');
const getTeam = async(req)=>{
    const teamName = req.body.name;
    const team = await Team.findOne({
        name : teamName,
        $or: [
                {userId:req.user.id},
                {members :{$in:[req.user.id]}}
        ],
    })
    if(team) return team;
    else null;
}
//crud for tasks


//create task 
router.post("/createTask",[
    body("title","Enter a valid title").isLength({min:4}),
    body("description","Enter a valid description").isLength({min:4}),
    body("deadline", "Enter a valid deadline date").optional().isISO8601()
],async(req,res)=>{
    //take everything from body save it to database
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success:false,message:"Invalid entries"});
    }
   const team = await getTeam(req);
   if(team == null){
    return res.status(400).json({success:false,message:"Problems"});
   }
   const team_id = team._id;
    const title = req.body.title;
    const desc = req.body.description;
    const tag = req.body.tag;
    const deadline = req.body.deadline;
    //now add to schema 
    try{
        const task = await Task.create({
        title:title,
        description:desc,
        tag : tag,
        assigneesId : req.user.id,
        reportedId:team.members,
        teamId : team_id,
        deadline:deadline
    })
    return res.status(200).json({success:true,message:"task added succesfully"})
}catch(err){
    console.log(err);
    return res.status(500).json({success:false,message:"Invalid entries",err});
}
})

//getting all the tasks of a specific team 
//so tasks have shorter tasks which are checklists 
router.get('/getTasks',async(req,res)=>{
    //read tasks find by all the dimensions queried
   try{ const {teamId, status, assigneesId, reportedId, startDate, endDate} =req.query; 
    let query ={};
    //the thing is if teamId is not provided based on other details user will be able to fetch teams that i dont want 
    //only users part of that team can do it
    const userId = req.user.id;
    let allowedTeamIds = await Team.find({ members: userId }).select('_id').lean();
    allowedTeamIds = allowedTeamIds.map(team => team._id.toString());

    if(teamId) {
        if(!allowedTeamIds.includes(teamId)) return res.status(403).json({success:false,message:"Some error occured"})
    query.teamId=teamId;}
    //now if there is no team id 
    else{
        query.teamId={$in : allowedTeamIds}
    }
    if(teamId) query.teamId=teamId;
    if (status) query.status=status;
    if (assigneesId) query.assigneesId=assigneesId;
    if (reportedId) query.reportedId=reportedId;
    
    
    if(startDate || endDate){
        query.createdAt={}
        if(startDate) {
            query.createdAt.$gte = new Date(startDate);
    }
    if(endDate) {
        query.createdAt.$lte = new Date(endDate);
}}
//now we have got everything we will just fetch the tasks 
const tasks = await Task.find(query)
    .populate('assigneesId','name email')
    .populate('reportedId', 'name email')
    .populate('teamId','name description')

res.status(200).json({"success": true, tasks})
}catch(err){
    res.status(500).json({"success":false, error:err.message})
}
});

router.put('/updateTask/:id', [
    body("title", "Enter a valid title").isLength({ min: 4 }),
    body("description", "Enter a valid description").isLength({ min: 4 }),
    body("deadline", "Enter a valid deadline date").optional().isISO8601(),
    body("status", "Enter a valid status").optional().isIn(['to-do', 'completed', 'in-progress'])
], async (req, res) => {
    const taskId = req.params.id;
    const errors = validationResult(req);
    
    // Validate request data
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Invalid Entry" });
    }

    try {
        // Find the task by ID
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        // Check if the user is authorized to update the task
        const team = await Team.findById(task.teamId);
        if (!team || (team.userId.toString() !== req.user.id && !team.members.includes(req.user.id))) {
            return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }
        // Update the task
        const updates = req.body;
        Object.keys(updates).forEach((key) => {
            task[key] = updates[key];
        });

        await task.save();

        // Send success response
        return res.status(200).json({ success: true, message: "Task updated successfully", task });
    } catch (err) {
        // Handle errors
        return res.status(500).json({ success: false, message: "Internal server error",message: err.message });
    }
});

//delete task 
router.delete('/deleteTask/:id',async(req,res)=>{
    try{const id= req.params.id;
        if(!id) return res.status(400).json({success:false,message:"There was some error",code:"ni"});
    const deletedTask = await Task.findByIdAndDelete(id);
    if(!deletedTask) return res.status(404).json({suceess:false,message:"Some Error occured",code:"tnf"});
    //if we reach here means everythings okay
    return res.status(200).json({success:true,message:"Task deleted"});
}catch(err){
    return res.status(500).json({success:false,message:"Internal Server Error"})
}});


    
    

module.exports = router;