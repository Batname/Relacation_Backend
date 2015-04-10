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
    ensureAuthenticated = require("./auth/ensure_authenticated"),
    handlePropagationErrors = require("./../app/helpers/propagation_errors_handling"),
    handle404Errors = require("./../app/helpers/404_errors_handling");

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

    /**
     * Using cors middleware
     */
    app.use(cors({
      maxAge: environment.default.cacheTime / 1000,
      credentials: true,
      methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
      headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    }));

    /**
     * Using localization
     */
    locale(app);

    /**
     * Using i18n
     */
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
    app.use(route.post("/api/v1/user/signup", user.signup));
    app.use(route.post("/api/v1/user/signin", user.signin));


    /**
     * Error handle
     */
    app.use(handlePropagationErrors());
    app.use(handle404Errors());
  },
  handlePrivateRouters: function (app) {

    /**
     * JWT check and error handle
     */
    app.use(ensureAuthenticated());
    app.use(jwt({secret: environment.default.secret}));

    /**
     * User private routers
     */
    app.use(route.put("/api/v1/user/update/:userId", user.update));
    app.use(route.del("/api/v1/user/delete/:userId", user.delete));

  },
  handleErrorRouters: function (app) {

  },
};

/**
 * Export
 */
module.exports = rouretConfigs;