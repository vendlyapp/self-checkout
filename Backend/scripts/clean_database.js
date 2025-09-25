const { query } = require('../lib/database');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanDatabase(options = {}) {
  const {
    cleanData = false,     // Solo limpiar datos (DELETE)
    cleanTables = false,   // Eliminar tablas (DROP)
    cleanAll = false       // Limpieza completa
  } = options;

  try {
    log('🧹 Iniciando limpieza de base de datos...', 'blue');

    if (cleanAll) {
      log('⚠️  LIMPIEZA COMPLETA - Esto eliminará TODAS las tablas y datos', 'red');
      log('   Presiona Ctrl+C en los próximos 5 segundos para cancelar...', 'yellow');

      await new Promise(resolve => setTimeout(resolve, 5000));

      // Eliminar tablas en orden correcto (por dependencias)
      const tables = ['OrderItem', 'Order', 'Product', 'ProductCategory', 'User'];

      for (const table of tables) {
        log(`🗑️  Eliminando tabla: ${table}`, 'red');
        await query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      }

      // Eliminar tipos personalizados
      log('🗑️  Eliminando tipos personalizados...', 'red');
      await query('DROP TYPE IF EXISTS "UserRole" CASCADE');

      // Eliminar función
      log('🗑️  Eliminando función de actualización...', 'red');
      await query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');

      log('✅ Limpieza completa realizada', 'green');

    } else if (cleanTables) {
      log('⚠️  ELIMINANDO TABLAS - Esto eliminará las tablas pero NO los datos', 'yellow');
      log('   (Los datos se perderán porque las tablas desaparecerán)', 'yellow');

      const tables = ['OrderItem', 'Order', 'Product', 'ProductCategory', 'User'];

      for (const table of tables) {
        log(`🗑️  Eliminando tabla: ${table}`, 'yellow');
        await query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      }

      await query('DROP TYPE IF EXISTS "UserRole" CASCADE');
      await query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');

      log('✅ Tablas eliminadas', 'green');

    } else if (cleanData) {
      log('🧹 LIMPIANDO DATOS - Esto eliminará todos los datos pero mantendrá las tablas', 'yellow');

      // Limpiar datos en orden correcto (por dependencias)
      const tables = ['OrderItem', 'Order', 'Product', 'ProductCategory', 'User'];

      for (const table of tables) {
        log(`🧹 Limpiando datos de: ${table}`, 'yellow');
        await query(`DELETE FROM "${table}"`);
      }

      // Resetear secuencias si existen
      log('🔄 Reseteando secuencias...', 'yellow');
      await query('ALTER SEQUENCE IF EXISTS "User_id_seq" RESTART WITH 1');
      await query('ALTER SEQUENCE IF EXISTS "Product_id_seq" RESTART WITH 1');
      await query('ALTER SEQUENCE IF EXISTS "ProductCategory_id_seq" RESTART WITH 1');
      await query('ALTER SEQUENCE IF EXISTS "Order_id_seq" RESTART WITH 1');
      await query('ALTER SEQUENCE IF EXISTS "OrderItem_id_seq" RESTART WITH 1');

      log('✅ Datos limpiados', 'green');

    } else {
      log('❌ No se especificó qué limpiar', 'red');
      log('Opciones disponibles:', 'blue');
      log('  --data     : Limpiar solo los datos (mantener tablas)', 'blue');
      log('  --tables   : Eliminar tablas (perderá datos)', 'blue');
      log('  --all      : Limpieza completa (eliminar todo)', 'blue');
      return;
    }

    log('🎉 Limpieza completada exitosamente', 'green');

  } catch (error) {
    log(`❌ Error durante la limpieza: ${error.message}`, 'red');
    throw error;
  }
}

// Función para mostrar el estado actual
async function showCurrentState() {
  try {
    log('📊 Estado actual de la base de datos:', 'blue');

    const tables = ['User', 'ProductCategory', 'Product', 'Order', 'OrderItem'];

    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM "${table}"`);
        const count = result.rows[0].count;
        log(`   ${table}: ${count} registros`, count > 0 ? 'green' : 'yellow');
      } catch (error) {
        log(`   ${table}: Tabla no existe`, 'red');
      }
    }

  } catch (error) {
    log(`❌ Error al verificar estado: ${error.message}`, 'red');
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  log('🗄️  Vendly Checkout - Limpiador de Base de Datos', 'blue');
  log('=' * 50, 'blue');

  // Mostrar estado actual
  await showCurrentState();
  log('');

  if (args.includes('--all')) {
    await cleanDatabase({ cleanAll: true });
  } else if (args.includes('--tables')) {
    await cleanDatabase({ cleanTables: true });
  } else if (args.includes('--data')) {
    await cleanDatabase({ cleanData: true });
  } else {
    log('📋 Uso del script:', 'blue');
    log('  node clean_database.js --data     # Limpiar solo datos', 'blue');
    log('  node clean_database.js --tables   # Eliminar tablas', 'blue');
    log('  node clean_database.js --all      # Limpieza completa', 'blue');
    log('');
    log('⚠️  IMPORTANTE:', 'yellow');
    log('  --data   : Elimina datos pero mantiene las tablas', 'yellow');
    log('  --tables : Elimina tablas (los datos se pierden)', 'yellow');
    log('  --all    : Elimina TODO (tablas, datos, tipos, funciones)', 'yellow');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { cleanDatabase, showCurrentState };
