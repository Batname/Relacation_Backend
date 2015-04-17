"use strict";

let mochaConf = require('./mocha.conf'),
    token = mochaConf.token,
    request = mochaConf.request;

require("co-mocha");

describe("User Model testing", function () {

  it("should create a user", function *() {
    yield request
          .post("/user/signup")
          .send({name: "dubinin", email: "dadubinin3@gmail.com", pass: "21091091"})
          .expect(201)
          .end();
  });

  it("should create a user", function *() {
    yield request
          .post("/user/signin")
          .set('Authorization', token)
          .send({email: "dadubinin@gmail.com", pass: "pass1"})
          .expect(201)
          .end();
  });

  it("should get forgot", function *() {
    yield request
          .get("/password/forgot")
          .expect(201)
          .end();
  });


});
