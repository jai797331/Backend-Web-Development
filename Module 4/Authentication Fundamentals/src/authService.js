
const bcrypt = require('bcryptjs');
const userRepository = require('./db/userRepository');

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function validateCredentials(name, email, password, isRegister) {
  if (
    (isRegister && (typeof name !== 'string' || !name.trim())) ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    throw new AuthError(400, 'INVALID_INPUT', 'Name, email and password are required');
  }
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function register({ name, email, password }) {
  validateCredentials(name, email, password, true);

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
  }

  const cost = Number(process.env.BCRYPT_COST || 12);
  const passwordHash = await bcrypt.hash(password, cost);

  try {
    const user = await userRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return safeUser(user);
  } catch (error) {
    // Handle concurrent registrations for the same email.
    if (error.code === 'P2002') {
      throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
    }
    throw error;
  }
}

async function login({ email, password }) {
  validateCredentials(undefined, email, password, false);

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findUserByEmail(normalizedEmail);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  return safeUser(user);
}

module.exports = {
  register,
  login,
  AuthError,
};
