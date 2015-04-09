'use strict';

/**
 * MongoDB configuration using generators (with the help of co-mongo package).
 */

 /**
  * require libraries
  */
let comongo = require('co-mongo');

/**
 * Varables
 */
  
let connect = comongo.connect,
    environment = require("./../../environments/" + process.env.NODE_ENV + "_config");

/**
 * Opens a new connection to the mongo database, closing the existing one if exists.
 */
comongo.connect = function *() {
  if (comongo.db) {
    yield comongo.db.close();
  }

  /** 
   * export mongo db instance
   */
  var db = comongo.db = yield connect(environment.mongo.url);

  /** 
   * export default collections
   */
  comongo.counters = yield db.collection('counters');
  comongo.users = yield db.collection('users');
  comongo.clients = yield db.collection('clients');
  comongo.posts = yield db.collection('posts');
  comongo.messages = yield db.collection('messages');
  comongo.feedbacks = yield db.collection('feedbacks');
};


/**
 * Export
 */
module.exports = comongo;