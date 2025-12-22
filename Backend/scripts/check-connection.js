#!/usr/bin/env node
/**
 * Script rápido para verificar el estado de la conexión a Supabase
 * Uso: node scripts/check-connection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurado en .env');
  process.exit(1);
}

// Detectar tipo de conexión
const isPooler = DATABASE_URL.includes(':6543') || DATABASE_URL.includes('pooler.supabase.com');
const isDirect = DATABASE_URL.includes(':5432') && !DATABASE_URL.includes('pooler');

console.log('🔍 Verificando conexión a Supabase...\n');
console.log(`Tipo: ${isPooler ? 'Pooler (6543)' : isDirect ? 'Directa (5432)' : 'Desconocido'}`);
console.log(`Host: ${new URL(DATABASE_URL).hostname}\n`);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000, // 30 segundos
  max: 1,
});

async function check() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Intentando conectar...');
    const client = await pool.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Conexión exitosa (${connectTime}ms)\n`);
    
    // Probar query
    const queryStart = Date.now();
    const result = await client.query('SELECT NOW(), version()');
    const queryTime = Date.now() - queryStart;
    
    console.log(`✅ Query exitosa (${queryTime}ms)`);
    console.log(`   Fecha del servidor: ${result.rows[0].now}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
    
    client.release();
    await pool.end();
    
    console.log('✅ Todo funciona correctamente');
    process.exit(0);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`\n❌ Error después de ${totalTime}ms`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code || 'N/A'}\n`);
    
    // Diagnóstico específico
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.log('💡 Diagnóstico: TIMEOUT');
      console.log('   - Supabase puede estar lento o inaccesible');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - Intenta cambiar a conexión directa (puerto 5432) si usas pooler\n');
    } else if (error.code === 'XX000') {
      console.log('💡 Diagnóstico: Límite de conexiones');
      console.log('   - Supabase puede estar limitando conexiones');
      console.log('   - Verifica que no haya múltiples instancias corriendo\n');
    } else if (error.code === '57P01') {
      console.log('💡 Diagnóstico: Conexión cerrada por servidor');
      console.log('   - El servidor cerró la conexión');
      console.log('   - Puede ser temporal, intenta de nuevo\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Diagnóstico: Conexión rechazada');
      console.log('   - El servidor no está disponible');
      console.log('   - Verifica que tu proyecto de Supabase esté activo\n');
    }
    
    console.log('💡 Para más detalles, ejecuta:');
    console.log('   node scripts/diagnose-db-connection.js\n');
    
    await pool.end();
    process.exit(1);
  }
}

check();

