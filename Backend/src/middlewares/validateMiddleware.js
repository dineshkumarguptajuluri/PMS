/**
 * Zod validation middleware factory.
 * Takes a Zod schema and returns an Express middleware that validates req.body.
 * Returns 400 Bad Request with specific field-level error messages on failure.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // Replace req.body with the parsed (and coerced) data
  req.body = result.data;
  next();
};

module.exports = { validate };
