"use strict"

/**
 * appConfig object
 */
let appConfig = {
  default: {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    secret: process.env.SECRET || 'secret key',
    pass1: process.env.PASS || 'pass1',
    pass2: process.env.PASS || 'pass2'
  },
  mongo: {
    url: 'mongodb://localhost:27017/Relacation'
  }
};

/**
 * Export
 */
module.exports = appConfig;