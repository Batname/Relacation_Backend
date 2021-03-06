'use strict';

let environment = require("./../config/environments/" + process.env.NODE_ENV + "_config"),
    mongoSeed = require('./../config/database/mongo/mongo-seed'),
    app = require('./../index'),
    jwt = require('koa-jwt'),
    baseUrl = 'http://localhost:' + environment.default.port + '/api/v1',
    supertest = require('co-supertest'),
    createJwtToken = require("./../config/auth/create_jwt_token"),
    request = supertest(baseUrl);



// create a valid jwt token to be sent with every request
let user = mongoSeed.users[0];
let token = createJwtToken({id: user._id, name: user.name, email: user.email, pass: user.pass, admin: user.admin});
token = 'Bearer ' + token;

// make request and token objects available
exports.request = request;
exports.token = token;

// initiate KOAN server before each test is run
// also drop and re-seed the test database before each run
console.log('Mocha starting to run server tests on port ' + environment.default.port);
beforeEach(function *() {
  yield app.init(true);
});

// close the server after each test is done
afterEach(function (done) {
  app.server.close(done);
});