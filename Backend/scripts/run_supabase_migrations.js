/**
 * Applies SQL migrations from /supabase/migrations/ in filename order.
 * Safe to re-run: uses supabase_migrations schema tracking.
 *
 * Usage (from Backend/): node scripts/run_supabase_migrations.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// DDL needs direct Postgres (db.*.supabase.co:5432), not the transaction pooler
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const fs = require('fs');
const path = require('path');
const { query, testConnection, closePool } = require('../lib/database');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../supabase/migrations');

async function ensureMigrationTable() {
  await query('CREATE SCHEMA IF NOT EXISTS supabase_migrations');
  await query(`
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedVersions() {
  const result = await query(
    'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version'
  );
  return new Set(result.rows.map((r) => r.version));
}

async function applyMigration(version, sql) {
  console.log(`\n▶ Applying ${version}...`);
  await query('BEGIN');
  try {
    await query(sql);
    await query(
      'INSERT INTO supabase_migrations.schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
      [version]
    );
    await query('COMMIT');
    console.log(`✓ ${version} applied`);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

async function main() {
  console.log('Vendly — Supabase migrations runner');
  console.log('Migrations dir:', MIGRATIONS_DIR);

  const ok = await testConnection(3);
  if (!ok) {
    console.error('✗ Database connection failed. Check DATABASE_URL in Backend/.env');
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('✗ Migrations directory not found:', MIGRATIONS_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No .sql migration files found.');
    process.exit(0);
  }

  await ensureMigrationTable();
  const applied = await getAppliedVersions();

  let newCount = 0;
  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (applied.has(version)) {
      console.log(`○ Skip (already applied): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await applyMigration(version, sql);
    newCount++;
  }

  console.log(`\nDone. ${newCount} new migration(s) applied, ${files.length - newCount} skipped.`);
}

main()
  .catch((err) => {
    console.error('\n✗ Migration failed:', err.message);
    if (err.detail) console.error('  detail:', err.detail);
    process.exit(1);
  })
  .finally(() => closePool());
