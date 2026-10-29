
const { randomUUID } = require('node:crypto');
const { sessionTtl } = require('../config/cookieOptions');

const sessions = new Map();

function create(userId) {
  const id = randomUUID();
  const session = {
    userId,
    expiresAt: Date.now() + sessionTtl,
  };

  sessions.set(id, session);
  return { id, ...session };
}

function get(id) {
  if (typeof id !== 'string') return null;

  const session = sessions.get(id);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }

  return session;
}

function destroy(id) {
  if (typeof id === 'string') {
    sessions.delete(id);
  }
}

module.exports = { create, get, destroy };
