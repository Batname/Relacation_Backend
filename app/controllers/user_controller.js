"use strict";

/**
 *  Import librares
 */
 let jwt = require("koa-jwt"),
     request = require('co-request'),
     parse = require('co-body'),
     qs = require('querystring'),
     bcrypt = require('co-bcrypt'),
     _ = require("lodash");


/**
 *  Import local files
 */

 let mongo = require('./../../config/database/mongo/mongo'),
     userHelper = require("./../helpers/user_helper"),
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");

 let user = (function() {

  let _signup = function *() {

      try {
        /**
         * Create user varables
         */
         let requestUser = yield parse(this);
         let user = yield mongo.users.findOne({email: requestUser .email});
         let salt = yield bcrypt.genSalt(10);

      /**
       * Check user in DB
       */
       if (user) {
        /**
         * Send occupied email error
         */
         this.status = 409;
         this.body = {
          code: this.status,
          title: this.i18n.__('email_occupied')
        }
      }
      else {

        /**
         * Check fields presence
         */
         if(userHelper.checkFieldsPresence([requestUser])) {

          /**
           * Create additional user object parametrs
           */
           let cryptPass = yield bcrypt.hash(requestUser.pass, salt);
           let createdTime = new Date();

          /**
           * Insert in DB
           */
           let savedUser = yield mongo.users.insert(_.assign(requestUser, { 'pass': cryptPass, 'createdTime': createdTime, token: "" }));

          /**
           * Generate token
           */
           let token = jwt.sign(savedUser, environment.default.secret, {expiresInMinutes: 90 * 24 * 60 /* 90 days */});

           /**
            * Insert token
            */
           let insertToken = yield mongo.users.update(
               {_id: savedUser[0]._id},
               {$set: {token: token}}
           );

           /**
            * Responce user
            */
           let responseUser =  yield mongo.users.findOne({_id: savedUser[0]._id});
          /**
           * Send responce
           */
           this.status = 201;
           this.body = {
            message: this.i18n.__('success_registration'),
            responseUser: responseUser
          }
        }

        /**
         * Send fields error
         */
         else {
          this.status = 400;
          this.body = {
           message: this.i18n.__('fields_not_presence')
         }
       }
     }
   }

   /**
    * Catch other error
    */
    catch (err) {
      this.status = err.status || 500;
      this.body = {code: err.status, title: err.message};
    }
  }

  let _checkToken = function *() {
     this.status = 201;
     this.body = {
      message: "check token success",
      user: this.user
    }
  }

  /**
   * Return public methods
   */
   return {
    signup: _signup,
    checkToken: _checkToken
  }

})();


module.exports = user;
