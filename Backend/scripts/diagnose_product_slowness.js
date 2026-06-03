#!/usr/bin/env node
/**
 * Diagnóstico: por qué GET /api/products es lento.
 * Uso: node scripts/diagnose_product_slowness.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool, query, closePool } = require('../lib/database');

async function timed(label, fn) {
  const t0 = Date.now();
  const result = await fn();
  return { label, ms: Date.now() - t0, result };
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  const mode = dbUrl.includes(':6543')
    ? 'pooler-6543'
    : dbUrl.includes('pooler')
      ? 'pooler'
      : dbUrl.includes(':5432')
        ? 'direct-5432'
        : 'unknown';

  console.log('\n=== Diagnóstico Product slowness ===\n');
  console.log('DATABASE_URL mode:', mode);
  console.log('pgbouncer=true:', dbUrl.includes('pgbouncer=true'));

  const ping = await timed('SELECT NOW()', () => query('SELECT NOW()'));
  console.log(`Ping: ${ping.ms}ms`);

  const stats = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE "ownerId" IS NOT NULL)::int AS with_owner,
      COUNT(*) FILTER (WHERE image IS NOT NULL AND length(image) > 0)::int AS with_image,
      COUNT(*) FILTER (WHERE image LIKE 'http%')::int AS image_url,
      COUNT(*) FILTER (WHERE image LIKE 'data:%')::int AS image_data_url,
      COUNT(*) FILTER (WHERE image IS NOT NULL AND image NOT LIKE 'http%' AND image NOT LIKE 'data:%')::int AS image_raw_base64,
      COALESCE(AVG(length(image)) FILTER (WHERE image IS NOT NULL), 0)::bigint AS avg_image_len,
      COALESCE(MAX(length(image)), 0)::bigint AS max_image_len,
      COALESCE(SUM(length(COALESCE(image, ''))), 0)::bigint AS total_image_bytes,
      COUNT(*) FILTER (WHERE length(COALESCE(description, '')) > 500)::int AS long_descriptions
    FROM "Product"
  `);
  const s = stats.rows[0];
  console.log('\n--- Tabla Product (global) ---');
  console.table(s);

  const byOwner = await query(`
    SELECT "ownerId", COUNT(*)::int AS cnt,
      COALESCE(SUM(length(COALESCE(image, ''))), 0)::bigint AS image_bytes,
      COALESCE(MAX(length(image)), 0)::bigint AS max_img
    FROM "Product"
    GROUP BY "ownerId"
    ORDER BY image_bytes DESC
    LIMIT 5
  `);
  console.log('\n--- Top owners por peso de image ---');
  console.table(byOwner.rows);

  const ownerId = byOwner.rows[0]?.ownerId;
  if (ownerId) {
    const catalogCols = `
      id, "ownerId", name, price, "originalPrice",
      category, "categoryId", stock, sku, image,
      "isNew", "isPopular", "isOnSale", "isActive",
      "discountPercentage", "parentId"
    `;
    const listCols = `
      id, "ownerId", name, description, price, "originalPrice",
      category, "categoryId", stock, "initialStock", barcode, sku,
      tags, "isNew", "isPopular", "isOnSale", "isActive",
      rating, reviews, weight, "hasWeight", "discountPercentage",
      image, currency,
      "promotionTitle", "promotionType", "promotionStartAt", "promotionEndAt",
      "promotionBadge", "promotionActionLabel", "promotionPriority",
      supplier, "costPrice", margin, "taxRate",
      "expiryDate", location, "parentId",
      "createdAt", "updatedAt"
    `;

    const t1 = await timed('catalog SELECT (con image)', () =>
      query(
        `SELECT ${catalogCols} FROM "Product" WHERE "ownerId" = $1 ORDER BY name ASC LIMIT 200`,
        [ownerId]
      )
    );
    const t2 = await timed('catalog SELECT (sin image)', () =>
      query(
        `SELECT id, "ownerId", name, price, "categoryId", stock FROM "Product" WHERE "ownerId" = $1 ORDER BY name ASC LIMIT 200`,
        [ownerId]
      )
    );
    const t3 = await timed('full list SELECT', () =>
      query(
        `SELECT ${listCols} FROM "Product" WHERE "ownerId" = $1 ORDER BY name ASC LIMIT 100`,
        [ownerId]
      )
    );

    const rowBytes = (rows) =>
      rows.reduce((acc, r) => acc + JSON.stringify(r).length, 0);

    console.log(`\n--- Owner ${ownerId} (${byOwner.rows[0].cnt} productos) ---`);
    console.log(`catalog+image: ${t1.ms}ms, rows=${t1.result.rows.length}, json~${(rowBytes(t1.result.rows) / 1024).toFixed(0)}KB`);
    console.log(`catalog sin image: ${t2.ms}ms, rows=${t2.result.rows.length}, json~${(rowBytes(t2.result.rows) / 1024).toFixed(0)}KB`);
    console.log(`full list: ${t3.ms}ms, rows=${t3.result.rows.length}, json~${(rowBytes(t3.result.rows) / 1024).toFixed(0)}KB`);

    const idx = await query(
      `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
       SELECT ${catalogCols} FROM "Product" WHERE "ownerId" = $1 ORDER BY name ASC LIMIT 200`,
      [ownerId]
    );
    console.log('\n--- EXPLAIN catalog+image (primeras líneas) ---');
    idx.rows.slice(0, 12).forEach((r) => console.log(r['QUERY PLAN']));
  }

  await closePool();
  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
