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
     feedbackHelper = require("./../helpers/feedback_helper"),
     feedbackMailer = require("./../mailers/feedback_mailer");
/**
 * Global varables
 */

let ObjectID = mongo.ObjectID;

let feedback = (function() {

  /**
   * POST /api/v1/feedback
   * Process feedback send
   */
  let _send = function *(temporaryPass){
    try{

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          feedbackSend = feedbackMailer.send(),
          createdFeedback;

      /**
       * Verification
       */
      if(!feedbackHelper.checkFieldsPresence([requestObject])){
       this.throw(401, 'fill in the required fields');
      }
      if(!validateEmail(requestObject.email)) {
        this.throw(401, 'Email not valid');
      };

      /**
       * Insert in DB
       */
      createdFeedback = yield mongo.feedbacks.insert(requestObject);

       /**
        * Send Feedback
        */
      yield feedbackSend(requestObject, this);

      this.status = 201;
      this.body = {
        message: "feedback send success",
        feedback: createdFeedback[0]
       }
     } catch (err) {
       this.status = err.status || 500;
       this.body = {
         message: "feedback send error",
         status: this.status,
         title: err.message
       };
     }
  }     

 /**
  * Return public methods
  */
  return {
   send: _send,
 }

})();

module.exports = feedback;
