/**
 * Script para crear la tabla Customer
 * Un cliente puede comprar en varias tiendas, y cada tienda tiene sus propios clientes
 * Ejecutar: node scripts/create-customers-table.js
 */

const { query } = require('../lib/database');

async function createCustomersTable() {
  try {
    console.log('📦 Creando tabla Customer...');

    // Verificar si la tabla ya existe
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Customer'
      )
    `);

    if (checkTable.rows[0].exists) {
      console.log('⚠️  La tabla Customer ya existe');
      return;
    }

    // Crear la tabla Customer
    await query(`
      CREATE TABLE "Customer" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        "storeId" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "address" TEXT,
        "city" TEXT,
        "postalCode" TEXT,
        "firstPurchaseAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastPurchaseAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "totalOrders" INTEGER NOT NULL DEFAULT 0,
        "totalSpent" NUMERIC(10, 2) NOT NULL DEFAULT 0,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "fk_Customer_storeId"
          FOREIGN KEY ("storeId")
          REFERENCES "Store"(id)
          ON DELETE CASCADE,
        
        CONSTRAINT "unique_customer_store_email"
          UNIQUE ("storeId", "email")
      )
    `);

    console.log('✅ Tabla Customer creada');

    // Crear índices para mejorar consultas
    await query(`
      CREATE INDEX "idx_Customer_storeId" ON "Customer"("storeId")
    `);
    
    await query(`
      CREATE INDEX "idx_Customer_email" ON "Customer"("email")
    `);
    
    await query(`
      CREATE INDEX "idx_Customer_storeId_email" ON "Customer"("storeId", "email")
    `);

    console.log('✅ Índices creados');

    // Agregar columna customerId a la tabla Order si no existe
    const checkCustomerId = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = 'customerId'
      )
    `);

    if (!checkCustomerId.rows[0].exists) {
      await query(`
        ALTER TABLE "Order"
        ADD COLUMN "customerId" TEXT
      `);
      
      await query(`
        ALTER TABLE "Order"
        ADD CONSTRAINT "fk_Order_customerId"
        FOREIGN KEY ("customerId")
        REFERENCES "Customer"(id)
        ON DELETE SET NULL
      `);
      
      await query(`
        CREATE INDEX "idx_Order_customerId" ON "Order"("customerId")
      `);
      
      console.log('✅ Columna customerId agregada a Order');
    } else {
      console.log('⚠️  La columna customerId ya existe en Order');
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  }
}

// Ejecutar migración
if (require.main === module) {
  createCustomersTable()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { createCustomersTable };
