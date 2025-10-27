const { query } = require('../lib/database');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function testStoreIsOpen() {
  try {
    log('\n🧪 Probando funcionalidad isOpen...\n', 'cyan');

    // Verificar estructura de la tabla
    log('1️⃣ Verificando estructura de tabla Store...', 'cyan');
    const columns = await query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Store' AND column_name = 'isOpen'
    `);

    if (columns.rows.length > 0) {
      const col = columns.rows[0];
      log('   ✅ Columna isOpen existe:', 'green');
      log(`      Tipo: ${col.data_type}`, 'cyan');
      log(`      Default: ${col.column_default}`, 'cyan');
      log(`      Nullable: ${col.is_nullable}`, 'cyan');
    } else {
      log('   ❌ Columna isOpen NO existe', 'red');
      process.exit(1);
    }

    // Verificar si hay tiendas
    log('\n2️⃣ Verificando tiendas existentes...', 'cyan');
    const stores = await query('SELECT id, name, "isOpen" FROM "Store"');
    if (stores.rows.length > 0) {
      log(`   ✅ Se encontraron ${stores.rows.length} tienda(s):`, 'green');
      stores.rows.forEach((store, i) => {
        log(`      ${i + 1}. ${store.name} - isOpen: ${store.isOpen}`, 'cyan');
      });

      // Probar actualizar el estado de la primera tienda
      const firstStore = stores.rows[0];
      log(`\n3️⃣ Probando actualizar isOpen para "${firstStore.name}"...`, 'cyan');
      
      const newStatus = !firstStore.isOpen;
      await query(`
        UPDATE "Store" 
        SET "isOpen" = $1, "updatedAt" = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [newStatus, firstStore.id]);
      
      log(`   ✅ Estado cambiado de ${firstStore.isOpen} a ${newStatus}`, 'green');
      
      // Verificar el cambio
      const updatedStore = await query('SELECT "isOpen" FROM "Store" WHERE id = $1', [firstStore.id]);
      log(`   ✅ Verificado: isOpen = ${updatedStore.rows[0].isOpen}`, 'green');
      
      // Restaurar el estado original
      await query(`
        UPDATE "Store" 
        SET "isOpen" = $1 
        WHERE id = $2
      `, [firstStore.isOpen, firstStore.id]);
      log(`   ✅ Estado restaurado a ${firstStore.isOpen}`, 'green');

    } else {
      log('   ⚠️  No hay tiendas en la base de datos', 'yellow');
    }

    log('\n✅ Todas las pruebas pasaron exitosamente\n', 'green');
    process.exit(0);

  } catch (error) {
    log('\n❌ Error en las pruebas:', 'red');
    log(error.message, 'red');
    log('\n' + error.stack, 'red');
    process.exit(1);
  }
}

testStoreIsOpen();

