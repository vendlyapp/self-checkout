#!/usr/bin/env node

/**
 * Script para agregar campos de onboarding a la tabla Store
 * (settingsCompletedAt, onboardingCompletedAt)
 * Ejecutar: node scripts/add-store-onboarding-fields.js
 */

require('dotenv').config();
const { query } = require('../lib/database');

async function addStoreOnboardingFields() {
  try {
    console.log('🔄 Agregando columnas de onboarding a la tabla Store...\n');

    await query(`
      ALTER TABLE "Store"
      ADD COLUMN IF NOT EXISTS "settingsCompletedAt" TIMESTAMP WITH TIME ZONE
    `);
    console.log('   ✓ Columna settingsCompletedAt');

    await query(`
      ALTER TABLE "Store"
      ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP WITH TIME ZONE
    `);
    console.log('   ✓ Columna onboardingCompletedAt');

    try {
      await query(`COMMENT ON COLUMN "Store"."settingsCompletedAt" IS 'Primera vez que el admin guardó la configuración de la tienda'`);
      await query(`COMMENT ON COLUMN "Store"."onboardingCompletedAt" IS 'Cuando el admin completó el flujo de onboarding (settings + opcional payment methods)'`);
    } catch (_) {
      // Ignorar si COMMENT falla
    }

    console.log('\n✅ Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addStoreOnboardingFields();
