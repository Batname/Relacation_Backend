"use strict";

/**
 *  Import librares
 */
 let jwt = require("koa-jwt"),
     request = require('co-request'),
     parse = require('co-body'),
     qs = require('querystring'),
     bcrypt = require('co-bcryptjs'),
     _ = require("lodash");

/**
 *  Import local files
 */
 let mongo = require('./../../config/database/mongo/mongo'),
     userHelper = require("./../helpers/user_helper"),
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
     validateEmail = require("./../helpers/email_validation"),
     userModel = require("./../models/user_model"),
     createJwtToken = require("./../../config/auth/create_jwt_token");
/**
 * Global varables
 */
let ObjectID = mongo.ObjectID;
let user = (function() {

  /**
   * POST /api/v1/user/signup
   * signup user functionality
   */
  let _signup = function *() {

    try {
      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          user = yield mongo.users.findOne({email: requestObject.email}),
          salt = yield bcrypt.genSalt(10),
          cryptPass = yield bcrypt.hash(requestObject.pass, salt),
          createdTime = new Date(),
          newUser, createdUser, token;

      /**
       * Verification
       */
      if(!userHelper.checkFieldsPresence([requestObject])) {
        this.throw(401, this.i18n.__('fields_not_presence'));
      }
      if(!validateEmail(requestObject.email)) {
        this.throw(401, 'Email not valid');
      }
      if (user) {
        this.throw(409, this.i18n.__('email_occupied'));
      }

      /**
       * Save in DB operations
       */
      //createdUser = yield mongo.users.insert(_.assign(requestObject, { 'pass': cryptPass, 'createdTime': createdTime}));
      newUser = new userModel(_.assign(requestObject, { 'pass': requestObject.pass, 'createdTime': createdTime}));
      createdUser = yield newUser.save();

      /**
       * Created token operations
       */
      createdUser[0].id = createdUser[0]._id;
      delete createdUser[0]._id;
      delete createdUser[0].password;
      token = createJwtToken(createdUser[0]);

      this.status = 201;
      this.body = {
        message: this.i18n.__('success_registration'),
        token: token,
        userId: createdUser[0].id
      }
    } catch (err) {
      this.status = err.status || 500;
      this.body = {code: err.status, title: err.message};
    }
  };

  /**
   * POST /api/v1/user/signin
   * signin user functionality
   */
  let _signin = function *() {
    try {

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          user = yield mongo.users.findOne({email: requestObject.email}),
          comparePass, token;

      /**
       * Verification
       */
      if(!requestObject.pass && !requestObject.email) {
        this.throw(401, this.i18n.__('fields_not_presence'));
      }
      if(!user) {
        this.throw(401, 'Incorrect e-mail address.');
      }
      comparePass = yield bcrypt.compare(requestObject.pass, user.pass);
      if (!comparePass) {
        this.throw(401, 'Incorrect password.')
      }

      /**
       * Created token operations
       */
      user.id = user._id;
      delete user._id;
      delete user.password;
      token = createJwtToken(user);

      this.status = 201;
      this.body = {
        message: "signin success",
        token: token,
        userId: user.id
      }
    } catch(err) {
      this.status = err.status || 500;
      this.body = {
        message: "signin error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * PUT /api/v1/user/update/:userId
   * Update user functionality
   */
  let _update = function *(userId) {
    try {

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          mongoObjectId  = new ObjectID(userId),
          user = yield mongo.users.findOne({_id: mongoObjectId}),
          requestToken = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(requestToken, environment.default.secret),
          comparePass = yield bcrypt.compare(requestObject.pass, decoded.user.pass),
          markedUser, updatedUser;

      /**
       * Verification
       */
      if(!user) {
        this.throw(401, 'User do not exist');
      }
      if (decoded.user.id != userId) {
        this.throw(401, 'You dont have permssions');
      }
      if(!requestObject.pass){
        this.throw(401, 'Password does not exists');
      }
      if(!validateEmail(requestObject.email)) {
        this.throw(401, 'Email not valid');
      }
      markedUser = yield mongo.users.findOne({email: requestObject.email})
      if (markedUser && (decoded.user.email != requestObject.email)) {
        this.throw(401, 'Email occupied');
      }
      if (!comparePass) {
        this.throw(401, 'Incorrect password.')
      }

      /**
       * Update in DB operations
       */
      updatedUser = _.assign(requestObject, { pass: decoded.user.pass });
      yield mongo.users.update(
          {_id: mongoObjectId},
          {$set: updatedUser}
      );

      this.status = 201;
      this.body = {
        message: "update success",
        userId: userId
      }
    } catch(err) {
      this.status = err.status || 500;
      this.body = {
        message: "update error",
        status: this.status,
        title: err.message
      };

    }
  };

  /**
   * DELETE /api/v1/user/delete/:userId
   * Delete user info - public
   */
  let _delete = function *(userId) {
    try {

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          mongoObjectId  = new ObjectID(userId),
          user = yield mongo.users.findOne({_id: mongoObjectId}),
          requestToken = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(requestToken, environment.default.secret),
          comparePass = yield bcrypt.compare(requestObject.pass, decoded.user.pass);

      /**
       * Verification
       */
      if(!user) {
        this.throw(401, 'User do not exist');
      }
      if (decoded.user.id != userId) {
        this.throw(401, 'You dont have permssions');
      }
      if(!requestObject.pass){
        this.throw(401, 'Password does not exists');
      }
      if (!comparePass) {
        this.throw(401, 'Incorrect password.')
      }

      /**
       * Delete operation in DB
       */
      yield mongo.users.remove( {"_id": mongoObjectId});

      this.status = 201;
      this.body = {
        message: "delete success",
        userId: userId
      }
    }
    catch(err) {
      this.status = err.status || 500;
      this.body = {
        message: "delete error",
        status: this.status,
        title: err.message
      };

    }
  };

  /**
   * GET /api/v1/user/:userId
   * Get user info - public
   */
  let _get = function *(userId) {
    try{

      /**
       * Create varables
       */
      let requestObject  = new ObjectID(userId),
          user = yield mongo.users.findOne({_id: requestObject});

      /**
       * Verification
       */
      if(!user){
        this.throw(401, 'User do not exist');
      }

      this.status = 201;
      this.body = {
        message: "get user success",
        userId: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }

    }
    catch(err){
      this.status = err.status || 500;
      this.body = {
        message: "get user error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * PUT /api/v1/user/logout/:userId
   * Lodout user, delete token
   */
  let _logout = function *(userId) {
    try{

      /**
       * Create varables
       */
      let requestObject  = new ObjectID(userId),
          user = yield mongo.users.findOne({_id: requestObject}),
          token = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(token, environment.default.secret);

      /**
       * Verification
       */
      if(!user){
        this.throw(401, 'User do not exist');
      }
      if (decoded.user.id != userId) {
        this.throw(401, 'You dont have permssions');
      }

      this.status = 201;
      this.body = {
        userId: user._id,
        message: "logout user success"
      }

    }
    catch(err){
      this.status = err.status || 500;
      this.body = {
        message: "logout user error",
        status: this.status,
        title: err.message
      };
    }

  }

  /**
   * Return public methods
   */
   return {
    signup: _signup,
    signin: _signin,
    update: _update,
    delete: _delete,
    get: _get,
    logout: _logout
  }
})();

module.exports = user;
