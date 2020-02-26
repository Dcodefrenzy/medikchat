const mongoose = require("mongoose");
const {chatSessions} = require("../chatSessions/chatSessionsModel");



const chatSchema = mongoose.Schema({
        from:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
        },
        to:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
        },
        message:{
            type:String,
            require:true,
        },
        delivery:{
            type:Boolean,
            require:true,
            default:false,
        },
        createdAt:{
            type:Date,
            require:true,
        },
        sessionId:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            //ref:chatSessions,
        },
});

const chats = mongoose.model("chats", chatSchema);
module.exports = chats