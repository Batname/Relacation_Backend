"use strict"

/**
 * require libraries
 */
let _ = require("lodash"),
    path = require("path");

/**
 * appConfig object
 */
let appConfig = {
  default: {
    root: path.normalize(__dirname + '/..'),
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    secret: process.env.SECRET || 'secret key',
    pass1: process.env.PASS || 'pass1',
    pass2: process.env.PASS || 'pass2',
    cacheTime: 7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) */
  }
};

/**
 * mongoConfig object
 */
let mongoConfig = {
  mongo: {
    url: 'mongodb://localhost:27017/Relacation'
  }
};

/**
 * Client configs
 */

let client = {
  client: {
    "name": "React API v1",
    "clientId": "react",
    "clientSecret": "SomeRandomCharsAndNumbers"
  }
};

/**
 * authConfig object, connect to app
 */
let authConfig = {
  oauth: {
    facebook: {
      clientId: '231235687068678',
      clientSecret: process.env.FACEBOOK_SECRET || '4a90381c6bfa738bb18fb7d6046c14b8',
      callbackUrl: 'http://localhost:3000/signin/facebook/callback'
    },
    google: {
      clientId: '147832090796-ckhu1ehvsc8vv9nso7iefvu5fi7jrsou.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_SECRET || 'MGOwKgcLPEfCsLjcJJSPeFYu',
      callbackUrl: 'http://localhost:3000/signin/google/callback'
    },
    github: {
      clientID: process.env.GITHUB_ID || 'cb448b1d4f0c743a1e36',
      clientSecret: process.env.GITHUB_SECRET || '815aa4606f476444691c5f1c16b9c70da6714dc6',
      callbackURL: '/auth/github/callback',
      passReqToCallback: true
    },
    twitter: {
      consumerKey: process.env.TWITTER_KEY || '6NNBDyJ2TavL407A3lWxPFKBI',
      consumerSecret: process.env.TWITTER_SECRET  || 'ZHaYyK3DQCqv49Z9ofsYdqiUgeoICyh6uoBgFfu7OeYC7wTQKa',
      callbackURL: '/auth/twitter/callback',
      passReqToCallback: true
    },
    linkedin: {
      clientID: process.env.LINKEDIN_ID || '77chexmowru601',
      clientSecret: process.env.LINKEDIN_SECRET || 'szdC8lN2s2SuMSy8',
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/auth/linkedin/callback',
      scope: ['r_fullprofile', 'r_emailaddress', 'r_network'],
      passReqToCallback: true
    }
  }
};

let emailConfig = {
  email_transport: {
    email: "info@ng-dev.me",
    accessKeyId: "",
    secretAccessKey: "",
    rateLimit: 1
  }
}

let sockets = {
  sockets: {
    port: {
      message: 4020
    } 
  }
}

/**
 * Export
 */
module.exports = _.merge(appConfig, mongoConfig, client, authConfig, emailConfig, sockets);
