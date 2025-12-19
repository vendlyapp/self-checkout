/**
 * Script para agregar la columna isActive a la tabla ProductCategory
 * Ejecutar: node scripts/add-isactive-to-categories.js
 */

const fs = require('fs');
const path = require('path');
const { query } = require('../lib/database');
require('dotenv').config();

async function addIsActiveColumn() {
  try {
    console.log('🔄 Ejecutando migración: agregar columna isActive a ProductCategory...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-isactive-to-categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script SQL
    const result = await query(sql);

    console.log('✅ Migración ejecutada exitosamente');
    console.log('   La columna isActive ha sido agregada a ProductCategory');
    console.log('   Todas las categorías existentes tienen isActive = true por defecto\n');

    // Verificar que la columna existe
    const checkQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'ProductCategory'
        AND column_name = 'isActive'
    `;
    
    const checkResult = await query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Verificación: La columna isActive existe');
      console.log('   Tipo:', checkResult.rows[0].data_type);
      console.log('   Nullable:', checkResult.rows[0].is_nullable);
      console.log('   Default:', checkResult.rows[0].column_default);
    } else {
      console.log('⚠️  Advertencia: No se pudo verificar la columna');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar la migración:', error.message);
    console.error('   Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
addIsActiveColumn();

