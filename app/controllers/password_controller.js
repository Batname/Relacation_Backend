"use strict";

/**
 *  Import librares
 */
 let jwt = require("koa-jwt"),
     request = require('co-request'),
     parse = require('co-body'),
     bcrypt = require('co-bcrypt'),
     _ = require("lodash");

/**
 *  Import local files
 */
 let mongo = require('./../../config/database/mongo/mongo'),
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
     validateEmail = require("./../helpers/email_validation"),
     createJwtToken = require("./../../config/auth/create_jwt_token");
/**
 * Global varables
 */

let password = (function() {

  /**
   * GET /api/v1/password/forgot
   * Forgot Password page
   */
  let _getForgot = function *(){
    try{
      let token = this.request.header.authorization;

      if(token){
        this.throw(401, 'You authorization now');
      };
       this.status = 201;
       this.body = {
        message: "success get forgot"
      };
    }
    catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "forgot pass error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * POST /api/v1/password/forgot
   * Forgot Password page
   */
  let _postForgot = function *(){
    try{
      /**
       * Get request
       * @type {Object}
       */
      let credentials = yield parse(this);

      /**
       * Check email validation and availability
       */
      if(!credentials.email) {
        this.throw(401, 'Email does not exists');
      }

      if(!validateEmail(credentials.email)) {
        this.throw(401, 'Email not valid');
      }

      /**
       * Generate reset password
       */
      let salt = yield bcrypt.genSalt(10);
      let hash = yield bcrypt.hash('restpass', salt);
      let temporaryPass = hash.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

      let user = yield mongo.users.findOne({email: credentials.email});

      yield mongo.users.update(
          {email: credentials.email},
          {$set: {
            resetPassword: temporaryPass,
            resetPasswordExpires: (Date.now() / 1000 | 0)
          }}
      );

       this.status = 201;
       this.body = {
        message: "success send reset password",
        user: user,
        temporary_pass: temporaryPass
      };
    }
    catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "forgot pass error",
        status: this.status,
        title: err.message
      };
    }
  };

   /**
    * Return public methods
    */
    return {
     getForgot: _getForgot,
     postForgot: _postForgot
   }

 })();

 /**
  * Export
  */
 module.exports = password;
