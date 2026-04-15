/**
 * Centralized Error Handling Middleware.
 * Catches all errors thrown or passed via next(err) in the Express pipeline.
 * In development, the full stack trace is returned for debugging.
 * In production, the stack is hidden to prevent leaking internals.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

module.exports = { errorHandler };
