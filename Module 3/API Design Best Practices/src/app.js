
const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const http = require('./utils/http');

function createApp() {
  const app = express();

  app.use(express.json());

  // Public resource-based API routes
  app.use('/', postRoutes);

  // Safe demo route to test internal error handling
  app.get('/test/internal-error', controller.explode);

  // Handle routes that do not exist
  app.use((req, res) => {
    return http.sendError(
      res,
      404,
      'ROUTE_NOT_FOUND',
      'Route not found'
    );
  });

  // Central error handler: never expose internal stack traces
  app.use((err, req, res, next) => {
    console.error(err);

    const status = err.statusCode || err.status || 500;

    if (err.type === 'entity.parse.failed') {
      return http.sendError(
        res,
        400,
        'INVALID_JSON',
        'Invalid JSON request body'
      );
    }

    if (status >= 400 && status < 500) {
      return http.sendError(
        res,
        status,
        err.code || 'REQUEST_ERROR',
        err.message || 'Invalid request'
      );
    }

    return http.sendError(
      res,
      500,
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred'
    );
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};
