"use strict"

/**
 * appConfig object
 */
let appConfig = {
  app: {
    port: process.env.PORT
  },
  mongo: {
    url: 'mongodb://localhost:27017/Relacation'
  }
};

/**
 * Export
 */
module.exports = appConfig;