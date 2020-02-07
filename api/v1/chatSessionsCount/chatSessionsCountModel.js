const mongoose = require("mongoose");



const chatSessionsCountSchema = mongoose.Schema({
        _sessionId:{
            type:mongoose.Schema.Types.ObjectId,
            require:true,
        },
        start:{
            type:Date,
            require:true,
        },
        end:{
            type:Date,
            require:true,
            default:Date.now,
        },
});

const chatSessionsCount = mongoose.model("chatSessionsCount", chatSessionsCountSchema);
module.exports= chatSessionsCount;

