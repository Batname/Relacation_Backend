"use strict"

/**
 * require local files
 */
let appConfig = require("./../app_config");

/**
 * Enviroment object, extend appConfig object
 */
let environment = Object.create(appConfig, {
  app: {
    port: appConfig.default.port || process.env.PORT
  }
});

/**
 * Export
 */
module.exports = environment;