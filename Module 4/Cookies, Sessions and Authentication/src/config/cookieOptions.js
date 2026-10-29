
const sessionTtl = Number(process.env.SESSION_TTL_MS || 3600000);

if (!Number.isSafeInteger(sessionTtl) || sessionTtl <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive integer');
}

const secure = process.env.COOKIE_SECURE === 'true';

function cookieOptions(includeMaxAge = true) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    signed: true,
    path: '/',
    ...(includeMaxAge ? { maxAge: sessionTtl } : {}),
  };
}

module.exports = { cookieOptions, sessionTtl };
