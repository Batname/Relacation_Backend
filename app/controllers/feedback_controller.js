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
       * Get request
       * @type {Object}
       */
       let credentials = yield parse(this);

       if(!feedbackHelper.checkFieldsPresence([credentials])){
        this.throw(401, 'fill in the required fields');
       };

       /**
        * Check email validity
        */
       if(!validateEmail(credentials.email)) {
         this.throw(401, 'Email not valid');
       };


       /**
        * Insert in DB
        */
       let savedFeedback = yield mongo.feedbacks.insert(credentials);

       /**
        * Send Feedback
        */
       let feedbackSend = feedbackMailer.send();
       yield feedbackSend(credentials, this);

       /**
        * Response action
        */
       this.status = 201;
       this.body = {
         message: "feedback send success",
         feedback: savedFeedback[0]
       }
     } 
     /**
      * Error Handelind
      * @param  {Object} err 
      */
     catch (err) {
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

/**
* Export
*/
module.exports = feedback;
