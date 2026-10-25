
const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res, next) {
  try {
    const result = service.listPosts(req.query);
    return http.sendList(res, result.posts, result.pagination);
  } catch (error) {
    next(error);
  }
}

function getPost(req, res, next) {
  try {
    const post = service.getPost(req.params.id);

    if (!post) {
      return http.sendError(
        res,
        404,
        'POST_NOT_FOUND',
        'Post not found'
      );
    }

    return http.sendOk(res, { post });
  } catch (error) {
    next(error);
  }
}

function createPost(req, res, next) {
  try {
    const post = service.createPost(req.body);
    return http.sendCreated(res, { post });
  } catch (error) {
    next(error);
  }
}

function likePost(req, res, next) {
  try {
    const post = service.likePost(req.params.id);

    if (!post) {
      return http.sendError(
        res,
        404,
        'POST_NOT_FOUND',
        'Post not found'
      );
    }

    return http.sendOk(res, { post });
  } catch (error) {
    next(error);
  }
}

function explode(req, res, next) {
  try {
    service.explode();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
