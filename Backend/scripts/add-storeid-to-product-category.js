#!/usr/bin/env node

/**
 * Añade la columna storeId a ProductCategory para categorías por tienda.
 * Ejecutar: node scripts/add-storeid-to-product-category.js
 */

require('dotenv').config();
const { query } = require('../lib/database');

async function run() {
  try {
    console.log('Agregando columna storeId a ProductCategory...\n');

    await query(`
      ALTER TABLE "ProductCategory"
      ADD COLUMN IF NOT EXISTS "storeId" TEXT REFERENCES "Store"(id) ON DELETE CASCADE
    `);
    console.log('   Columna storeId agregada');

    await query(`
      CREATE INDEX IF NOT EXISTS "idx_ProductCategory_storeId" ON "ProductCategory"("storeId")
    `);
    console.log('   Índice idx_ProductCategory_storeId creado');

    console.log('\nMigración completada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
