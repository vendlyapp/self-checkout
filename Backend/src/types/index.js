// src/types/index.js - Definiciones de tipos y constantes

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

const API_RESPONSES = {
  SUCCESS: 'success',
  ERROR: 'error'
};

const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100
};

module.exports = {
  HTTP_STATUS,
  API_RESPONSES,
  ORDER_STATUS,
  PAGINATION
};
