/**
 * Script para agregar columna 'status' a la tabla Order
 * Ejecutar: node scripts/add-order-status-column.js
 */

require('dotenv').config();
const { query } = require('../lib/database');

async function addOrderStatusColumn() {
  try {
    console.log('📦 Agregando columna status a la tabla Order...');

    // Verificar si la columna ya existe
    const checkColumn = await query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = 'status'
      )
    `);

    if (checkColumn.rows[0].exists) {
      console.log('⚠️  La columna status ya existe en la tabla Order');
      console.log('🔄 Actualizando todas las órdenes existentes a "completed"...');
      
      // Actualizar todas las órdenes existentes a 'completed' (todas son compras reales completadas)
      const updateResult = await query(`
        UPDATE "Order"
        SET status = 'completed'
        WHERE status IS NULL OR status != 'completed'
      `);
      
      console.log(`✅ ${updateResult.rowCount} órdenes actualizadas a "completed"`);
    } else {
      // Agregar columna status con valor por defecto 'completed'
      await query(`
        ALTER TABLE "Order"
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed'
        CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
      `);

      // Actualizar todas las órdenes existentes sin status a 'completed'
      const updateResult = await query(`
        UPDATE "Order"
        SET status = 'completed'
        WHERE status IS NULL
      `);
      
      console.log(`✅ ${updateResult.rowCount} órdenes actualizadas a "completed"`);

      // Crear índice para mejorar las consultas por status
      await query(`
        CREATE INDEX IF NOT EXISTS "idx_Order_status" ON "Order"("status")
      `);

      console.log('✅ Columna status agregada exitosamente');
    }
    
    // Verificar el estado final
    const statusCount = await query(`
      SELECT status, COUNT(*) as count
      FROM "Order"
      GROUP BY status
    `);
    
    console.log('\n📊 Estado actual de las órdenes:');
    statusCount.rows.forEach(row => {
      console.log(`   - ${row.status || 'NULL'}: ${row.count} órdenes`);
    });

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  }
}

// Ejecutar migración
if (require.main === module) {
  addOrderStatusColumn()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { addOrderStatusColumn };

