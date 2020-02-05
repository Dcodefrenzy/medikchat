const mongoose = require("mongoose");
const {users} = require("../../../users/usersModel");
const {doctors} = require("../../../medicals/doctors/doctor/doctorsModel");
const {chatSessions} = require("../chatSessions/chatSessionsModel");



const chatLogsSchema = mongoose.Schema({
    action:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:users
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:doctors,
    },
    sessionId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:chatSessions,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    
});


const chatLogs = mongoose.Schema("chatLogs", chatLogsSchema);
module.exports = chatLogs; 