/**
 * Script para crear la tabla Invoice
 * Ejecutar: node scripts/create-invoices-table.js
 */

const { query } = require('../lib/database');

async function createInvoicesTable() {
  try {
    console.log('📄 Creando tabla Invoice...');

    // Verificar si la tabla ya existe
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Invoice'
      )
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  La tabla Invoice ya existe');
      return;
    }

    // Crear tabla Invoice
    await query(`
      CREATE TABLE "Invoice" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL,
        "invoiceNumber" TEXT NOT NULL UNIQUE,
        "customerName" TEXT,
        "customerEmail" TEXT,
        "customerAddress" TEXT,
        "customerCity" TEXT,
        "customerPostalCode" TEXT,
        "customerPhone" TEXT,
        "storeId" TEXT,
        "storeName" TEXT,
        "storeAddress" TEXT,
        "storePhone" TEXT,
        "storeEmail" TEXT,
        "items" JSONB NOT NULL,
        "subtotal" NUMERIC NOT NULL,
        "discountAmount" NUMERIC DEFAULT 0,
        "taxAmount" NUMERIC DEFAULT 0,
        "total" NUMERIC NOT NULL,
        "paymentMethod" TEXT,
        "status" TEXT DEFAULT 'issued',
        "issuedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "paidAt" TIMESTAMP WITHOUT TIME ZONE,
        "metadata" JSONB,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_Invoice_orderId"
          FOREIGN KEY ("orderId")
          REFERENCES "Order"(id)
          ON DELETE CASCADE,
        CONSTRAINT "fk_Invoice_storeId"
          FOREIGN KEY ("storeId")
          REFERENCES "Store"(id)
          ON DELETE SET NULL
      )
    `);

    // Crear índices
    await query(`
      CREATE INDEX "idx_Invoice_orderId" ON "Invoice"("orderId")
    `);

    await query(`
      CREATE INDEX "idx_Invoice_invoiceNumber" ON "Invoice"("invoiceNumber")
    `);

    await query(`
      CREATE INDEX "idx_Invoice_storeId" ON "Invoice"("storeId")
    `);

    await query(`
      CREATE INDEX "idx_Invoice_customerEmail" ON "Invoice"("customerEmail")
    `);

    console.log('✅ Tabla Invoice creada exitosamente');
  } catch (error) {
    console.error('❌ Error al crear tabla Invoice:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createInvoicesTable()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { createInvoicesTable };

