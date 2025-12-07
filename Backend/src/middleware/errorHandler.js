// src/middleware/errorHandler.js - Middleware centralizado para manejo de errores

const { HTTP_STATUS } = require('../types');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: err.message
    });
  }

  // Error de PostgreSQL
  if (err.code) {
    // Errores de integridad (23xxx) y sintaxis (42xxx)
    if (err.code.startsWith('23') || err.code.startsWith('42')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Error de base de datos',
        details: err.message
      });
    }
    
    // Error fatal de PostgreSQL (XX000) - Internal error
    if (err.code === 'XX000' || err.code === '57P01') {
      console.error('❌ Error fatal de PostgreSQL:', err.message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Error de conexión a la base de datos. Por favor, intente nuevamente.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    // Error de conexión
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      console.error('❌ Error de conexión:', err.message);
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        error: 'Servicio de base de datos no disponible. Por favor, intente nuevamente más tarde.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'JSON inválido en el cuerpo de la petición'
    });
  }

  // Error por defecto
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: 'Error interno del servidor'
  });
};

const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
