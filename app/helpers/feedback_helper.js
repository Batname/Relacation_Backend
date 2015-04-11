"use strict";

/**
 *  Import librares
 */
let _ = require("lodash");

/**
 * User helper methods
 * @return {Object}
 */
let feedbackHelper = (function() {

  /**
   * Method check all necessary fields
   * @param  {Array} users users collections
   * @return {Boolean}
   */
  let _checkFieldsPresence = function (users) {
    let match =_.result(_.find(users, function(key) {
      return key.name && key.email && key.message;
    }), 'name');

    return !!match;
  }

  /**
   * Return public methods
   */
  return {
    checkFieldsPresence: _checkFieldsPresence
  }

})();

module.exports = feedbackHelper;