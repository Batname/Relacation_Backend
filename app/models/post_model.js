"use strict";

/**
 *  Import librares
 */
 let bcrypt = require('co-bcryptjs'),
     jwt = require("koa-jwt"),
     _ = require("lodash");

/**
 *  Import local files
 */
let mongo = require('./../../config/database/mongo/mongo'),
  Abstract = require("./abstract_model"),
  environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");

/**
 * Global varables
 */
let createdTime = new Date();  

const SCHEMA = ["from", "message", "createdTime", "updatedTime", "comments"];
const COMMENT_SCHEMA = ["_id", "from", "createdTime", "message"]

let Post = function (properties) {
  _.assign(this, properties || {});
};

Post.prototype = Object.create(Abstract.prototype);

Post.prototype.setProperties = function(properties){
  Abstract.apply(this, arguments);
  _.assign(this, properties || {});
};

Post.prototype.getPosts = function *(locale) {
  return yield mongo["posts_"+locale].find(
        {},
        {comments: {$slice: -15 }},
        {limit: 15, sort: {_id: -1}} ).toArray();
};

Post.prototype.createPost = function *(locale, post_object) {
  let data;

  data = _.pick(post_object, SCHEMA);

  return yield mongo["posts_"+locale].insert(data);
};

Post.prototype.updatePost = function *(locale, post_object, id) {
  let data;

  data = _.pick(post_object, SCHEMA);

  yield mongo["posts_"+locale].update(
      {_id: id},
      {$set: data}
  );
};

Post.prototype.pushComment = function *(locale, comment_object, id) {
  
  let data;

  data = _.pick(comment_object, SCHEMA);

  yield mongo["posts_"+locale].update(
      {_id: id},
      {$push: {comments: data}}
  );
};

Post.prototype.deletePost = function *(locale, id) {
  yield mongo["posts_"+locale].remove( {"_id": id});
};

Post.prototype.findPostById = function *(locale, id){
  return yield mongo["posts_"+locale].findOne({_id: id}); 
};


module.exports = Post;