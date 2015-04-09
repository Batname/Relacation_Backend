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
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
     createJwtToken = require("./../../config/auth/create_jwt_token");

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
           let savedUser = yield mongo.users.insert(_.assign(requestUser, { 'pass': cryptPass, 'createdTime': createdTime}));
           
          /**
           * Generate token
           */
           let token = createJwtToken(savedUser[0]);

          /**
           * Send responce
           */
           this.status = 201;
           this.body = {
            message: this.i18n.__('success_registration'),
            payload: _.assign(savedUser[0], {token: token})
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
    try {
      this.status = 201;
      this.body = {
        message: "check token success"
      }
    }  
    catch(e) {}
  }

  /**
   * Return public methods
   */
   return {
    signup: _signup,
    checkToken: _checkToken
  }

})();

/**
 * Export
 */
module.exports = user;
