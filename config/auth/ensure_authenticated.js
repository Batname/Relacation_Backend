"use strict";
/**
 *  Import librares
 */
let jwt = require("koa-jwt");

/**
 *  Import local files
 */
let environment = require("./../environments/" + process.env.NODE_ENV + "_config");

function ensureAuthenticated() {
  /**
   * Check auth
   * @param {Function} next
   * @yield
   */
  return function  *ensureAuthenticated(next) {
    if(this.request.header.authorization) {
      let token = this.request.headers.authorization.split(' ')[1];
      try {
        let decoded = jwt.decode(token, environment.default.secret);
        if (decoded.exp <= (Date.now() / 1000 | 0)) {
          this.status = 400;
          this.body = {
            message:'Access token has expired',
          }
        } else {
          this.user = decoded.user;
          yield* next;
        }
      } catch (err) {
          this.status = 500;
          this.body = {
            message: 'Error parsing token'
          };
      }
    } else {
      this.status = 401;
      this.body = {
        message: 'Protected resource, use Authorization header to get access'
      };
    }
  }
}

/**
 * Export
 */
module.exports = ensureAuthenticated;
 