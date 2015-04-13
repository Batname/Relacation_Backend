"use strict";

/**
 *  Import librares
 */
 let jwt = require("koa-jwt"),
     request = require('co-request'),
     parse = require('co-body'),
     _ = require("lodash");

/**
 *  Import local files
 */
 let mongo = require('./../../config/database/mongo/mongo'),
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config"),
     notificationIO = require("./../sockets/notification_socket");
/**
 * Global varables
 */
let ObjectID = mongo.ObjectID;
let post = (function() {

  /**
   * GET /api/v1/posts
   * get list of posts
   */
  let _list = function *(){

    try{

      /**
       * Create varables
       */
      let posts;
      
      /**
       * Verification
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante, ?db_locale=en');
      }
      
      /**
       * Fund posts in DB
       */
      posts = yield mongo["posts_"+this.query.db_locale].find(
        {},
        {comments: {$slice: -15 }},
        {limit: 15, sort: {_id: -1}} ).toArray();
      posts.forEach(function (post) {
        post.id = post._id;
        delete post._id;
      });

      this.status = 201;
      this.body = {
        message: "success get posts list",
        posts: posts
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "get list posts error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * POST /api/v1/post
   * POST post
   */
  let _create = function *(){
    try{

      /**
       * Create varables
       */
      let requestObject = yield parse(this), 
          token = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(token, environment.default.secret),
          createdPost;

      /**
       * Verification
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante');
      }
      if(!mongo["posts_"+this.query.db_locale]) {
        this.throw(401, 'Db do not exists');
      }
      if (!decoded.user.admin) {
        this.throw(401, 'You dont have permssions');
      };
      if(!requestObject.message) {
        this.throw(401, 'message can not be blank');
      }

      /**
       * Add properties to post object
       */
      requestObject.from = {
        _id: decoded.user.id, 
        name: decoded.user.name, 
        picture: decoded.user.picture
      }
      requestObject.createdTime = new Date();
        
      /**
       * Save in DB
       */
      createdPost = yield mongo["posts_"+this.query.db_locale].insert(requestObject);

      this.status = 201;
      this.body = {
        message: "success create post",
        post: createdPost[0]
      };

      /**
       * send notification socket
       */
      createdPost[0].id = createdPost[0]._id;
      delete createdPost[0]._id;
      notificationIO.notifyAll('posts.created', createdPost[0]);
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "create post error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * PUT /api/v1/post/:postId
   * update post
   */
  let _update = function *(postId){
    try{

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          mongoObjectId  = new ObjectID(postId),
          token = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(token, environment.default.secret),
          updatePost, updatedPost, post;

      /**
       * Verification
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante');
      }
      if(!mongo["posts_"+this.query.db_locale]) {
        this.throw(401, 'Db do not exists');
      }
      post = yield mongo["posts_"+this.query.db_locale].findOne({_id: mongoObjectId});
      if(!post) {
        this.throw(401, 'Post do not exist');
      }
      if (!decoded.user.admin && post.from._id != decoded.user.id) {
        this.throw(401, 'You dont have permssions');
      };
      if(!requestObject.message) {
        this.throw(401, 'message can not be blank');
      };

      /**
       * Update operation and find updated post
       */
      updatePost = _.assign({ message: requestObject.message });
      yield mongo["posts_"+this.query.db_locale].update(
          {_id: mongoObjectId},
          {$set: updatePost}
      );
      updatedPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: mongoObjectId});

      this.status = 201;
      this.body = {
        message: "success update post",
        post: updatedPost
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "update post error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * DELETE /api/v1/post/:postId
   * delete post
   */
  let _delete = function *(postId){
    try{

      /**
       * Create varables
       */
      let mongoObjectId  = new ObjectID(postId),
          token = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(token, environment.default.secret),
          post;

      /**
       * Verification
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante');
      }
      if(!mongo["posts_"+this.query.db_locale]) {
        this.throw(401, 'Db do not exists');
      }
      post = yield mongo["posts_"+this.query.db_locale].findOne({_id: mongoObjectId});
      if(!post) {
        this.throw(401, 'Post do not exist');
      }
      if (!decoded.user.admin && post.from._id != decoded.user.id) {
        this.throw(401, 'You dont have permssions');
      };

      /**
       * Delete operation in db
       */
      yield mongo["posts_"+this.query.db_locale].remove( {"_id": mongoObjectId});

      this.status = 201;
      this.body = {
        message: "delete post success",
        postId: postId
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "delete post error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * GET /api/v1/post/:postId
   * get post
   */
  let _get = function *(postId){
    try{

      /**
       * Create varables
       */
      let mongoObjectId  = new ObjectID(postId),
          post;

      /**
       * Verification
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante');
      }
      if(!mongo["posts_"+this.query.db_locale]) {
        this.throw(401, 'Db do not exists');
      }
      post = yield mongo["posts_"+this.query.db_locale].findOne({_id: mongoObjectId});
      if(!post) {
        this.throw(401, 'Post do not exist');
      }

      this.status = 201;
      this.body = {
        message: "get post success",
        post: post
      };
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "get post error",
        status: this.status,
        title: err.message
      };
    }
  };

  /**
   * POST /api/v1/post/:postId/comment
   * post comment
   */
  let _createComment = function *(postId) {
    try{

      /**
       * Create varables
       */
      let requestObject = yield parse(this),
          mongoObjectId  = new ObjectID(postId),
          commentId = new ObjectID(),
          token = this.request.headers.authorization.split(' ')[1],
          decoded = jwt.decode(token, environment.default.secret),
          post, updatedPost;

      /**
       * Verification
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante');
      }
      if(!mongo["posts_"+this.query.db_locale]) {
        this.throw(401, 'Db do not exists');
      }
      post = yield mongo["posts_"+this.query.db_locale].findOne({_id: mongoObjectId});
      if(!post) {
        this.throw(401, 'Post do not exist');
      }
      if(!decoded) {
        this.throw(401, 'You dont have permssions');
      }
      if(!requestObject.message) {
        this.throw(401, 'message can not be blank');
      }

      /**
       * Save in DB new comment
       */
      requestObject.from = {
        _id: decoded.user.id, 
        name: decoded.user.name, 
        picture: decoded.user.picture
      }
      requestObject = {_id: commentId, from: requestObject.from, createdTime: new Date(), message: requestObject.message};
      yield mongo["posts_"+this.query.db_locale].update(
          {_id: mongoObjectId},
          {$push: {comments: requestObject}}
      );
      updatedPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: mongoObjectId});


      this.status = 201;
      this.body = {
        message: "create comment success",
        post: updatedPost
      };

      /**
       * send notification socket
       */
      requestObject.id = requestObject._id;
      requestObject.postId = postId;
      delete requestObject._id;
      notificationIO.notifyAll('posts.comments.created', requestObject);
    } catch (err) {
      this.status = err.status || 500;
      this.body = {
        message: "create comment error",
        status: this.status,
        title: err.message
      };
    }

  }

  /**
   * Return public methods
   */
   return {
    list: _list,
    create: _create,
    update: _update,
    delete: _delete,
    get: _get,
    createComment: _createComment
   }

})();
module.exports = post;
