"use strict";
/**
 *  Import librares
 */
let jwt = require("koa-jwt"),
    moment = require('moment');

/**
 *  Import local files
 */
let environment = require("./../environments/" + process.env.NODE_ENV + "_config");

/**
 * Export Create token function
 */
module.exports = function (user) {
  var payload = {
    user: user,
    iat: new Date().getTime(),
    exp: moment().add(7, 'days').valueOf()
  };
  return jwt.sign(payload, environment.default.secret, {expiresInMinutes: 90 * 24 * 60 /* 90 days */});
}