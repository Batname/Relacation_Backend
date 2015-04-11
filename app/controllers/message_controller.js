"use strict";

/**
 *  Import librares
 */
 let jwt = require("koa-jwt"),
     request = require('co-request'),
     parse = require('co-body'),
     _ = require("lodash");

/**
 *  Import local files
 */
 let mongo = require('./../../config/database/mongo/mongo'),
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");
/**
 * Global varables
 */
let ObjectID = mongo.ObjectID;

let message = (function() {

  /**
   * POST /api/v1/message
   * POST message
   */
  let _create = function *() {
    try{

      /**
       * message from request
       * @type {Object}
       */
        let message = yield parse(this);

        if(!message.message) {
          this.throw(401, 'message can not be blank');
        };

        /**
         * Check rules
         */
        let token = this.request.headers.authorization.split(' ')[1];
        let decoded = jwt.decode(token, environment.default.secret);

        if (!decoded.user.admin) {
          this.throw(401, 'You dont have permssions');
        };

        /**
         * Add properties
         */
        message.from = {
          _id: decoded.user.id, 
          name: decoded.user.name, 
          picture: decoded.user.picture
        }
        message.createdTime = new Date();

        /**
         * Save in DB
         */
        let results = yield mongo.messages.insert(message);

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        title: "success create message",
        message: results[0]
      };

      /**
       * now notify everyone about this new message
       */
      message.id = message._id;
      delete message._id;
      //ws.notify('message.created', message);
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "create message error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * Return public methods
   */
   return {
    create: _create
   }

})();

/**
 * Export
 */
module.exports = message;
