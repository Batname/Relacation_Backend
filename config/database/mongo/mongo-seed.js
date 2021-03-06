'use strict';

/**
 * require libraries
 */
let bcrypt = require('co-bcryptjs'),
    bcryptSync = require('bcryptjs'),
    co = require("co");

/**
 * require local files
 */
let mongo = require('./mongo'),
    environment = require("./../../environments/" + process.env.NODE_ENV + "_config");;

/**
 * Varables
 */
let ObjectID = mongo.ObjectID,
    now = new Date();
/**
 * Private Functions
 */

/**
 * Return Time
 * @param  {Number} h
 * @return {String}
 */
function getTime(h) {
  return new Date(new Date(now).setHours(now.getHours() + h));
}

/**
 * Create salt and hash varables
 */
let salt = bcryptSync.genSaltSync(10);
/**
 * users object
 */
let users = [
  {
    _id: new ObjectID("5527a81b9f8ab90e5fc1513a"),
    email: 'dadubinin@gmail.com',
    pass: bcryptSync.hashSync(environment.default.pass1, salt),
    name: 'Morgan the Almighty',
    admin: true,
    picture: "",
    resetPassword: "1a10LgjVFbkT2I2Xq7Hgguzq5uCA8ddjzP3m6PQXS8S7N2yPWPa8DL3",
    resetPasswordExpires: 3600 + (Date.now() / 1000 | 0)
  },
  {
    _id: new ObjectID("5527a81b9f8ab90e5fc1514a"),
    email: 'dadubinin1@gmail.com',
    pass: bcryptSync.hashSync(environment.default.pass2, salt),
    name: 'Chuck Norris',
    admin: true,
    picture: "",
    resetPassword: "2a10LgjVFbkT2I2Xq7Hgguzq5uCA8ddjzP3m6PQXS8S7N2yPWPa8DL3",
    resetPasswordExpires: 3600 + (Date.now() / 1000 | 0)
  }
];

/**
 * Populates the database with seed data.
 * @param overwrite Overwrite existing database even if it is not empty.
 */
