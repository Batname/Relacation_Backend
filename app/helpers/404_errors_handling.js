"use strict";

/**
 * Error 404
 */
module.exports = function () {
  return function *handle404Errors(next) {
    yield next;
    let body = this.body;
    let status = this.status || 404;
    let noContent = ~[204, 205, 304].indexOf(status);

    /**
     * ignore body
     */
    if (noContent) return;

    /**
     * status body
     */
    if (null == body) {
      this.throw(status);
    }
  }
}