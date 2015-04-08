"use strict"

/**
 * require local files
 */
let log = require('./../../logs/logs')(module),
    appConfig = require("./../app_config");

/**
 * Enviroment object, extend appConfig object
 */
let environment = Object.create(appConfig, {
  log: {
    /**
     * getInfoMessage
     * @param  {String} message
     */
    getInfoMessage: function (message) {
      log.info(message);
    }
  },
  app: {
    port: appConfig.default.port || process.env.PORT
  }
});

/**
 * Export
 */
module.exports = environment;