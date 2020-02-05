const {chats} = require("./chatModel");
const io = require("socket.io");



exports.startChat = (io, req, res)=>{
    io.on("connection", socket=>{

    });
}
//exports.chats = ()=>{}
