"use strict"

/**
 *  Import librares
 */
let nodemailer = require("nodemailer"),
    sesTransport = require('nodemailer-ses-transport'),
    Q = require("q");

/**
 *  Import local files
 */
let environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
    log = require('./../../logs/logs')(module);

/**
 * create reusable transporter object using SMTP transport
 * @type {Object}
 */
let transporter = nodemailer.createTransport(sesTransport({
    accessKeyId: environment.email_transport.accessKeyId,
    secretAccessKey: environment.email_transport.secretAccessKey,
    rateLimit: 1
}));

/**
 * Export main sending clouser function
 * @param  {Object} user user object
 * @param  {Object} self this object
 * @param  {String} temporaryPass 
 * @return {Promice}
 */
module.exports.send = function () { 
  return function (user, self) {

          /**
           * [deferred promice]
           * @type {Promice}
           */
          let deferred = Q.defer();

          /**
           * Mail object
           * @type {Object}
           */
          let mailOptions = {
            to: user.email,
            from: environment.email_transport.email,
            subject: 'Success feedback',
            text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + self.request.host+ self.request.url + '/reset/'  + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          
          /**
           * Execute send mail
           */
          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                  log.error(error);
                  deferred.reject(error);
              }else{
                  log.info('Message sent: ' + JSON.stringify(info));
                  deferred.resolve('Message sent: ' + info.response);
              }
          });

          return deferred.promise;
        }
};
