/**
 * Smoke tests: protected routes reject unauthenticated callers.
 * Run: npm run test:security
 */
const { randomUUID } = require('crypto');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../app');

test('GET /api/orders/stats without token → 401', async () => {
  const res = await request(app).get('/api/orders/stats');
  assert.equal(res.status, 401);
});

test('GET /api/orders/recent without token → 401', async () => {
  const res = await request(app).get('/api/orders/recent');
  assert.equal(res.status, 401);
});

test('GET /api/orders/:id without token → 401', async () => {
  const res = await request(app).get(`/api/orders/${randomUUID()}`);
  assert.equal(res.status, 401);
});

test('GET /api/orders/user/:userId without token → 401', async () => {
  const res = await request(app).get(`/api/orders/user/${randomUUID()}`);
  assert.equal(res.status, 401);
});

test('GET /api/products/:id without token → 401', async () => {
  const res = await request(app).get(`/api/products/${randomUUID()}`);
  assert.equal(res.status, 401);
});

test('GET /api/payment-methods/:id without token → 401', async () => {
  const res = await request(app).get(`/api/payment-methods/${randomUUID()}`);
  assert.equal(res.status, 401);
});

test('GET /health → 200', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
});
