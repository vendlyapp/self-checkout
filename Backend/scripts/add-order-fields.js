/**
 * Script para agregar columnas adicionales a la tabla Order
 * Agrega: paymentMethod, storeId, metadata
 * Ejecutar: node scripts/add-order-fields.js
 */

const { query } = require('../lib/database');

async function addOrderFields() {
  try {
    console.log('📦 Agregando columnas adicionales a la tabla Order...');

    // Verificar y agregar paymentMethod
    const checkPaymentMethod = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = 'paymentMethod'
      )
    `);

    if (!checkPaymentMethod.rows[0].exists) {
      await query(`
        ALTER TABLE "Order"
        ADD COLUMN "paymentMethod" VARCHAR(50)
      `);
      console.log('✅ Columna paymentMethod agregada');
    } else {
      console.log('⚠️  La columna paymentMethod ya existe');
    }

    // Verificar y agregar storeId
    const checkStoreId = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = 'storeId'
      )
    `);

    if (!checkStoreId.rows[0].exists) {
      await query(`
        ALTER TABLE "Order"
        ADD COLUMN "storeId" TEXT
      `);
      
      // Agregar foreign key constraint si existe la tabla Store
      try {
        await query(`
          ALTER TABLE "Order"
          ADD CONSTRAINT "fk_Order_storeId"
          FOREIGN KEY ("storeId")
          REFERENCES "Store"(id)
          ON DELETE SET NULL
        `);
        console.log('✅ Foreign key constraint agregada para storeId');
      } catch (error) {
        console.log('⚠️  No se pudo agregar foreign key para storeId (puede que la tabla Store no exista o ya exista la constraint)');
      }
      
      console.log('✅ Columna storeId agregada');
    } else {
      console.log('⚠️  La columna storeId ya existe');
    }

    // Verificar y agregar metadata (JSONB para información flexible)
    const checkMetadata = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = 'metadata'
      )
    `);

    if (!checkMetadata.rows[0].exists) {
      await query(`
        ALTER TABLE "Order"
        ADD COLUMN "metadata" JSONB DEFAULT '{}'::jsonb
      `);
      console.log('✅ Columna metadata agregada');
    } else {
      console.log('⚠️  La columna metadata ya existe');
    }

    // Crear índices para mejorar consultas
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS "idx_Order_paymentMethod" ON "Order"("paymentMethod")
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS "idx_Order_storeId" ON "Order"("storeId")
      `);
      console.log('✅ Índices creados');
    } catch (error) {
      console.log('⚠️  Error creando índices:', error.message);
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  }
}

// Ejecutar migración
if (require.main === module) {
  addOrderFields()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { addOrderFields };

