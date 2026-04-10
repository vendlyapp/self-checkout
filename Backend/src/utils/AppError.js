/**
 * Custom application error with HTTP status code and machine-readable code.
 * Throw this in services/controllers so the centralized errorHandler can
 * respond with the correct status without fragile string matching.
 *
 * @example
 *   throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (default 500)
   * @param {string} [code] - Machine-readable error code (e.g. 'VALIDATION_ERROR')
   */
  constructor(message, statusCode = 500, code) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  /** Quick check to distinguish AppError from generic Error */
  get isOperational() {
    return true;
  }
}

module.exports = AppError;
