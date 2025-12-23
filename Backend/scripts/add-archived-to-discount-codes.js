#!/usr/bin/env node

/**
 * Script para agregar el campo archived a la tabla DiscountCode
 */

require('dotenv').config();
const { readFileSync } = require('fs');
const { join } = require('path');
const { query } = require('../lib/database');

async function addArchivedColumn() {
  try {
    console.log('🔄 Agregando columna archived a la tabla DiscountCode...\n');
    
    const sqlPath = join(__dirname, 'add-archived-to-discount-codes.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    await query(sql);
    
    console.log('✅ Columna archived agregada exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar columna archived:', error.message);
    process.exit(1);
  }
}

addArchivedColumn();

