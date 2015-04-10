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
      let token = this.request.header.authorization;

      /**
       * Check auth
       */
      if(token){
        this.throw(401, 'You authorization now');
      };

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "success get forgot"
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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

      /**
       * Check email validity
       */
      if(!validateEmail(credentials.email)) {
        this.throw(401, 'Email not valid');
      }

      /**
       * Generate reset password
       */
      let salt = yield bcrypt.genSalt(10);
      let hash = yield bcrypt.hash('restpass', salt);
      let temporaryPass = hash.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

      /**
       * Find user in DB
       * @type {Object}
       */
      let user = yield mongo.users.findOne({email: credentials.email});

      /**
       * Set pass in DB
       */
      yield mongo.users.update(
          {email: credentials.email},
          {$set: {
            resetPassword: temporaryPass,
            resetPasswordExpires: 3600 + (Date.now() / 1000 | 0)
          }}
      );

      /**
       * Send Message
       */
      let forgotPass = forgotPassMailer.forgot();
      yield forgotPass(credentials, this, temporaryPass);

       /**
        * Send Responce
        */
       this.status = 201;
       this.body = {
        message: "success send reset password",
        temporary_pass: temporaryPass
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
        * Search user in db
        */
       let user = yield mongo.users.findOne({resetPassword: temporaryPass});

       /**
        * Check user 
        */
       if(!user) {
         this.throw(401, 'User does not exists');
       };

       /**
        * Check time 
        */
       if (user.resetPasswordExpires <= (Date.now() / 1000 | 0)) {
        this.throw(401, 'resetPassword has expired');
       };

       /**
        * Send response to user
        */
       this.status = 201;
       this.body = {
        status: this.status,
        message: "success get reset",
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
       * Get request
       * @type {Object}
       */
       let credentials = yield parse(this);

       /**
        * Search user in db
        */
       let user = yield mongo.users.findOne({resetPassword: temporaryPass});

       /**
        * Check user 
        */
       if(!user) {
         this.throw(401, 'User does not exists');
       };

       /**
        * Check time 
        */
       if (user.resetPasswordExpires <= (Date.now() / 1000 | 0)) {
        this.throw(401, 'resetPassword has expired');
       };

       /**
        * Password miss
        */
       if(!credentials.pass){
         this.throw(401, 'Password does not exists');
       };

       /**
        * Create new password
        */
       let salt = yield bcrypt.genSalt(10);
       let cryptPass = yield bcrypt.hash(credentials.pass, salt);


       /**
        * Update operation
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
        * New token
        */
       let newToken = createJwtToken(user);

       /**
        * Update and save token
        */
       yield mongo.users.update(
           {_id: user._id},
           {$set: {
             token: newToken
           }}
       );

       /**
        * Send Message
        */
       let resetPass = forgotPassMailer.reset();
       yield resetPass(user, this);

       /**
        * Response action
        */
       this.status = 201;
       this.body = {
         message: "post reset pass success",
         token: newToken
       }


   }
   /**
    * Error Handelind
    * @param  {Object} err 
    */
   catch (err) {
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

 /**
  * Export
  */
 module.exports = password;
