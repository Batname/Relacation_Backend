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
  environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");

let Abstract = function () {};

Abstract.prototype.isPass = function *(pass){
  return yield bcrypt.compare(pass, this.pass);
};  

Abstract.prototype.isDecodePass = function *(pass, decoded_pass){
  return yield bcrypt.compare(pass, decoded_pass);
};  

module.exports = Abstract;