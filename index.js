const express = require("express");
const app = express();
const cors = require('cors')
const http = require('http').createServer(app)
const io = require("socket.io")(http, {path: '/socket.io'});
const {mongoose} = require("./api/v1/model/mongoose");
const sessions = require("./api/v1/chatSessions/chatSessionsModel");
const sessionsCounts = require("./api/v1/chatSessionsCount/chatSessionsCountModel");
const chats = require("./api/v1/chat/chatModel");

const bodyParser = require("body-parser");
const morgan = require("morgan");
 
//const sio = io.of('/socket.io');

const coreOptions = {
        origin: "http://localhost:3000", 
        optionsSuccessStatus: 200
}

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(morgan('dev'));
app.use(cors(coreOptions));
app.use(cors())



io.on('connection', function(socket){
    socket.on("all sessions", ()=>{
        sessions.find({endSession:false}).then((sessions)=>{
            console.log(sessions);
            socket.emit('all sessions', sessions);
        })
    })
    socket.on("check session", (from)=>{
        sessions.findOne({$or: [ {from:from, endSession:false}, {to:from, endSession:false}]}).then((session)=>{
          
            if (session) {
                socket.join(session._id);
                io.to(session._id).emit('check session', session);
            }else{
                io.to(socket.id).emit('check session', session);
            }
            

        }).catch((e)=>{
            console.log(e)
        })
    })
    socket.on("session start", (from, to)=>{
        sessions.findOne({$or: [ {from:from, to:to}, {from:to, to:from}]}).then((session)=>{
            
            const start = new Date();
            
            if(!session) {
                const session = new sessions({from:from,to:to,start:start});
                session.save().then((session)=>{
                    socket.join(session._id);
                    console.log({"new session":session} )
                    io.to(session._id).emit('create session', session.from, session.to)
                }).catch((e)=>{
                    console.log(e)
                })
             }else if(session){
                //console.log(session)
                if (session.endSession === true) {
                    sessions.findByIdAndUpdate(session._id, {$set: {endSession:false, start:start}}, {new: true}).then((session)=>{
                        socket.join(session._id);
                        console.log({"old session":session})
                       io.to(session._id).emit("create session",session.from, session.to);
                    })
                }else{      
                socket.join(session._id);
                
                console.log({"oldest session":session})
                 io.to(session._id).emit('create session', session.from, session.to)
                }
            }
        }).catch(e=>{
            console.log(e);
        })
    })
    
    socket.on("end session", (chatData)=>{ //console.log(chatData)
        sessions.findOne({$or: [ {from:chatData.from, to:chatData.to}, {to:chatData.from, from:chatData.to}]}).then((session)=>{

            sessions.findByIdAndUpdate(session._id, {$set: {endSession:true}}, {new: true}).then((session)=>{
            // console.log({"session1":session})    
             socket.join(session._id);
            
              io.to(session._id).emit("end session", session);
            })
        }).catch(e=>{
            console.log(e);
        })
    })

    socket.on("join session", (from, to)=>{
        sessions.findOne({$or: [ {from:from, to:to}, {from:to._id, to:from._id}]}).then((session)=>{
            if(!session) {
                    console.log("err")
             }else if(session){
                socket.join(session._id);
                io.to(socket.id).emit("store room", session);
               socket.to(session._id).to(to.sessionId).emit("join room", starter, to,"is online")
            }
        }).catch(e=>{
            console.log(e);
        })
    })

    socket.on("send message", function(chatData){
            const chat = new chats({from:chatData.from,to:chatData.to,message:chatData.message,sessionId:chatData.room,createdAt:new Date()});
            chat.save().then((chat)=>{                         
                //socket.join(chatData.room);
               // console.log(chat.message);
                socket.to(chatData.room).emit('get message', chat);
            }).catch(()=>{
                console.log(e);
            })
    })
    socket.on("fetch message", function(chatData){
       // console.log(chatData);
        sessions.findOne({$or: [ {from:chatData.from, to:chatData.to, endSession:false}, {to:chatData.from, from:chatData.to, endSession:false}]}).then((session)=>{
         //  console.log(session)
           if (!session) {
                io.to(socket.id).emit('fetch message', false);
           }else{
            chats.find({sessionId:session._id}).then((chat)=>{
               // console.log(chat)
                socket.join(session._id);
                socket.emit('fetch message', chat, session._id);
                })
            }
        }).catch((e)=>{
            console.log(e);
        })
    })

    socket.on("fetch session", function(from){
        sessions.find({$or: [ {from:from, endSession:false}, {to:from, endSession:false}]}).then((session)=>{
            io.to(socket.id).emit('fetch session', session);
        }).catch((e)=>{
            console.log(e)
        })
    })
    
    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
    
    
  });

  http.listen(7979, function(){
    console.log('listening on *:7979');
  });
