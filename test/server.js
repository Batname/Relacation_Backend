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
});

describe("Password model", function () {

  it("should get forgot", function *() {
    yield request
          .get("/password/forgot")
          .expect(201)
          .end();
  });

  it("should send forgot link pass", function *() {
    let result = yield request
                .post("/password/forgot")
                .send({email: "dadubinin@gmail.com"})
                .expect(201)
                .end();
  });

  it("should get reset pass", function *() {
    yield request
          .get("/password/forgot/reset/2a10LgjVFbkT2I2Xq7Hgguzq5uCA8ddjzP3m6PQXS8S7N2yPWPa8DL3")
          .expect(201)
          .end();
  });

  it("should reset pass", function *() {
    yield request
          .post("/password/forgot/reset/2a10LgjVFbkT2I2Xq7Hgguzq5uCA8ddjzP3m6PQXS8S7N2yPWPa8DL3")
          .send({pass: "21090191"})
          .expect(201)
          .end();
  });

});

describe("Post model", function () {

  it("should get posts", function *() {
    yield request
          .get("/posts?db_locale=en")
          .expect(201)
          .end();
  });

  it("should create post", function *() {
    yield request
          .post("/post?db_locale=en")
          .set('Authorization', token)
          .send({message: "Hi bat"})
          .expect(201)
          .end();
  });

  it("should update post", function *() {
    yield request
          .put("/post/5527a81b9f8ab90e5fc1515a?db_locale=en")
          .set('Authorization', token)
          .send({message: "Hi bat"})
          .expect(201)
          .end();
  });

  it("should delete post", function *() {
    yield request
          .del("/post/5527a81b9f8ab90e5fc1515a?db_locale=en")
          .set('Authorization', token)
          .expect(201)
          .end();
  });

  it("should get post", function *() {
    yield request
          .get("/post/5527a81b9f8ab90e5fc1515a?db_locale=en")
          .expect(201)
          .end();
  });  

  it("should push comment to post", function *() {
    yield request
          .post("/post/5527a81b9f8ab90e5fc1515a/comment?db_locale=en")
          .set('Authorization', token)
          .send({message: "New comment"})
          .expect(201)
          .end();
  });

});

describe("Message model", function () {

  it("should create message", function *() {
    yield request
          .post("/message")
          .set('Authorization', token)
          .send({message: "Hi socket message"})
          .expect(201)
          .end();
  });

});

describe("Feedback model", function () {

  it("should create feedback", function *() {
    yield request
          .post("/feedback")
          .send({name: "bat", email: "dadubinin@gmail.com", message: "Hi socket message"})
          .expect(201)
          .end();
  });

});