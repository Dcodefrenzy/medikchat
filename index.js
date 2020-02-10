const express = require("express");
const app = express();
const http = require('http').createServer(app)
const nameSpace = require("socket.io")(http);
const {mongoose} = require("./api/v1/model/mongoose");
const sessions = require("./api/v1/chatSessions/chatSessionsModel");
const sessionsCounts = require("./api/v1/chatSessionsCount/chatSessionsCountModel");
const chats = require("./api/v1/chat/chatModel")
 
const io = nameSpace.of('/chat');

io.on('connection', function(socket){
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
            
            if(!session) {
                const session = new sessions({from:from,to:to,start:new Date});
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
                    sessions.findByIdAndUpdate(session._id, {$set: {endSession:false, start:new Date}}, {new: true}).then((session)=>{
                        socket.join(session._id);
                        console.log({"old session":session})
                       io.to(session._id).emit("create session", session.to);
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
    
    socket.on("end session", (chatData)=>{ console.log(chatData)
        sessions.findOne({$or: [ {from:chatData.from, to:chatData.to}, {to:chatData.from, from:chatData.to}]}).then((session)=>{

            sessions.findByIdAndUpdate(session._id, {$set: {endSession:true}}, {new: true}).then((session)=>{
               // console.log({"session1":session})
                const sessionCount = new sessionsCounts({_sessionId:session._id, start:session.start});
                sessionCount.save().then((sessionCount)=>{
                        if (sessionCount) {     
                            socket.join(session._id);
                           // console.log({"session":session})
                          
                            io.to(session._id).emit("end session", session, sessionCount);
                        }
                }).catch((e)=>{
                    console.log(e)
                })
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
        sessions.findOne({$or: [ {from:chatData.from, to:chatData.to, endSession:false}, {to:chatData.from, from:chatData.to, endSession:false}]}).then((session)=>{
            const chat = new chats({from:chatData.from,to:chatData.to,message:chatData.message,sessionId:session._id});
            chat.save().then((chat)=>{
                    chats.find({sessionId:chat.sessionId}).then((chat)=>{
                      
                        socket.join(chat.sessionId);
                        io.to(chat.sessionId).emit('get message', chat);
                    })
            })
        }).catch(()=>{
            console.log(e);
        })
    })
    socket.on("fetch message", function(chatData){
        sessions.findOne({$or: [ {from:chatData.from, to:chatData.to, endSession:false}, {to:chatData.from, from:chatData.to, endSession:false}]}).then((session)=>{
           // console.log(session)
           if (!session) {
                io.to(socket.id).emit('fetch message', false);
           }else{
            chats.find({sessionId:session._id}).then((chat)=>{
               // console.log(chat)
                socket.join(chat.sessionId);
                io.to(chat.sessionId).emit('fetch message', chat);
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
    

    
  });

  http.listen(8080, function(){
    console.log('listening on *:8080');
  });
