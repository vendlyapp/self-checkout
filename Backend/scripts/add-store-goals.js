#!/usr/bin/env node

/**
 * Migración: agrega columnas de metas de ventas a la tabla Store
 * (goalDaily, goalWeekly, goalMonthly en CHF)
 * Ejecutar: node scripts/add-store-goals.js
 */

require('dotenv').config();
const { query } = require('../lib/database');

async function addStoreGoals() {
  try {
    console.log('🔄 Agregando columnas de metas (Ziele) a la tabla Store...\n');

    await query(`
      ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "goalDaily" NUMERIC DEFAULT NULL
    `);
    console.log('   ✓ Columna goalDaily (Tagesziel)');

    await query(`
      ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "goalWeekly" NUMERIC DEFAULT NULL
    `);
    console.log('   ✓ Columna goalWeekly (Wochenziel)');

    await query(`
      ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "goalMonthly" NUMERIC DEFAULT NULL
    `);
    console.log('   ✓ Columna goalMonthly (Monatsziel)');

    try {
      await query(`COMMENT ON COLUMN "Store"."goalDaily" IS 'Daily sales goal in CHF (Tagesziel)'`);
      await query(`COMMENT ON COLUMN "Store"."goalWeekly" IS 'Weekly sales goal in CHF (Wochenziel)'`);
      await query(`COMMENT ON COLUMN "Store"."goalMonthly" IS 'Monthly sales goal in CHF (Monatsziel)'`);
    } catch (_) {
      // Ignorar si COMMENT falla (ej. PostgreSQL antiguo)
    }

    console.log('\n✅ Migración de metas completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addStoreGoals();
