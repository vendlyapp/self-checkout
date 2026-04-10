// src/middleware/errorHandler.js — Centralized error handling middleware

const { HTTP_STATUS } = require('../types');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error caught by errorHandler', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    name: err.name,
    path: req.path,
    method: req.method,
  });

  // AppError: known operational error with explicit status
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code && { code: err.code }),
    });
  }

  // Validation error (Zod or custom)
  if (err.name === 'ZodError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Validation error',
      details: err.errors || err.message,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid input data',
      details: err.message,
    });
  }

  // PostgreSQL errors
  if (err.code) {
    // Integrity / syntax errors (23xxx, 42xxx)
    if (err.code.startsWith('23') || err.code.startsWith('42')) {
      logger.error('PostgreSQL integrity/syntax error', {
        code: err.code,
        detail: err.detail,
      });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Database error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }

    // Fatal PostgreSQL error (XX000) or admin shutdown (57P01)
    if (err.code === 'XX000' || err.code === '57P01') {
      logger.error('Fatal PostgreSQL error', { code: err.code, detail: err.detail });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Database connection error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }

    // Connection refused / timeout
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      logger.error('Database connection error', { code: err.code });
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        error: 'Database service unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid JSON in request body',
    });
  }

  // Unhandled error — default 500
  logger.error('Unhandled error', { message: err.message, stack: err.stack });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
