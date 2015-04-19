"use strict";

/**
 *  Import librares
 */
 let bcrypt = require('co-bcryptjs'),
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

const SCHEMA = ["pass", "resetPassword", "resetPasswordExpires"];  

let Password = function (properties) {
  this.init();
  _.assign(this, properties || {});
};

Password.prototype = Object.create(Abstract.prototype);

Password.prototype.setProperties = function(properties){
  Abstract.apply(this, arguments);
  _.assign(this, properties || {});
};

Password.prototype.init = function() {
  Object.defineProperty(this, "pass", {
    get: function() {
      return this._pass;
    },
    set: function (pass) {
      this._pass = pass;
      this.newPass = true;
    }
  });
};

Abstract.prototype.setResetPassword = function *() {
  let salt = yield bcrypt.genSalt(10),
      hash = yield bcrypt.hash('restpass', salt);
  this.temporaryPass = hash.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  this.resetPasswordExpires = 3600 + (Date.now() / 1000 | 0); 
};

Password.prototype.saveResetPassword = function *(email) {
  let data;
  yield this.setResetPassword();

  data = {resetPassword : this.temporaryPass, resetPasswordExpires : this.resetPasswordExpires};

  yield mongo.users.update(
      {email: email},
      {$set: data}
  );

  return this.temporaryPass;
};

Password.prototype.findByResetPassword = function *(temporaryPass){
  return yield mongo.users.findOne({resetPassword: temporaryPass});
};

Password.prototype.setNewPassword = function *(pass, user_id) {
  let data;

  yield this.hashPassword();    
  data = _.assign(_.pick(this, SCHEMA), {resetPassword : undefined, resetPasswordExpires : undefined});
  yield mongo.users.update(
     {_id: user_id},
     {$set: data}
  );

};

module.exports = Password;