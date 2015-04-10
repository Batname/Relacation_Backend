"use strict";

/**
 * Error propagation
 */
module.exports = function () {
  return function *handlePropagationErrors(next) {
    try {
      yield next;
    } catch (err) {
      err.status = err.status || 500;
      err.message = err.expose ? err.message : 'Kaboom!';

      /**
       * Set our response.
       */
      this.status = err.status;
      this.body = {code: err.status, message: err.message};
      this.app.emit('error', err, this);

    }
  }
}