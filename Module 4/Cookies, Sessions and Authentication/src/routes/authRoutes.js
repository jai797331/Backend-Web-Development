
const express = require('express');
const bcrypt = require('bcryptjs');

const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const { cookieOptions } = require('../config/cookieOptions');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length === 0 ||
      password.length > 1024
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid email and password are required',
        },
      });
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const session = sessionStore.create(user.id);
    const publicUser = await userRepository.findPublicById(user.id);

    res.cookie('sid', session.id, cookieOptions());

    return res.status(200).json({
      data: publicUser,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({
    data: req.user,
  });
});

router.post('/logout', (req, res) => {
  const sid = req.signedCookies?.sid;

  if (typeof sid === 'string') {
    sessionStore.destroy(sid);
  }

  res.clearCookie('sid', cookieOptions(false));

  return res.status(204).send();
});

module.exports = router;
