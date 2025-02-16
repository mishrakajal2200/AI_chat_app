import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId,ref:"User", required:true},
    receiver:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    message:{type:String,required:true},
    Timestamp:{type: Date, default: Date.now}
});

export default mongoose.model('Chat', chatSchema);