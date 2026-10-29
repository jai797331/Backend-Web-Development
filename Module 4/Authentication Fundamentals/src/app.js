
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const { AuthError } = require('./authService');

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AuthError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON body',
      },
    });
  }

  // Do not log request bodies, passwords, hashes, or raw database errors.
  console.error('Unexpected authentication API error');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
