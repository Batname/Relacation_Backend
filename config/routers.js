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
let user = require("./../app/controllers/user_controller"),
    password = require("./../app/controllers/password_controller"),
    feedback = require("./../app/controllers/feedback_controller"),
    post = require("./../app/controllers/post_controller"),
    message = require("./../app/controllers/message_controller");

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

    /**
     * Using localization and i18n
     */
    locale(app);
    app.use(i18n(app, {
     directory: './config/locales',
     locales: ['en-UA', 'ru-UA'],
     modes: [
       'query'
     ]
    }));

    /**
     * handle queries from requests
     */
    require('koa-qs')(app, 'extended');
  },

  handlePublicRouters: function (app) {
    /**
     * User routers
     */
    app.use(route.post("/api/v1/user/signup", user.signup));
    app.use(route.post("/api/v1/user/signin", user.signin));
    app.use(route.get("/api/v1/user/:userId", user.get));

    /**
     * Post routers
     */
    app.use(route.get("/api/v1/posts", post.list));
    app.use(route.get("/api/v1/post/:postId", post.get));

    /**
     * Forgot password
     */
    app.use(route.get("/api/v1/password/forgot", password.getForgot));
    app.use(route.post("/api/v1/password/forgot", password.postForgot));

    /**
     * Reset password
     */
    app.use(route.get("/api/v1/password/forgot/reset/:temporaryPass", password.getReset));
    app.use(route.post("/api/v1/password/forgot/reset/:temporaryPass", password.postReset));

    /**
     * Feedback
     */
    app.use(route.post("/api/v1/feedback", feedback.send));

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
    app.use(route.put("/api/v1/user/logout/:userId", user.logout));

    /**
     * Post private routers
     */
    app.use(route.post("/api/v1/post", post.create));
    app.use(route.put("/api/v1/post/:postId", post.update));
    app.use(route.del("/api/v1/post/:postId", post.delete));
    app.use(route.post("/api/v1/post/:postId/comment", post.createComment));

    /**
     * Message private routers
     */
    app.use(route.post("/api/v1/message", message.create));

  },
  handleErrorRouters: function (app) {

  },
};

module.exports = rouretConfigs;