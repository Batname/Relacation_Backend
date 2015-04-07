"use strict"

/**
 * require libraries
 */
let winston = require("winston");

/**
 * wrapper for winston module
 */
function getLogger (module) {
  let path = module.filename.split("/").slice(-2).join("/");

  return new winston.Logger({
    transports: [
    new winston.transports.Console({
      colorize: true,
      level: "debug",
      label: path
    })
    ]
  })
}

/**
 * Export
 */
module.exports = getLogger;