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
     environment = require("./../../config/environments/" + process.env.NODE_ENV + "_config");
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
         * Check query
         */
        if(!this.query.db_locale) {
          this.throw(401, 'locale not presante');
        };

        let posts = yield mongo["posts_"+this.query.db_locale].find(
              {},
              {comments: {$slice: -15 }},
              {limit: 15, sort: {_id: -1}} ).toArray();

        posts.forEach(function (post) {
          post.id = post._id;
          delete post._id;
        });

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "success get posts list",
        posts: posts
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
       * post from request
       * @type {Object}
       */
        let post = yield parse(this);

        if(!post.message) {
          this.throw(401, 'message can not be blank');
        };

        /**
         * Check query
         */
        if(!this.query.db_locale) {
          this.throw(401, 'locale not presante');
        };

        /**
         * Check rules
         */
        let token = this.request.headers.authorization.split(' ')[1];
        let decoded = jwt.decode(token, environment.default.secret);

        if (!decoded.user.admin) {
          this.throw(401, 'You dont have permssions');
        };

        /**
         * Add properties
         */
        post.from = {
          _id: decoded.user.id, 
          name: decoded.user.name, 
          picture: decoded.user.picture
        }
        post.createdTime = new Date();

        /**
         * Check db
         */
        let postDb = mongo["posts_"+this.query.db_locale]
        if(!postDb) {
          this.throw(401, 'Db do not exists');
        }

        /**
         * Save in DB
         */
        let results = yield mongo["posts_"+this.query.db_locale].insert(post);

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "success create post",
        post: results[0]
      };

      /**
       * now notify everyone about this new post
       */
      post.id = post._id;
      delete post._id;
      //ws.notify('posts.created', post);
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
       * post from request
       * @type {Object}
       */
        let post = yield parse(this);

        /**
         * Specific mongo id Format
         * @type {ObjectID}
         */
        let postObjectID  = new ObjectID(postId);

        /**
         * Check query
         */
        if(!this.query.db_locale) {
          this.throw(401, 'locale not presante');
        };

        /**
         * Check db
         */
        let postDb = mongo["posts_"+this.query.db_locale]
        if(!postDb) {
          this.throw(401, 'Db do not exists');
        }

        /**
         * Check exists post
         * @type {ObjectID}
         */
        let existingPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: postObjectID});

        if(!existingPost) {
          this.throw(401, 'Post do not exist');
        }

        if(!post.message) {
          this.throw(401, 'message can not be blank');
        };


        /**
         * Check rules
         */
        let token = this.request.headers.authorization.split(' ')[1];
        let decoded = jwt.decode(token, environment.default.secret);

        if (!decoded.user.admin && existingPost.from._id != decoded.user.id) {
          this.throw(401, 'You dont have permssions');
        };

        /**
         * Update operation
         */
        let postForUpdate = _.assign({ message: post.message });
        yield mongo["posts_"+this.query.db_locale].update(
            {_id: postObjectID},
            {$set: postForUpdate}
        );

        /**
         * updatedPost
         */
        let updatedPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: postObjectID});

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "success update post",
        post: updatedPost
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
         * Specific mongo id Format
         * @type {ObjectID}
         */
        let postObjectID  = new ObjectID(postId);

        /**
         * Check query
         */
        if(!this.query.db_locale) {
          this.throw(401, 'locale not presante');
        };

        /**
         * Check db
         */
        let postDb = mongo["posts_"+this.query.db_locale]
        if(!postDb) {
          this.throw(401, 'Db do not exists');
        }

        /**
         * Check exists post
         * @type {ObjectID}
         */
        let existingPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: postObjectID});

        if(!existingPost) {
          this.throw(401, 'Post do not exist');
        }

        /**
         * Check rules
         */
        let token = this.request.headers.authorization.split(' ')[1];
        let decoded = jwt.decode(token, environment.default.secret);

        if (!decoded.user.admin && existingPost.from._id != decoded.user.id) {
          this.throw(401, 'You dont have permssions');
        };

        /**
         * Delete operation
         */
        yield mongo["posts_"+this.query.db_locale].remove( {"_id": postObjectID});

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "delete post success",
        postId: postId
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
         * Specific mongo id Format
         * @type {ObjectID}
         */
        let postObjectID  = new ObjectID(postId);

        /**
         * Check query
         */
        if(!this.query.db_locale) {
          this.throw(401, 'locale not presante');
        };

        /**
         * Check db
         */
        let postDb = mongo["posts_"+this.query.db_locale]
        if(!postDb) {
          this.throw(401, 'Db do not exists');
        }

        /**
         * Check exists post
         * @type {ObjectID}
         */
        let existingPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: postObjectID});

        if(!existingPost) {
          this.throw(401, 'Post do not exist');
        }

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "get post success",
        post: existingPost
      };
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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
       * Parse request
       * @type {Object}
       */
      let comment = yield parse(this);

      /**
       * Specific mongo id Format
       * @type {ObjectID}
       */
      let postObjectID  = new ObjectID(postId);
      let commentId = new ObjectID();

      /**
       * Check query
       */
      if(!this.query.db_locale) {
        this.throw(401, 'locale not presante');
      };

      /**
       * Check db
       */
      let postDb = mongo["posts_"+this.query.db_locale]
      if(!postDb) {
        this.throw(401, 'Db do not exists');
      }

      /**
       * Check exists post
       * @type {ObjectID}
       */
      let existingPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: postObjectID});

      if(!existingPost) {
        this.throw(401, 'Post do not exist');
      };

      if(!comment.message) {
        this.throw(401, 'message can not be blank');
      };

      /**
       * Check rules
       */
      let token = this.request.headers.authorization.split(' ')[1];
      let decoded = jwt.decode(token, environment.default.secret);

      if (!decoded) {
        this.throw(401, 'You dont have permssions');
      };

      /**
       * Add properties
       */
      comment.from = {
        _id: decoded.user.id, 
        name: decoded.user.name, 
        picture: decoded.user.picture
      }

      comment = {_id: commentId, from: comment.from, createdTime: new Date(), message: comment.message};

      /**
       * Save in DB
       */
      let result = yield mongo["posts_"+this.query.db_locale].update(
          {_id: postObjectID},
          {$push: {comments: comment}}
      );

      /**
       * Check updated post
       * @type {ObjectID}
       */
      let updatedPost = yield mongo["posts_"+this.query.db_locale].findOne({_id: postObjectID});

       /**
        * Send responce
        */
       this.status = 201;
       this.body = {
        message: "create comment success",
        post: updatedPost
      };

      /**
       * now notify everyone about this new comment
       */
      comment.id = comment._id;
      comment.postId = postId;
      delete comment._id;
      //ws.notify('posts.comments.created', comment);
    }
    /**
     * Error Handelind
     * @param  {Object} err 
     */
    catch (err) {
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

/**
 * Export
 */
module.exports = post;
