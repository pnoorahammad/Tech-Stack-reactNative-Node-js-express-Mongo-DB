const logger = require('../config/logger');

/**
 * Centralized error handler — must be last middleware in app.js
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Postgres Unique Constraint Violation
  if (err.code === '23505') {
    statusCode = 409;
    message = `Duplicate value error. This resource already exists or conflicts with another.`;
  }

  // Postgres Invalid UUID / Input
  if (err.code === '22P02') {
    statusCode = 400;
    message = `Invalid input format.`;
  }

  logger.error(`[${statusCode}] ${message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
