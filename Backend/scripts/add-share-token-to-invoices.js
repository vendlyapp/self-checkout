/**
 * Script para agregar campo shareToken a la tabla Invoice
 * Ejecutar: node scripts/add-share-token-to-invoices.js
 */

const { query } = require('../lib/database');
const crypto = require('crypto');

async function addShareTokenToInvoices() {
  try {
    console.log('📄 Agregando campo shareToken a Invoice...');

    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Invoice'
      AND column_name = 'shareToken'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  La columna shareToken ya existe');
      
      // Generar tokens para facturas que no tienen
      const invoicesWithoutToken = await query(`
        SELECT id FROM "Invoice" WHERE "shareToken" IS NULL
      `);
      
      if (invoicesWithoutToken.rows.length > 0) {
        console.log(`📝 Generando tokens para ${invoicesWithoutToken.rows.length} facturas...`);
        for (const invoice of invoicesWithoutToken.rows) {
          const token = crypto.randomBytes(32).toString('hex');
          await query(
            `UPDATE "Invoice" SET "shareToken" = $1 WHERE id = $2`,
            [token, invoice.id]
          );
        }
        console.log('✅ Tokens generados exitosamente');
      }
      
      return;
    }

    // Agregar columna shareToken
    await query(`
      ALTER TABLE "Invoice"
      ADD COLUMN "shareToken" TEXT UNIQUE
    `);

    // Crear índice para búsquedas rápidas
    await query(`
      CREATE INDEX "idx_Invoice_shareToken" ON "Invoice"("shareToken")
    `);

    // Generar tokens para facturas existentes
    const invoices = await query(`SELECT id FROM "Invoice"`);
    console.log(`📝 Generando tokens para ${invoices.rows.length} facturas existentes...`);
    
    for (const invoice of invoices.rows) {
      const token = crypto.randomBytes(32).toString('hex');
      await query(
        `UPDATE "Invoice" SET "shareToken" = $1 WHERE id = $2`,
        [token, invoice.id]
      );
    }

    console.log('✅ Campo shareToken agregado exitosamente');
  } catch (error) {
    console.error('❌ Error al agregar shareToken:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addShareTokenToInvoices()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { addShareTokenToInvoices };

