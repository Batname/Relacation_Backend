"use strict";

/**
 *  Import librares
 */
 let bcrypt = require('co-bcryptjs'),
     jwt = require("koa-jwt"),
     _ = require("lodash");

/**
 *  Import local files
 */
let mongo = require('./../../config/database/mongo/mongo'),
  Abstract = require("./abstract_model"),
  environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");

/**
 * Global varables
 */
let createdTime = new Date();  

const SCHEMA = ["from", "message", "createdTime"];

let Message = function (properties) {
  Abstract.apply(this, arguments);
  _.assign(this, properties || {});
};

Message.prototype = Object.create(Abstract.prototype);

Message.prototype.createMessage = function *(message_object) {
  let data;

  data = _.pick(message_object, SCHEMA);

  return yield mongo.messages.insert(data);
};


module.exports = Message;