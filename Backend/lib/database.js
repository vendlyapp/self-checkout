// lib/database.js - Cliente PostgreSQL directo
const { Pool } = require('pg');
const format = require('pg-format');
require('dotenv').config();

// Configuración de la base de datos
// IMPORTANTE: Si usas Transaction Pooler de Supabase (puerto 6543), NO soporta PREPARE statements
// Por lo tanto, debemos deshabilitar prepared statements
const isUsingPooler = process.env.DATABASE_URL?.includes(':6543') || process.env.DATABASE_URL?.includes('pooler.supabase.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Reducir conexiones máximas para Supabase (especialmente si usa pooler)
  max: process.env.NODE_ENV === 'production' ? 10 : 5, // Menos conexiones para evitar límites
  idleTimeoutMillis: 20000, // Reducir tiempo idle para liberar conexiones más rápido
  connectionTimeoutMillis: 10000,
  // Configuraciones adicionales para mejor manejo de errores
  allowExitOnIdle: false,
  // NOTA: No modificamos la configuración de tipos aquí
  // El manejo de prepared statements se hace en la función query() usando pg-format
});

// Manejo de errores del pool (solo registrar, no crashear)
let poolErrorHandlerRegistered = false;
if (!poolErrorHandlerRegistered) {
  poolErrorHandlerRegistered = true;
  
  pool.on('error', (err, client) => {
    // Error XX000 de Supabase: "DbHandler exited" - generalmente es por límites de conexión
    if (err.code === 'XX000') {
      // Este error es común en Supabase cuando se exceden límites de conexión
      // El pool manejará la reconexión automáticamente
      console.warn('⚠️ Supabase cerró la conexión (posible límite de conexiones alcanzado)');
      console.warn('   El pool intentará reconectar automáticamente en la próxima query');
      console.warn('   Considera reducir el número de conexiones simultáneas si persiste');
      
      // Si hay un cliente específico, removerlo del pool
      if (client) {
        // El cliente ya está marcado como error, el pool lo removerá automáticamente
        // No necesitamos hacer nada más
      }
      return; // No loggear como error crítico, es manejable
    }
    
    // Error 57P01: administrador cerró la conexión
    if (err.code === '57P01') {
      console.warn('⚠️ Conexión cerrada por el servidor, el pool reconectará automáticamente');
      return;
    }
    
    // Otros errores fatales
    if (err.severity === 'FATAL') {
      console.error('❌ Error fatal en el pool de conexiones:', err.message);
      console.error('Código:', err.code);
      console.warn('⚠️ El pool intentará reconectar automáticamente');
    } else {
      // Para otros errores, solo loggear en modo desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Error en pool (no crítico):', err.message);
      }
    }
    
    // No lanzar el error para evitar que crashee el proceso
    // El pool manejará la reconexión automáticamente
  });
}

