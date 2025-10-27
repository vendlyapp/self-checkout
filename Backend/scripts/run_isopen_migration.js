const { query } = require('../lib/database');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function runIsOpenMigration() {
  try {
    log('\n🔄 Ejecutando migración: isOpen para Store', 'cyan');
    log('='.repeat(60), 'cyan');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'migrations', '03_add_store_isopen.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar manualmente las sentencias importantes
    log('\n📝 Ejecutando sentencias SQL...', 'yellow');

    try {
      // 1. Agregar columna isOpen
      log('  → Agregando columna isOpen...', 'cyan');
      await query(`
        ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isOpen" BOOLEAN DEFAULT true
      `);
      log('  ✅ Columna isOpen agregada', 'green');

      // 2. Crear índice
      log('  → Creando índice...', 'cyan');
      await query(`
        CREATE INDEX IF NOT EXISTS "idx_store_isopen" ON "Store"("isOpen")
      `);
      log('  ✅ Índice creado', 'green');

      // 3. Agregar comentario
      log('  → Agregando comentario...', 'cyan');
      await query(`
        COMMENT ON COLUMN "Store"."isOpen" IS 'Indica si la tienda está abierta para recibir pedidos (true) o cerrada (false)'
      `);
      log('  ✅ Comentario agregado', 'green');

    } catch (error) {
      // Si es un error de "ya existe", es OK
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        log('  ⚠️  Ya existe (continuando...)', 'yellow');
      } else {
        throw error;
      }
    }

    log('\n✅ Migración isOpen completada exitosamente', 'green');
    log('='.repeat(60), 'cyan');

    // Verificar que el campo existe
    log('\n🔍 Verificando que la columna isOpen existe...', 'cyan');
    const checkResult = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Store' AND column_name = 'isOpen'
    `);

    if (checkResult.rows.length > 0) {
      log('✅ Columna isOpen creada correctamente:', 'green');
      log(`   Tipo: ${checkResult.rows[0].data_type}`, 'cyan');
      log(`   Default: ${checkResult.rows[0].column_default}`, 'cyan');
    } else {
      log('⚠️  No se pudo verificar la columna isOpen', 'yellow');
    }

    log('\n🎉 Proceso completado\n', 'green');
    process.exit(0);

  } catch (error) {
    log('\n❌ Error ejecutando migración:', 'red');
    log(error.message, 'red');
    log('\n' + error.stack, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runIsOpenMigration();
}

module.exports = { runIsOpenMigration };
