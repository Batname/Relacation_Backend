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
     validateEmail = require("./../helpers/email_validation"),
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
           * Check email validity
           */
          if(!validateEmail(requestUser.email)) {
            this.throw(401, 'Email not valid');
          }

          /**
           * Create additional user object parametrs
           */
           let cryptPass = yield bcrypt.hash(requestUser.pass, salt);
           let createdTime = new Date();

          /**
           * Insert in DB
           */
           let savedUser = yield mongo.users.insert(_.assign(requestUser, { 'pass': cryptPass, 'createdTime': createdTime}));
           let user = savedUser[0];

           /**
            * Dekete user for token
            */
           user.id = user._id;
           delete user._id;
           delete user.password;

           /**
            * Generate token
            */
           let token = createJwtToken(user);

          /**
           * Send responce
           */
           this.status = 201;
           this.body = {
            message: this.i18n.__('success_registration'),
            token: token,
            userId: user.id
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
       * Dekete user for token
       */
      user.id = user._id;
      delete user._id;
      delete user.password;

      /**
       * Generate token
       */
      let token = createJwtToken(user);

      /**
       * Send success responce
       */
      this.status = 201;
      this.body = {
        message: "signin success",
        token: token,
        userId: user.id
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
       * Password miss
       */
      if(!credentials.pass){
        this.throw(401, 'Password does not exists');
      };

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
      if (decoded.user.id != userId) {
        this.throw(401, 'You dont have permssions');
      }
      
      /**
       * Create compare Pass varable
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
       * Check availability email
       */
      let pointUser = yield mongo.users.findOne({email: credentials.email})
      if (pointUser && (decoded.user.email != credentials.email)) {
        this.throw(401, 'Email occupied');
      };

      /**
       * Check email validity
       */
      if(!validateEmail(credentials.email)) {
        this.throw(401, 'Email not valid');
      }

      /**
       * Update operation
       */
      let userForUpdate = _.assign(credentials, { pass: decoded.user.pass });
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
       * Response action
       */
      this.status = 201;
      this.body = {
        message: "update success",
        userId: updatedUser._id
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

  /**
   * DELETE /api/v1/user/delete/:userId
   * Delete user info - public
   */
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
      if (decoded.user.id != userId) {
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
        message: "delete success",
        userId: existingUser._id
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
       * Specific mongo id Format
       * @type {ObjectID}
       */
      let userObjectID  = new ObjectID(userId);

      /**
       * Check exists user
       * @type {ObjectID}
       */
      let user = yield mongo.users.findOne({_id: userObjectID});

      if(!user){
        this.throw(401, 'User do not exist');
      };

      /**
       * Response action
       */
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
       * Specific mongo id Format
       * @type {ObjectID}
       */
      let userObjectID  = new ObjectID(userId);

      /**
       * Check exists user
       * @type {ObjectID}
       */
      let user = yield mongo.users.findOne({_id: userObjectID});

      if(!user){
        this.throw(401, 'User do not exist');
      };

      /**
       * Check rules
       */
      let token = this.request.headers.authorization.split(' ')[1];
      let decoded = jwt.decode(token, environment.default.secret);
      if (decoded.user.id != userId) {
        this.throw(401, 'You dont have permssions');
      };

      /**
       * Response action
       */
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

/**
 * Export
 */
module.exports = user;
