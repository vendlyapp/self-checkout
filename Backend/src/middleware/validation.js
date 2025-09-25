// src/middleware/validation.js - Middleware de validación

const { HTTP_STATUS } = require('../types');

// Middleware para validar UUID
const validateUUID = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `El ${paramName} debe ser un UUID válido`
      });
    }

    next();
  };
};

// Middleware para validar email
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'El email es requerido'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'El email debe tener un formato válido'
    });
  }

  next();
};

// Middleware para validar datos de producto
const validateProduct = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !name.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'El nombre del producto es requerido'
    });
  }

  if (!price || isNaN(parseFloat(price))) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'El precio debe ser un número válido'
    });
  }

  if (parseFloat(price) < 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'El precio no puede ser negativo'
    });
  }

  next();
};

// Middleware para validar datos de orden
const validateOrder = (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'La orden debe contener al menos un producto'
    });
  }

  for (const item of items) {
    if (!item.productId || !item.quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Cada item debe tener productId y quantity'
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'La cantidad debe ser un número entero positivo'
      });
    }
  }

  next();
};

// Middleware para validar disponibilidad de producto
const validateProductAvailability = (req, res, next) => {
  const { isAvailable } = req.body;

  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'isAvailable debe ser true o false'
    });
  }

  next();
};

module.exports = {
  validateUUID,
  validateEmail,
  validateProduct,
  validateOrder,
  validateProductAvailability
};
