/**
 * Post Repository (Map-backed storage)
 *
 * Encapsulates all data access and persistence operations for posts.
 * Provides a stable repository contract (findAll, findById, create, update, remove)
 * returning defensive copies to prevent external mutations from altering internal store data.
 *
 * ---------------------------------------------------------------------------
 * Future Prisma Implementation Notes:
 * ---------------------------------------------------------------------------
 * When transitioning from this in-memory Map store to an ORM like Prisma:
 *
 * 1. Asynchronous Signatures (Async/Await):
 *    All repository methods will become async functions returning Promises,
 *    since database operations involve network/disk I/O:
 *    - findAll()       => async findAll() { return await prisma.post.findMany(); }
 *    - findById(id)    => async findById(id) {
 *                           return await prisma.post.findUnique({ where: { id: Number(id) } });
 *                         }
 *    - create(fields)  => async create(fields) {
 *                           return await prisma.post.create({
 *                             data: {
 *                               title: fields.title,
 *                               body: fields.body || '',
 *                               authorId: fields.authorId,
 *                             },
 *                           });
 *                         }
 *    - update(id, patch) => async update(id, patch) {
 *                             try {
 *                               return await prisma.post.update({
 *                                 where: { id: Number(id) },
 *                                 data: patch,
 *                               });
 *                             } catch (err) {
 *                               if (err.code === 'P2025') return null; // Record to update not found
 *                               throw err;
 *                             }
 *                           }
 *    - remove(id)      => async remove(id) {
 *                             try {
 *                               await prisma.post.delete({ where: { id: Number(id) } });
 *                               return true;
 *                             } catch (err) {
 *                               if (err.code === 'P2025') return false; // Record to delete not found
 *                               throw err;
 *                             }
 *                           }
 *
 * 2. Automated ID Generation:
 *    Manual `nextId` counter tracking is eliminated. The relational database handles primary
 *    key generation natively via the Prisma model definition (e.g. `id Int @id @default(autoincrement())`).
 *
 * 3. Natural Immutability (Defensive Copying):
 *    Prisma Client returns freshly instantiated plain JavaScript objects for query results,
 *    eliminating the need for manual defensive cloning (`clone()`) to protect in-memory state.
 *
 * 4. Architecture & Decoupling:
 *    Because the service layer depends solely on the repository contract, transitioning to
 *    Prisma only requires handling asynchronous Promises in `postService.js` without altering
 *    domain validation rules or controller interfaces.
 * ---------------------------------------------------------------------------
 */

// Private in-memory storage using a Map
const posts = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

/**
 * Returns a defensive shallow copy of a record, or null if falsy.
 */
function clone(record) {
  if (!record) return null;
  return { ...record };
}

/**
 * Contract: findAll() returns a new array of cloned records.
 */
function findAll() {
  return Array.from(posts.values()).map(clone);
}

/**
 * Contract: findById(id) returns a copy or null.
 */
function findById(id) {
  const record = posts.get(Number(id));
  return clone(record);
}

/**
 * Contract: create(fields) returns a complete new record.
 */
function create(fields) {
  const id = nextId++;
  const post = {
    id,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  posts.set(id, clone(post));
  return clone(post);
}

/**
 * Contract: update(id, patch) returns an updated copy or null.
 */
function update(id, patch) {
  const numericId = Number(id);
  const existing = posts.get(numericId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...(patch && patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch && patch.body !== undefined ? { body: patch.body } : {}),
    ...(patch && patch.authorId !== undefined ? { authorId: patch.authorId } : {}),
  };

  posts.set(numericId, clone(updated));
  return clone(updated);
}

/**
 * Contract: remove(id) returns true or false. Do not return a deleted record.
 */
function remove(id) {
  const numericId = Number(id);
  return posts.delete(numericId);
}

module.exports = { findAll, findById, create, update, remove };
