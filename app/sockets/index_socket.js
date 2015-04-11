"use strict"

let log = require('./../../logs/logs')(module);


module.exports = function(server) {
  let io = require("socket.io").listen(server);
  io.set("origins", "localhost:*");
  io.set('logger', log);
  
  io.sockets.on("connection", function (socket) {

    socket.on("message", function (text, cb) {
      socket.brodcast.emit(message, text);
    });
    
  });
};

