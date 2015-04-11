"use strict"

/**
 *  Import local files
 */
let environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");

/**
 *  Import librares
 */
let log = require('./../../logs/logs')(module),
    io = require("socket.io").listen(environment.sockets.port.message)
   .set("origins", "localhost:*")
   .set('logger', log);

/**
 * Export notify method
 */
module.exports.notify = function(event, message) {
  io.sockets.emit(event, message);
};

