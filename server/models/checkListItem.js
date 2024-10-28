const {mongoose,Schema,rqString}=require('./setup')
const CheckSchema = new Schema({
    TaskId:{
        type : Schema.Types.ObjectId,
        ref:'task',
        required : true
    },
    status:{
        type:Number,
        enum:[0,1],
        required:true
    },
    rank:{
        type:Number,
        required:true
    },
    text:rqString
});
const Check= mongoose.model('Check',CheckSchema);
module.exports = Check;