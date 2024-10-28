const {mongoose,rqString,Schema}=require('./setup')
const TeamSchema = new Schema({
    name:rqString,
    description:rqString,
    userId:{
        type: Schema.Types.ObjectId,
        ref : 'User',
        required:true
    }
})
module.exports = mongoose.model('Team',TeamSchema);