const {mongoose,Schema,rqDate, rqString}=require('./setup')
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
    createdAt:{
        ...rqDate,
        default:Date.now},
    texts : rqString
})
const Comment= mongoose.model('Comment',ComSchema);
module.exports =Comment;