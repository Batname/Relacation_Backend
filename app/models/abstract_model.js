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

Abstract.prototype.findUserByEmail = function *(email){
  let user = yield mongo.users.findOne({email: email}); 
  this.setProperties(user);
  return user; 
};

Abstract.prototype.findUserById = function *(id){
  let user = yield mongo.users.findOne({_id: id}); 
  this.setProperties(user);
  return user; 
};

Abstract.prototype.hashPassword = function *() {
  if(this.newPass) {
    this.newPass = false;
    let salt = yield bcrypt.genSalt(10);
    this.pass = yield bcrypt.hash(this.pass, salt);
  };
};

module.exports = Abstract;