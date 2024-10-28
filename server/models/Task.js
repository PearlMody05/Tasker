const {mongoose,Schema,rqString}=require('./setup')
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
    assigneeId :{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    reportedId:{
        type:Schema.Types.ObjectId,
        ref:'User',
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