"use strict";

/**
 * Import librares
 */

let logger = require("koa-logger"),
    jwt = require("koa-jwt"),
    cors = require("koa-cors"),
    route = require("koa-route"),
    locale = require('koa-locale'),
    i18n = require('koa-i18n');

/**
 * Import local files
 */
let environment = require("./environments/" + process.env.NODE_ENV + "_config"),
    ensureAuthenticated = require("./auth/ensure_authenticated");

/**
 * Import controllers
 */
let user = require("./../app/controllers/user_controller")

/**
 * Router config, necessary for export in main file.
 */
let rouretConfigs = {
  handleConfigs: function (app) {
    app.use(logger());

    app.use(cors({
      maxAge: environment.default.cacheTime / 1000,
      credentials: true,
      methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
      headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    }));

    locale(app);

    app.use(i18n(app, {
     directory: './config/locales',
     locales: ['en-UA', 'ru-UA'],
     modes: [
       'query'               //  optional detect querystring - `/?locale=en-UA`
     ]
    }));
  },

  handlePublicRouters: function (app) {
    /**
     * User routers
     */
    app.use(route.post("/user/signup", user.signup));
  },
  handlePrivateRouters: function (app) {

    app.use(ensureAuthenticated());
    app.use(jwt({secret: environment.default.secret}));
    app.use(route.get("/token-check", user.checkToken));
  },
  handleErrorRouters: function (app) {

  },
};

/**
 * Export
 */
module.exports = rouretConfigs;