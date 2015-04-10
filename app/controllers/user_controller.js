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
/**
 * Global varables
 */
let ObjectID = mongo.ObjectID;

let user = (function() {

  let _signup = function *() {

      try {
        /**
         * Create user varables
         */
         let requestUser = yield parse(this);
         let user = yield mongo.users.findOne({email: requestUser.email});
         let salt = yield bcrypt.genSalt(10);

      /**
       * Check user in DB
       */
       if (user) {
        /**
         * Send occupied email error
         */
         this.throw(409, this.i18n.__('email_occupied'));
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
            * Update and save token
            */
           yield mongo.users.update(
               {_id: savedUser[0]._id},
               {$set: {
                 token: token
               }}
           );

          /**
           * Send responce
           */
           this.status = 201;
           this.body = {
            message: this.i18n.__('success_registration'),
            payload: savedUser[0],
            token: token
          }
        }

        /**
         * Send fields error
         */
         else {
          this.throw(409, this.i18n.__('fields_not_presence'));
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
  };

  let _signin = function *() {
    try {
      /**
       * Create request user verable
       * Create vareble user from search in DB
       */
      let credentials = yield parse(this);
      let user = yield mongo.users.findOne({email: credentials.email});

      /**
       * Check email
       */
      if(!user) {
        this.throw(401, 'Incorrect e-mail address.');
      }

      /**
       * Create compare Pass verable
       * @type {Boolean}
       */
      let comparePass = yield bcrypt.compare(credentials.pass, user.pass);

      /**
       * Check pass
       */
      if (!comparePass) {
        this.throw(401, 'Incorrect password.')
      }

      /**
       * Generate token
       */
      let token = createJwtToken(user);

      /**
       * Update and save token
       */
      yield mongo.users.update(
          {_id: user._id},
          {$set: {
            token: token
          }}
      );

      /**
       * Send success responce
       */
      this.status = 201;
      this.body = {
        message: "signin success",
        token: token
      }
    }
    /**
     * Send error responce
     */
    catch(err) {
      this.status = err.status || 500;
      this.body = {
        message: "signin error",
        status: this.status,
        title: err.message
      };
    }
  };

  let _update = function *(userId) {
    try {

      /**
       * credentials from request
       * @type {Object}
       */
      let credentials = yield parse(this);

      /**
       * Specific mongo id Format
       * @type {ObjectID}
       */
      let userObjectID  = new ObjectID(userId);

      /**
       * Check exists user
       * @type {ObjectID}
       */
      let existingUser = yield mongo.users.findOne({_id: userObjectID});
      if(!existingUser) {
        this.throw(401, 'User do not exist');
      }
      /**
       * Check rules
       */
      let startedToken = this.request.headers.authorization.split(' ')[1];
      let decoded = jwt.decode(startedToken, environment.default.secret);
      if (decoded.user._id != userId) {
        this.throw(401, 'You dont have permssions');
      }

      /**
       * Check availability email
       */
      let pointUser = yield mongo.users.findOne({email: credentials.email})
      if (pointUser && (decoded.user.email != credentials.email)) {
        this.throw(401, 'Email occupied');
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
      let userForUpdate = _.assign(credentials, { pass: cryptPass });
      yield mongo.users.update(
          {_id: userObjectID},
          {$set: userForUpdate}
      );

      /**
       * Find and check Updated user then set new token or throw error
       */
      let updatedUser = yield mongo.users.findOne({_id: userObjectID});

      /**
       * Check updatedUser
       * @param  {Object}
       */
      if (!updatedUser) {
        this.throw(401, 'Updated user not found');
      };

      /**
       * New token
       */
      let newToken = createJwtToken(updatedUser);

      /**
       * Update and save token
       */
      yield mongo.users.update(
          {_id: new ObjectID(updatedUser._id)},
          {$set: {
            token: newToken
          }}
      );

      /**
       * Response action
       */
      this.status = 201;
      this.body = {
        message: "update success",
        token: newToken
      }
    }
    /**
     * Error catching
     * @param  {Object} err
     */
    catch(err) {
      this.status = err.status || 500;
      this.body = {
        message: "update error",
        status: this.status,
        title: err.message
      };

    }
  };

  let _delete = function *(userId) {
    try {

      /**
       * credentials from request
       * @type {Object}
       */
      let credentials = yield parse(this);

      /**
       * Specific mongo id Format
       * @type {ObjectID}
       */
      let userObjectID  = new ObjectID(userId);

      /**
       * Check exists user
       * @type {ObjectID}
       */
      let existingUser = yield mongo.users.findOne({_id: userObjectID});
      if(!existingUser) {
        this.throw(401, 'User do not exist');
      }
      /**
       * Check rules
       */
      let startedToken = this.request.headers.authorization.split(' ')[1];
      let decoded = jwt.decode(startedToken, environment.default.secret);
      if (decoded.user._id != userId) {
        this.throw(401, 'You dont have permssions');
      };

      /**
       * Password miss
       */
      if(!credentials.pass){
        this.throw(401, 'Password does not exists');
      };

      /**
       * Create compare Pass verable
       * @type {Boolean}
       */
      let comparePass = yield bcrypt.compare(credentials.pass, decoded.user.pass);

      /**
       * Check pass
       */
      if (!comparePass) {
        this.throw(401, 'Incorrect password.')
      }

      /**
       * Delete operation
       */
      yield mongo.users.remove( {"_id": userObjectID});

      /**
       * Response action
       */
      this.status = 201;
      this.body = {
        message: "delete success"
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
   * Return public methods
   */
   return {
    signup: _signup,
    signin: _signin,
    update: _update,
    delete: _delete
  }

})();

/**
 * Export
 */
module.exports = user;