function *seed(overwrite) {
  let count = yield mongo.users.count({}, {limit: 1});
  if (overwrite || count === 0) {

    /**
     * Remove any collection
     */
    let collerrmsg = 'ns not found';
    for (let collection in mongo) {
      if (mongo[collection].drop) {
        try {
          yield mongo[collection].drop();
        } catch (err) {
          if (err.message !== collerrmsg) {
            throw err;
          }
        }
      }
    }

    /**
     * client object
     */

     let client = {
         name: environment.client.name,
         clientId: environment.client.clientId,
         clientSecret: environment.client.clientSecret
     };
    /**
     * posts_en object
     */
    let posts_en = [
      {
        _id: new ObjectID("5527a81b9f8ab90e5fc1515a"),
        from: {_id: 1, name: 'Morgan the Almighty', picture: '/api/users/1/picture'},
        message: 'Hi there! This is a sample post demonstrating a KOAN app. KOAN is a simple boilerplate for building full-stack JavaScript Web applications using Koa, AngularJS, and Node.js. It utilizes WebSockets to provide real-time communication between servers and clients. MongoDB is used for data persistence and Passport.js for social logins. There are also numerous Grunt tasks pre-bundled and configured to facilitate development and testing. You can open this site in multiple browser tabs and post something to see how real-time communication works. You can also browse the project’s GitHub page to start building KOAN apps yourself.',
        createdTime: getTime(-97),
        updatedTime: getTime(-24),
        comments: [
          {
            _id: new ObjectID(),
            from: {_id: 2, name: 'Chuck Norris', picture: '/api/users/2/picture'},
            createdTime: getTime(-26),
            message: 'Also remember that, if you can read this, you are within range of Chuck!'
          },
          {
            _id: new ObjectID(),
            from: {_id: 1, name: 'Morgan the Almighty', picture: '/api/users/1/picture'},
            createdTime: getTime(-24),
            message: 'Ow yeah!'
          }
        ]
      }
    ];

    /**
     * posts_ua object
     */
    let posts_ua = [
      {
        _id: new ObjectID(),
        from: {_id: 1, name: 'Morgan the Almighty', picture: '/api/users/1/picture'},
        message: 'Ua there! This is a sample post demonstrating a KOAN app. KOAN is a simple boilerplate for building full-stack JavaScript Web applications using Koa, AngularJS, and Node.js. It utilizes WebSockets to provide real-time communication between servers and clients. MongoDB is used for data persistence and Passport.js for social logins. There are also numerous Grunt tasks pre-bundled and configured to facilitate development and testing. You can open this site in multiple browser tabs and post something to see how real-time communication works. You can also browse the project’s GitHub page to start building KOAN apps yourself.',
        createdTime: getTime(-97),
        updatedTime: getTime(-24),
        comments: [
          {
            _id: new ObjectID(),
            from: {_id: 2, name: 'Chuck Norris', picture: '/api/users/2/picture'},
            createdTime: getTime(-26),
            message: 'Also remember that, if you can read this, you are within range of Chuck!'
          },
          {
            _id: new ObjectID(),
            from: {_id: 1, name: 'Morgan the Almighty', picture: '/api/users/1/picture'},
            createdTime: getTime(-24),
            message: 'Ow yeah!'
          }
        ]
      }
    ];

    /**
     * messages object
     */
    let messages = [
      {
        _id: new ObjectID(),
        from: {_id: 1, name: 'Morgan the Almighty', picture: '/api/users/1/picture'},
        message: 'Hi there! This is a sample post demonstrating a KOAN app. KOAN is a simple boilerplate for building full-stack JavaScript Web applications using Koa, AngularJS, and Node.js. It utilizes WebSockets to provide real-time communication between servers and clients. MongoDB is used for data persistence and Passport.js for social logins. There are also numerous Grunt tasks pre-bundled and configured to facilitate development and testing. You can open this site in multiple browser tabs and post something to see how real-time communication works. You can also browse the project’s GitHub page to start building KOAN apps yourself.',
        createdTime: getTime(-97),
        updatedTime: getTime(-24),
      },
      {
        _id: new ObjectID(),
        from: {_id: 2, name: 'Chuck Norris', picture: '/api/users/1/picture'},
        message: 'Chuck Norris there! This is a sample post demonstrating a KOAN app. KOAN is a simple boilerplate for building full-stack JavaScript Web applications using Koa, AngularJS, and Node.js. It utilizes WebSockets to provide real-time communication between servers and clients. MongoDB is used for data persistence and Passport.js for social logins. There are also numerous Grunt tasks pre-bundled and configured to facilitate development and testing. You can open this site in multiple browser tabs and post something to see how real-time communication works. You can also browse the project’s GitHub page to start building KOAN apps yourself.',
        createdTime: getTime(-97),
        updatedTime: getTime(-24),
      }
    ];

    /**
     * feedbacks object
     */
    let feedbacks = [
      {
        _id: new ObjectID(),
        name: 'Morgan the Almighty',
        email: 'dadubinin@gmail.com',
        message: 'Hi there! This is a sample post demonstrating a KOAN app. KOAN is a simple boilerplate for building full-stack JavaScript Web applications using Koa, AngularJS, and Node.js. It utilizes WebSockets to provide real-time communication between servers and clients. MongoDB is used for data persistence and Passport.js for social logins. There are also numerous Grunt tasks pre-bundled and configured to facilitate development and testing. You can open this site in multiple browser tabs and post something to see how real-time communication works. You can also browse the project’s GitHub page to start building KOAN apps yourself.',
        createdTime: getTime(-97)
      }
    ];

    yield mongo.counters.insert({_id: 'userId', seq: users.length});
    yield mongo.users.insert(users);
    yield mongo.clients.insert(client);
    yield mongo.posts_en.insert(posts_en);
    yield mongo.posts_ua.insert(posts_ua);
    yield mongo.messages.insert(messages);
    yield mongo.feedbacks.insert(feedbacks);

  }
}

/**
 * Export seed data and seed function
 */
seed.users = users;
module.exports = seed;