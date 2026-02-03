/**
 * Script para agregar el campo storeLogo a la tabla Invoice
 * Ejecutar: node scripts/add-store-logo-to-invoices.js
 */

const { query } = require('../lib/database');

async function addStoreLogoToInvoices() {
  try {
    console.log('📄 Agregando campo storeLogo a la tabla Invoice...');

    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Invoice'
        AND column_name = 'storeLogo'
      )
    `);

    if (checkColumn.rows[0].exists) {
      console.log('⚠️  La columna storeLogo ya existe');
      return;
    }

    // Agregar columna storeLogo
    await query(`
      ALTER TABLE "Invoice"
      ADD COLUMN "storeLogo" TEXT
    `);

    console.log('✅ Columna storeLogo agregada exitosamente');
  } catch (error) {
    console.error('❌ Error al agregar columna storeLogo:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addStoreLogoToInvoices()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { addStoreLogoToInvoices };
