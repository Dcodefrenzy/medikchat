const mongoose = require("mongoose");



const chatSessionsSchema = mongoose.Schema({
        from:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
        },
        to:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
        },
        start:{
            type:Date,
            require:true,
            default:Date.now,
        },
        end:{
            type:Date,
            require:false,
        },
        endSession:{
            type:Boolean,
            require:true,
            default:false,
        },
});

const chatSessions = mongoose.model("chatSessions", chatSessionsSchema);
module.exports= chatSessions;

