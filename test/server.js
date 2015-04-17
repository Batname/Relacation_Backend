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

  it("should update a user", function *() {
    yield request
          .put("/user/update/5527a81b9f8ab90e5fc1513a")
          .set('Authorization', token)
          .send({email: "dadubinin9@gmail.com", pass: "pass1"})
          .expect(201)
          .end();
  });

  it("should delete a user", function *() {
    yield request
          .del("/user/delete/5527a81b9f8ab90e5fc1513a")
          .set('Authorization', token)
          .send({pass: "pass1"})
          .expect(201)
          .end();
  });

  it("should get a user", function *() {
    yield request
          .get("/user/5527a81b9f8ab90e5fc1513a")
          .expect(201)
          .end();
  });

  it("should logout user", function *() {
    yield request
          .put("/user/logout/5527a81b9f8ab90e5fc1513a")
          .set('Authorization', token)
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
