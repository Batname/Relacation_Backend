"use strict"

/**
 * require libraries
 */
 let http = require("http"),
     koa = require("koa"),
     co = require("co");

/**
 * require local files
 */

 let environment = require("./config/environments/" + process.env.NODE_ENV + "_config"),
     mongo = require('./config/database/mongo/mongo'),
     mongoSeed = require('./config/database/mongo/mongo-seed'),
     routers = require("./config/routers");

/**
 * Varables
 */
 let app = koa(),
 server,
 io;

/**
 * Initialisation function
 */
 app.init = co.wrap(function *index() {

  /**
   * db connect
   */
   yield mongo.connect();

  /**
   * mongoSeed start. Any time overwrite databace.
   */
   yield mongoSeed(true);

  /**
   * routers configs
   */
   routers.handleConfigs(app);

   /**
    * connect public routers
    */
   routers.handlePublicRouters(app);

   /**
    * connect public routers
    */
   routers.handlePrivateRouters(app);

  /**
   * get server varable.
   */
   server = http.Server(app.callback());

  /**
   * default socket server.
   */
   require("./app/sockets/index_socket")(server);

  /**
   * start server.
   */
   server.listen(process.env.PORT);


  /**
   * Server logging
   */
   if(environment.log) {
    environment.log.getInfoMessage('Server listening on port ' + environment.app.port);
  }

});

/**
 * Inplement index function
 */
 if(!module.parent) {
  app.init().catch(function (err) {
    console.error(err.stack);
    process.exit(1);
  });
}
