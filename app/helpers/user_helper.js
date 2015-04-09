"use strict";

/**
 *  Import librares
 */
let _ = require("lodash");

/**
 * User helper methods
 * @return {Object}
 */
let userHelper = (function() {

  /**
   * Method check all necessary fields
   * @param  {Array} users users collections
   * @return {Boolean}
   */
  let _checkFieldsPresence = function (users) {
    let match =_.result(_.find(users, function(key) {
      return key.name && key.email && key.pass;
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

module.exports = userHelper;