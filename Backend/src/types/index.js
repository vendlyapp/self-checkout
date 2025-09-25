// src/types/index.js - Definiciones de tipos y constantes

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
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
