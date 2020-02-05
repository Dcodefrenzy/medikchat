const {chatSessions} = require("./chatSessionsModel");
const io = require("socket.io");


//this is a session middleware that cheks if a section is open or closed.
//exports.checkActiveSection=()=>{}

//start a session between a user and a doctor.
//exports.startSession=()=>{}

//a user have many sessions and their chats are stored in the chat module.
//exports.getUserSessions=(){}

//doctors also have many sessions
//exports.getDoctorSessions=()=>{}

//endSession put an end to a particular session via session id,
//exports.endSession=()=>{}