// Función para probar la conexión
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a Supabase establecida:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Función para ejecutar consultas con manejo robusto de errores y reintentos
// IMPORTANTE: Si usamos Transaction Pooler, NO podemos usar prepared statements
async function query(text, params = [], retries = 1) {
  let client;
  let lastError;
  
  // Detectar si estamos usando Transaction Pooler
  const isUsingPooler = process.env.DATABASE_URL?.includes(':6543') || process.env.DATABASE_URL?.includes('pooler.supabase.com');
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      client = await pool.connect();
      
      // Si usamos Transaction Pooler, ejecutar query sin prepared statements
      // El Transaction Pooler NO soporta PREPARE statements
      // Usamos pg-format para formatear la query de forma segura sin prepared statements
      let result;
      if (isUsingPooler && params.length > 0) {
        // pg-format escapa valores automáticamente para prevenir SQL injection
        // Formato: %L para literales (strings, numbers, null), %I para identificadores
        // Reemplazamos $1, $2, etc. con %L para usar pg-format
        let formattedText = text;
        // Reemplazar placeholders $1, $2, etc. con %L para pg-format
        // Pero preservar cualquier casting como ::jsonb, ::json, etc.
        const paramPlaceholders = [];
        let placeholderIndex = 0; // Índice para pg-format (solo para valores que no son arrays)
        
        for (let i = 1; i <= params.length; i++) {
          const paramValue = params[i - 1];
          // Buscar si hay casting después del placeholder (ej: $13::jsonb)
          const placeholderRegex = new RegExp(`\\$${i}(::\\w+)?\\b`, 'g');
          const match = formattedText.match(placeholderRegex);
          
          if (match && match[0].includes('::')) {
            // Si hay casting, preservarlo
            const casting = match[0].substring(match[0].indexOf('::'));
            formattedText = formattedText.replace(placeholderRegex, `%L${casting}`);
            paramPlaceholders.push(paramValue);
            placeholderIndex++;
          } else if (Array.isArray(paramValue)) {
            // Para arrays, convertir a formato PostgreSQL text[] manualmente
            // Formato: ARRAY['valor1','valor2']::text[]
            const escapedArray = paramValue.map(val => {
              if (val === null || val === undefined) return 'NULL';
              const str = String(val).replace(/'/g, "''").replace(/\\/g, '\\\\');
              return `'${str}'`;
            });
            const arrayLiteral = escapedArray.length > 0 
              ? `ARRAY[${escapedArray.join(',')}]::text[]`
              : `ARRAY[]::text[]`;
            formattedText = formattedText.replace(new RegExp(`\\$${i}\\b`, 'g'), arrayLiteral);
            // No agregar a paramPlaceholders porque ya está en la query
          } else {
            // Sin casting, reemplazar normalmente
            formattedText = formattedText.replace(new RegExp(`\\$${i}\\b`, 'g'), `%L`);
            paramPlaceholders.push(paramValue);
            placeholderIndex++;
          }
        }
        const finalQuery = paramPlaceholders.length > 0 ? format(formattedText, ...paramPlaceholders) : formattedText;
        result = await client.query(finalQuery);
      } else {
        // Para conexión directa, usar prepared statements normalmente (más seguro)
        result = await client.query(text, params);
      }
      
      // Si llegamos aquí, la query fue exitosa
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          // Error al liberar, pero la query fue exitosa
          // El pool manejará el cliente en mal estado
        }
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Si hay un cliente, intentar liberarlo
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          // El cliente está en mal estado, el pool lo manejará
        }
        client = null; // Resetear para el siguiente intento
      }
      
      // Si es un error de conexión y tenemos reintentos, esperar un poco y reintentar
      if ((error.code === 'XX000' || error.code === '57P01' || error.code === 'ECONNREFUSED') && attempt < retries) {
        console.warn(`⚠️ Error de conexión (intento ${attempt + 1}/${retries + 1}), reintentando en 500ms...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms antes de reintentar
        continue; // Reintentar
      }
      
      // Si no es un error de conexión o no hay más reintentos, loggear y lanzar
      if (attempt === retries) {
        console.error('❌ Error en consulta después de reintentos:', error.message);
        console.error('Query:', text.substring(0, 100) + '...');
        if (params.length > 0) {
          console.error('Params:', params.slice(0, 3)); // Solo primeros 3 params para no saturar logs
        }
      }
    }
  }
  
  // Si llegamos aquí, todos los reintentos fallaron
  throw lastError;
}

// Función para ejecutar transacciones con manejo robusto de errores
async function transaction(callback) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('❌ Error al hacer rollback:', rollbackError.message);
        // Si el rollback falla, el cliente probablemente está desconectado
        // El pool lo manejará automáticamente
      }
    }
    throw error;
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('❌ Error al liberar cliente en transacción:', releaseError.message);
      }
    }
  }
}

// Función para cerrar el pool de forma segura
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar el pool:', error.message);
  }
}

// Manejar cierre graceful del proceso
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando pool de conexiones...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando pool de conexiones...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};
