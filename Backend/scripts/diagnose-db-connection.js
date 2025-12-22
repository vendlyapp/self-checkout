#!/usr/bin/env node
/**
 * Script de diagnóstico para problemas de conexión a la base de datos
 */

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 Diagnóstico de Conexión a Base de Datos\n');
console.log('='.repeat(60));

// 1. Verificar que DATABASE_URL esté configurado
if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurado en .env');
  process.exit(1);
}

console.log('✅ DATABASE_URL está configurado');
console.log(`   URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`); // Ocultar password

// 2. Detectar tipo de conexión
const isPooler = DATABASE_URL.includes(':6543') || DATABASE_URL.includes('pooler.supabase.com');
const isDirect = DATABASE_URL.includes(':5432') && !DATABASE_URL.includes('pooler');

console.log(`\n📊 Tipo de conexión:`);
console.log(`   ${isPooler ? '✅' : '  '} Pooler (puerto 6543)`);
console.log(`   ${isDirect ? '✅' : '  '} Directa (puerto 5432)`);

// 3. Intentar conexión con diferentes configuraciones
async function testConnection(config = {}) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000, // 15 segundos para diagnóstico
    ...config
  });

  try {
    console.log('\n🔄 Intentando conectar...');
    const startTime = Date.now();
    const client = await pool.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Conexión exitosa en ${connectTime}ms`);
    
    // Probar query simple
    const queryStart = Date.now();
    const result = await client.query('SELECT NOW(), version()');
    const queryTime = Date.now() - queryStart;
    
    console.log(`✅ Query exitosa en ${queryTime}ms`);
    console.log(`   Fecha del servidor: ${result.rows[0].now}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(`   Código: ${error.code || 'N/A'}`);
    console.error(`   Detalles: ${error.toString()}`);
    
    try {
      await pool.end();
    } catch (e) {
      // Ignorar errores al cerrar
    }
    return false;
  }
}

// 4. Probar diferentes configuraciones
async function runDiagnostics() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Ejecutando pruebas de conexión...\n');
  
  // Prueba 1: Configuración estándar
  console.log('📝 Prueba 1: Configuración estándar');
  const test1 = await testConnection({
    max: 1,
    idleTimeoutMillis: 20000,
  });
  
  if (!test1) {
    console.log('\n⚠️  La conexión estándar falló. Intentando alternativas...\n');
    
    // Prueba 2: Sin SSL (solo para diagnóstico)
    console.log('📝 Prueba 2: Sin SSL (solo diagnóstico)');
    const poolNoSSL = new Pool({
      connectionString: DATABASE_URL,
      ssl: false,
      connectionTimeoutMillis: 15000,
      max: 1,
    });
    
    try {
      const client = await poolNoSSL.connect();
      console.log('✅ Conexión sin SSL funcionó (pero no es recomendado)');
      client.release();
      await poolNoSSL.end();
    } catch (error) {
      console.log(`❌ Sin SSL también falló: ${error.message}`);
      await poolNoSSL.end();
    }
  }
  
  // 5. Verificar conectividad de red
  console.log('\n' + '='.repeat(60));
  console.log('🌐 Verificando conectividad de red...\n');
  
  const url = new URL(DATABASE_URL);
  const host = url.hostname;
  const port = url.port || (isPooler ? '6543' : '5432');
  
  console.log(`   Host: ${host}`);
  console.log(`   Puerto: ${port}`);
  
  // 6. Recomendaciones
  console.log('\n' + '='.repeat(60));
  console.log('💡 Recomendaciones:\n');
  
  if (!test1) {
    console.log('1. Verifica que tu base de datos de Supabase esté activa:');
    console.log('   - Ve a https://supabase.com/dashboard');
    console.log('   - Verifica el estado de tu proyecto\n');
    
    console.log('2. Verifica las credenciales:');
    console.log('   - Ve a Settings > Database');
    console.log('   - Copia la Connection String actualizada\n');
    
    console.log('3. Si usas pooler (puerto 6543), intenta con conexión directa:');
    console.log('   - Cambia el puerto de 6543 a 5432');
    console.log('   - O usa la Connection String "Direct connection"\n');
    
    console.log('4. Verifica tu firewall/red:');
    console.log('   - Asegúrate de que el puerto no esté bloqueado');
    console.log('   - Si estás en una red corporativa, verifica el proxy\n');
    
    console.log('5. Verifica los límites de conexión de Supabase:');
    console.log('   - Plan gratuito: ~60 conexiones directas');
    console.log('   - Si tienes muchas instancias corriendo, reduce el `max` del pool\n');
  } else {
    console.log('✅ La conexión funciona correctamente.');
    console.log('   Si el servidor sigue fallando, verifica:');
    console.log('   - Que no haya múltiples instancias del servidor corriendo');
    console.log('   - Que el pool no esté configurado con demasiadas conexiones');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Ejecutar diagnóstico
runDiagnostics().catch(error => {
  console.error('\n❌ Error fatal en diagnóstico:', error);
  process.exit(1);
});

