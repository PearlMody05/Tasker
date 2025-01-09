const {mongoose,Schema,rqString,rqDate}=require('./setup')
const TaskSchema = new Schema({
    title:rqString,
    description :rqString,
    tag : {
        type :String,
        default : "General"
    },
    status:{
        type:String,
        enum:['to-do','completed','in-progress'],
        default : 'to-do'
    },
    assigneesId :{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    reportedId:[{
        type:Schema.Types.ObjectId,
        ref:'User',
    }],
    teamId: {  // New field to associate the task with a specific team
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    createdAt:{
        ...rqDate,
        default:Date.now
    },
    deadline:{
        type:Date
    }
})

const task = mongoose.model('Task',TaskSchema); //so in mongodb it will be as tasks but i will refer that model s task
module.exports = task;