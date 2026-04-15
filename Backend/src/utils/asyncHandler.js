/**
 * Wraps an async route handler so that any thrown error is automatically
 * forwarded to Express's next() — eliminating repetitive try/catch blocks.
 *
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
