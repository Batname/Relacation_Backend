"use strict"

/**
 *  Import local files
 */
let environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
    log = require('./../../logs/logs')(module);

/**
 *  Import librares
 */
let io = require("socket.io").listen(environment.sockets.port.message)
   .set("origins", "localhost:*")
   .set('logger', log);

/**
 * Export notify method
 */
module.exports.notifyAll = function(event, message) {
  io.sockets.emit(event, message);
};

