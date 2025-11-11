#!/usr/bin/env node

/**
 * Script: test_analytics_endpoints.js
 * Ejecuta smoke tests sobre los endpoints de analíticas usando un Super Admin.
 *
 * Requiere variables de entorno:
 * - API_BASE_URL (opcional, default http://localhost:3000)
 * - SUPER_ADMIN_EMAIL
 * - SUPER_ADMIN_PASSWORD
 */

require('dotenv').config();
const axios = require('axios');

const DEFAULT_BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
const BASE_URL = process.env.API_BASE_URL || DEFAULT_BASE_URL;
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

const logSection = (title) => {
  console.log(`\n──────────────── ${title} ────────────────`);
};

const formatError = (error) => {
  if (error.response) {
    return `HTTP ${error.response.status} - ${JSON.stringify(error.response.data)}`;
  }

  return error.message;
};

async function login() {
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    throw new Error('Debes definir SUPER_ADMIN_EMAIL y SUPER_ADMIN_PASSWORD en tu .env');
  }

  logSection('Autenticando Super Admin');

  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
  });

  const payload = response.data || {};
  const session =
    payload.session ||
    payload.data?.session ||
    payload.data?.session ||
    payload?.data?.session;

  const accessToken =
    session?.access_token || payload?.data?.session?.access_token || payload?.access_token;

  if (!accessToken) {
    throw new Error('No se pudo obtener access_token de la respuesta de login');
  }

  console.log(`✔️  Login exitoso para ${SUPER_ADMIN_EMAIL}`);
  return accessToken;
}

async function testEndpoint(name, config) {
  const { url, method = 'get', headers = {}, params, data } = config;

  const start = Date.now();
  try {
    const response = await axios({
      url,
      method,
      headers,
      params,
      data,
    });

    const duration = Date.now() - start;
    const payload = response.data || {};
    const items = Array.isArray(payload.data) ? payload.data.length : 0;

    console.log(`✔️  ${name} → ${response.status} (${duration}ms) | items: ${items}`);
    return { name, ok: true, status: response.status, duration, items };
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌  ${name} → ${formatError(error)} (${duration}ms)`);
    return { name, ok: false, error: formatError(error), duration };
  }
}

async function main() {
  try {
    console.log('🔍 Ejecutando pruebas de analíticas');
    console.log(`Base URL: ${BASE_URL}`);

    const token = await login();
    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    logSection('Probando endpoints');

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const endpoints = [
      {
        name: 'Sales Over Time (mensual)',
        config: {
          url: `${BASE_URL}/api/super-admin/analytics/sales-over-time`,
          method: 'get',
          headers: authHeaders,
          params: {
            from: threeMonthsAgo.toISOString(),
            to: now.toISOString(),
            granularity: 'month',
          },
        },
      },
      {
        name: 'Store Performance (top 5)',
        config: {
          url: `${BASE_URL}/api/super-admin/analytics/store-performance`,
          method: 'get',
          headers: authHeaders,
          params: {
            from: threeMonthsAgo.toISOString(),
            to: now.toISOString(),
            limit: 5,
          },
        },
      },
      {
        name: 'Top Products (revenue)',
        config: {
          url: `${BASE_URL}/api/super-admin/analytics/top-products`,
          method: 'get',
          headers: authHeaders,
          params: {
            from: threeMonthsAgo.toISOString(),
            to: now.toISOString(),
            limit: 5,
            metric: 'revenue',
          },
        },
      },
    ];

    const results = [];
    for (const endpoint of endpoints) {
      // eslint-disable-next-line no-await-in-loop
      const result = await testEndpoint(endpoint.name, endpoint.config);
      results.push(result);
    }

    logSection('Resumen');
    const successCount = results.filter((result) => result.ok).length;
    const failureCount = results.length - successCount;

    console.log(`✔️  Éxitos: ${successCount}`);
    if (failureCount > 0) {
      console.log(`❌  Fallos: ${failureCount}`);
    }

    process.exit(failureCount === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n🔥 Error ejecutando pruebas:', error.message);
    process.exit(1);
  }
}

main();


