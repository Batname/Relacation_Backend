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
const SCHEMA = ["name", "email", "message"];

let Feedback = function (properties) {
  Abstract.apply(this, arguments);
  _.assign(this, properties || {});
};

Feedback.prototype = Object.create(Abstract.prototype);

Feedback.prototype.createFeedback = function *(feedback_object) {
  let data;

  data = _.pick(feedback_object, SCHEMA);

  return yield mongo.feedbacks.insert(data);
};

module.exports = Feedback;