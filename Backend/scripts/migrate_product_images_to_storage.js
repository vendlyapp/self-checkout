#!/usr/bin/env node
/**
 * Migra imágenes base64/data-URL en Product.image → Supabase Storage (URL pública).
 * Uso: node scripts/migrate_product_images_to_storage.js [--dry-run]
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, closePool } = require('../lib/database');
const { getSupabaseAdmin } = require('../lib/supabaseAdmin');
const { isStorageOrHttpUrl, isEmbeddedImage } = require('../src/utils/productImageUrl');

const BUCKET = process.env.STORAGE_BUCKET_PRODUCTS || 'product';
const DRY_RUN = process.argv.includes('--dry-run');

function parseImageBuffer(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (isStorageOrHttpUrl(trimmed)) return null;

  const dataMatch = trimmed.match(/^data:image\/(\w+);base64,(.+)$/s);
  if (dataMatch) {
    return {
      ext: dataMatch[1] === 'jpeg' ? 'jpg' : dataMatch[1],
      buffer: Buffer.from(dataMatch[2], 'base64'),
    };
  }
  if (isEmbeddedImage(trimmed)) {
    return { ext: 'jpg', buffer: Buffer.from(trimmed, 'base64') };
  }
  return null;
}

async function uploadBuffer(ownerId, productId, buffer, ext) {
  const admin = getSupabaseAdmin();
  const path = `${ownerId}/${productId}-${Date.now()}.${ext}`;
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  console.log(DRY_RUN ? '\n[DRY RUN] migrate product images\n' : '\nMigrating product images to Supabase Storage\n');

  await query('SET statement_timeout = 180000').catch(() => {});

  const index = await query(`
    SELECT id, "ownerId", name, length(image)::int AS image_len
    FROM "Product"
    WHERE image IS NOT NULL
      AND length(image) > 0
      AND image NOT LIKE 'https://%'
      AND image NOT LIKE 'http://%'
    ORDER BY length(image) DESC
  `);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Found ${index.rows.length} products with embedded images\n`);

  for (const meta of index.rows) {
    const rowRes = await query(
      `SELECT id, "ownerId", name, image FROM "Product" WHERE id = $1`,
      [meta.id]
    );
    const row = rowRes.rows[0];
    if (!row?.image || !isEmbeddedImage(row.image)) {
      skipped++;
      continue;
    }

    const parsed = parseImageBuffer(row.image);
    if (!parsed || parsed.buffer.length < 16) {
      console.warn(`  skip ${row.id} (${row.name}): unparseable image`);
      failed++;
      continue;
    }

    console.log(`  ${row.name} (${row.id}) ~${(parsed.buffer.length / 1024).toFixed(0)} KB`);

    if (DRY_RUN) {
      migrated++;
      continue;
    }

    try {
      const url = await uploadBuffer(row.ownerId, row.id, parsed.buffer, parsed.ext);
      const cleanImages = [url];
      await query(
        `UPDATE "Product" SET image = $1, images = $2::text[], "updatedAt" = CURRENT_TIMESTAMP WHERE id = $3`,
        [url, cleanImages, row.id]
      );
      migrated++;
      console.log(`    → ${url}`);
    } catch (err) {
      failed++;
      console.error(`    ✗ ${err.message}`);
    }
  }

  console.log(`\nDone: migrated=${migrated}, skipped(url)=${skipped}, failed=${failed}\n`);
  await closePool();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
