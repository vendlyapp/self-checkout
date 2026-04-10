// src/middleware/validation.js — Input validation middleware

const { HTTP_STATUS } = require('../types');

// Validate UUID path parameter
const validateUUID = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `${paramName} must be a valid UUID`,
      });
    }

    next();
  };
};

// Validate email in request body
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Email is required',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Email must have a valid format',
    });
  }

  next();
};

// Validate product data in request body
const validateProduct = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !name.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Product name is required',
    });
  }

  if (!price || isNaN(parseFloat(price))) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Price must be a valid number',
    });
  }

  if (parseFloat(price) < 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Price cannot be negative',
    });
  }

  next();
};

// Validate order data in request body
const validateOrder = (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Order must contain at least one item',
    });
  }

  for (const item of items) {
    if (!item.productId || !item.quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Each item must have productId and quantity',
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Quantity must be a positive integer',
      });
    }
  }

  next();
};

// Validate product availability flag
const validateProductAvailability = (req, res, next) => {
  const { isAvailable } = req.body;

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'isAvailable must be true or false',
    });
  }

  next();
};

/**
 * Generic Zod body validator.
 * Usage: router.post('/route', validateBody(myZodSchema), controller.method)
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation error',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
};

module.exports = {
  validateUUID,
  validateEmail,
  validateProduct,
  validateOrder,
  validateProductAvailability,
  validateBody,
};
