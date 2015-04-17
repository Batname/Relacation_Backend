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
  environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");

let User = function (properties) {
  this.init();
  _.assign(this, properties);
};

User.prototype.init = function() {
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

User.prototype.hashPassword = function *() {
  if(this.newPass) {
    this.newPass = false;
    let salt = yield bcrypt.genSalt(10);
    this.pass = yield bcrypt.hash(this.pass, salt);
  };
};

User.prototype.save = function *() {
  let user;

  yield this.hashPassword();
  user = yield mongo.users.insert(this);
  return user;
};

module.exports = User;