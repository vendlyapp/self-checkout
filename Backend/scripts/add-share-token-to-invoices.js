/**
 * Script para agregar el campo shareToken a la tabla Invoice si no existe
 * Ejecutar: node scripts/add-share-token-to-invoices.js
 */

const { query } = require('../lib/database');

async function addShareTokenColumn() {
  try {
    console.log('📄 Verificando campo shareToken en tabla Invoice...');

    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Invoice'
        AND column_name = 'shareToken'
      )
    `);

    if (checkColumn.rows[0].exists) {
      console.log('✅ El campo shareToken ya existe en la tabla Invoice');
      return;
    }

    // Agregar columna shareToken
    await query(`
      ALTER TABLE "Invoice"
      ADD COLUMN "shareToken" TEXT UNIQUE
    `);

    // Crear índice para shareToken
    await query(`
      CREATE INDEX "idx_Invoice_shareToken" ON "Invoice"("shareToken")
    `);

    console.log('✅ Campo shareToken agregado exitosamente a la tabla Invoice');
  } catch (error) {
    console.error('❌ Error al agregar campo shareToken:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addShareTokenColumn()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { addShareTokenColumn };
