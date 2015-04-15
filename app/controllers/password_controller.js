"use strict";

/**
 *  Import librares
 */
 let jwt = require("koa-jwt"),
     request = require('co-request'),
     parse = require('co-body'),
     bcrypt = require('co-bcryptjs'),
     _ = require("lodash");

/**
 *  Import local files
 */
 let mongo = require('./../../config/database/mongo/mongo'),
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
     validateEmail = require("./../helpers/email_validation"),
     createJwtToken = require("./../../config/auth/create_jwt_token"),
     forgotPassMailer = require("./../mailers/forgot_password");
/**
 * Global varables
 */
let ObjectID = mongo.ObjectID;
let password = (function() {

  /**
   * GET /api/v1/password/forgot
   * Forgot Password page
   */
  let _getForgot = function *(){
    try{

      /**
       * Create varables
       */
      let token = this.request.header.authorization;

      /**
       * Verification
       */
      if(token){
        this.throw(401, 'You authorization now');
      };

       this.status = 201;
       this.body = {
        message: "success get forgot"
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "get forgot pass error",
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
       * Create varables
       */
      let requestObject = yield parse(this),
          salt = yield bcrypt.genSalt(10),
          hash = yield bcrypt.hash('restpass', salt),
          temporaryPass = hash.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''),
          user = yield mongo.users.findOne({email: requestObject.email}),
          forgotPassSend = forgotPassMailer.forgot();

      /**
       * Verification
       */
      if(!user){
        this.throw(401, 'User do not exist');
      }
      if(!requestObject.email) {
        this.throw(401, 'Email does not exists');
      }
      if(!validateEmail(requestObject.email)) {
        this.throw(401, 'Email not valid');
      }

      /**
       * Update user in DB
       */
      yield mongo.users.update(
          {email: requestObject.email},
          {$set: {
            resetPassword: temporaryPass,
            resetPasswordExpires: 3600 + (Date.now() / 1000 | 0)
          }}
      );

      /**
       * Send Message
       */
      yield forgotPassSend(requestObject, this, temporaryPass);

      this.status = 201;
      this.body = {
        message: "success send reset password",
        temporary_pass: temporaryPass
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "post forgot pass error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * GET /api/v1/password/forgot/reset/:token
   * Reset Password
   */
  let _getReset = function *(temporaryPass){

    try{

      /**
       * Create varables
       */
       let user = yield mongo.users.findOne({resetPassword: temporaryPass});

      /**
       * Verification
       */
      if(!user) {
        this.throw(401, 'User with resetPassword does not exists');
      }
      if (user.resetPasswordExpires <= (Date.now() / 1000 | 0)) {
        this.throw(401, 'resetPassword has expired');
      }

      this.status = 201;
      this.body = {
        status: this.status,
        message: "success get reset",
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "get reset pass error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * POST /api/v1/password/forgot/reset/:temporaryPass
   * Process the reset password request.
   */
  let _postReset = function *(temporaryPass){
    try{

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          user = yield mongo.users.findOne({resetPassword: temporaryPass}),
          salt = yield bcrypt.genSalt(10),
          cryptPass = yield bcrypt.hash(requestObject.pass, salt),
          updatedUser, token,
          resetPassSend = forgotPassMailer.reset();

      /**
       * Verification
       */
      if(!user) {
        this.throw(401, 'User does not exists');
      };
      if (user.resetPasswordExpires <= (Date.now() / 1000 | 0)) {
        this.throw(401, 'resetPassword has expired');
      };
      if(!requestObject.pass){
        this.throw(401, 'Password does not exists');
      };

      /**
       * Update user in DB
       */
      yield mongo.users.update(
         {_id: user._id},
         {$set: {
          pass: cryptPass,
          resetPassword : undefined,
          resetPasswordExpires : undefined
           }
         }
      );

      /**
       * Created token operations
       */
      updatedUser = yield mongo.users.findOne({_id: user._id});
      updatedUser.id = updatedUser._id;
      delete updatedUser._id;
      delete updatedUser.password;
      token = createJwtToken(updatedUser);

      /**
       * Send Message
       */
      yield resetPassSend(user, this);

       this.status = 201;
       this.body = {
         message: "post reset pass success",
         token: token,
         userId: updatedUser.id
       }
   } catch (err) {
     this.status = err.status || 500;
     this.body = {
       message: "post reset pass error",
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
    postForgot: _postForgot,
    getReset: _getReset,
    postReset: _postReset
  }

})();

module.exports = password;
