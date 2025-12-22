#!/usr/bin/env node
/**
 * Script para probar conexión directa (sin pooler)
 */

require('dotenv').config();
const { Pool } = require('pg');

// Convertir URL de pooler a directa
let DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL.includes('pooler.supabase.com') || DATABASE_URL.includes(':6543')) {
  console.log('🔄 Convirtiendo URL de pooler a conexión directa...\n');
  DATABASE_URL = DATABASE_URL
    .replace('pooler.supabase.com', 'supabase.co')
    .replace(':6543', ':5432');
  console.log(`   Nueva URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 20000, // 20 segundos
  max: 1,
});

async function test() {
  try {
    console.log('🔄 Intentando conectar con conexión directa...');
    const startTime = Date.now();
    const client = await pool.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Conexión exitosa en ${connectTime}ms\n`);
    
    const result = await client.query('SELECT NOW(), version()');
    console.log(`✅ Query exitosa`);
    console.log(`   Fecha: ${result.rows[0].now}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
    
    client.release();
    await pool.end();
    
    console.log('💡 Si esto funcionó, actualiza tu .env con esta URL directa');
    console.log('   (Nota: La conexión directa tiene límites más estrictos de conexiones)');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(`   Código: ${error.code || 'N/A'}\n`);
    
    console.log('💡 Posibles soluciones:');
    console.log('   1. Verifica que tu proyecto de Supabase esté activo');
    console.log('   2. Ve a Settings > Database y copia la Connection String actualizada');
    console.log('   3. Verifica que no haya problemas de red/firewall');
    
    await pool.end();
    process.exit(1);
  }
}

test();

