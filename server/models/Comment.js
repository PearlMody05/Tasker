const {mongoose,Schema,rqDate}=require('./setup')
const ComSchema = new Schema({
    userId:{
        type : Schema.Types.ObjectId,
        ref:'User',
        required : true
    },
    TaskId:{
        type : Schema.Types.ObjectId,
        ref:'task',
        required : true
    },
    createdAt:rqDate
})
const Comment= mongoose.model('Comment',ComSchema);
module.exports =Comment;