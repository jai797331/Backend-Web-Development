
const posts = new Map([
  [1, {
    id: 1,
    title: 'First post',
    body: 'Repository boundaries protect change.',
    authorId: 7,
  }],
  [2, {
    id: 2,
    title: 'Second post',
    body: 'Services should speak in domain language.',
    authorId: 8,
  }],
]);

let nextId = 3;

// Storage can change to Prisma later. The repository interface
// stays the same, so services and controllers do not need changes.

function findAll() {
  return Array.from(posts.values());
}

function findById(id) {
  return posts.get(Number(id)) || null;
}

function create(fields) {
  const post = { id: nextId++, ...fields };
  posts.set(post.id, post);
  return post;
}

function update(id, patch) {
  const post = findById(id);
  if (!post) return null;

  const updatedPost = { ...post, ...patch };
  posts.set(post.id, updatedPost);
  return updatedPost;
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
