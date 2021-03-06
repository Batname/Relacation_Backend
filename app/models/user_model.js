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

const SCHEMA = ["name", "email", "pass"];

let User = function (properties) {
  this.init();
  _.assign(this, properties || {});
};
User.prototype = Object.create(Abstract.prototype);

User.prototype.setProperties = function(properties){
  Abstract.apply(this, arguments);
  _.assign(this, properties || {});
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

User.prototype.save = function *() {
  let user, data;
  yield this.hashPassword();

  data = _.pick(this, SCHEMA);
  user = yield mongo.users.insert(_.assign(data, {'createdTime': createdTime}));
  return user;
};

User.prototype.update = function *(id) {
  let data;
  data = _.pick(this, SCHEMA);
  yield mongo.users.update(
      {_id: id},
      {$set: data}
  );
};

User.prototype.delete = function *(id) {
  yield mongo.users.remove( {"_id": id});
};

module.exports = User;