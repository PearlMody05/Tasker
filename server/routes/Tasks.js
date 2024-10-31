const {body,validationResult,router,User} = require('../commonImports');

//crud for tasks
//create task
router.post("/createTask",[
    body("titlt","Enter a valid title").isLength({min:4}),
    body("description","Enter a valid description").isLength({min:4})
],async(req,res)=>{
    //take everything from body save it to database
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success:false,message:"Invalid entries"});
    }
    const title = req.body.title;
    const desc = req.body.description;
    const tag = req.body.tag;
    
})