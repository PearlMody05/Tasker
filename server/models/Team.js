const {mongoose,rqString,Schema}=require('./setup')
const TeamSchema = new Schema({
    name:rqString,
    description:rqString,
    userId:{ //Team Owner
        type: Schema.Types.ObjectId,
        ref : 'User',
        required:true
    },
    teamCode : rqString,
    members : [{type:Schema.Types.ObjectId, ref: 'User'}] //array of team members
})
const Team = mongoose.model('Team',TeamSchema);
module.exports =Team ;