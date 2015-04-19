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
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
     messageModel = require("./../models/message_model"),
     notificationIO = require("./../sockets/notification_socket");

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
       * Create varables
       */
      let requestObject = yield parse(this),
          token = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(token, environment.default.secret),
          createdMessage, Message = new messageModel();

      /**
       * Verification
       */
      if (!decoded.user.admin) {
        this.throw(401, 'You dont have permssions');
      };
      if(!requestObject.message) {
        this.throw(401, 'message can not be blank');
      }

      /**
       * Add properties and Save in DB
       */
      requestObject.from = {
        _id: decoded.user.id, 
        name: decoded.user.name, 
        picture: decoded.user.picture
      }
      requestObject.createdTime = new Date();
      createdMessage = yield Message.createMessage(requestObject);


      this.status = 201;
      this.body = {
        title: "success create message",
        message: createdMessage[0]
      };

    /**
     * Notify all throw web message socket
     */
    requestObject.id = requestObject._id;
    delete requestObject._id;
    notificationIO.notifyAll('message.created', requestObject);

    } catch (err) {
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
