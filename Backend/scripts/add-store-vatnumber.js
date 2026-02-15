/**
 * Migration: Añadir columna vatNumber a Store
 * Ejecutar: node scripts/add-store-vatnumber.js
 */

const { query } = require('../lib/database');

async function addStoreVatNumber() {
  try {
    const check = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Store' AND column_name = 'vatNumber'
    `);
    if (check.rows.length > 0) {
      console.log('✓ Columna vatNumber ya existe en Store');
      return;
    }
    await query(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT`);
    console.log('✓ Columna vatNumber añadida a Store');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

if (require.main === module) {
  addStoreVatNumber()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
module.exports = { addStoreVatNumber };
