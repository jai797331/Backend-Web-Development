
const store = require('../data/postStore');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 5;

function listPosts(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : DEFAULT_LIMIT;

  const limit = Math.min(requestedLimit, MAX_LIMIT);

  const allPosts = store.getAllPosts();
  const total = allPosts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const posts = allPosts.slice(startIndex, startIndex + limit);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';

  if (!title || !author) {
    const error = new Error('Title and author are required');
    error.statusCode = 400;
    error.code = 'INVALID_POST';
    throw error;
  }

  return store.createPost({ title, author });
}

function likePost(id) {
  return store.incrementLikes(id);
}

function explode() {
  throw new Error('Demonstration of an internal failure');
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
