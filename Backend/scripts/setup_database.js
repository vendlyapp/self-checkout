const fs = require('fs');
const path = require('path');
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

async function setupDatabase() {
  try {
    log('🗄️  Configurando base de datos Vendly Checkout...', 'blue');
    log('=' * 50, 'blue');

    const sqlPath = path.join(__dirname, 'setup_database.sql');

    if (!fs.existsSync(sqlPath)) {
      throw new Error('Archivo setup_database.sql no encontrado');
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el contenido en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    log(`📝 Ejecutando ${statements.length} statements SQL...`, 'yellow');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.trim()) {
        try {
          log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`, 'blue');
          await query(statement);
        } catch (error) {
          // Ignorar errores de "ya existe" para tipos y funciones
          if (error.message.includes('already exists') || error.message.includes('ya existe')) {
            log(`   ⚠️  Ya existe: ${statement.substring(0, 30)}...`, 'yellow');
          } else {
            throw error;
          }
        }
      }
    }

    log('✅ Base de datos configurada exitosamente', 'green');

    // Verificar que las tablas se crearon
    log('\n📊 Verificando tablas creadas:', 'blue');
    const tables = ['User', 'ProductCategory', 'Product', 'Order', 'OrderItem'];

    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM "${table}"`);
        log(`   ✅ ${table}: ${result.rows[0].count} registros`, 'green');
      } catch (error) {
        log(`   ❌ ${table}: Error - ${error.message}`, 'red');
      }
    }

    log('\n🎉 ¡Base de datos lista para usar!', 'green');
    log('💡 Puedes ejecutar "npm test" para probar el CRUD', 'blue');

  } catch (error) {
    log(`❌ Error configurando base de datos: ${error.message}`, 'red');
    throw error;
  }
}

// Función para verificar el estado de la base de datos
async function checkDatabaseStatus() {
  try {
    log('🔍 Verificando estado de la base de datos...', 'blue');

    const tables = ['User', 'ProductCategory', 'Product', 'Order', 'OrderItem'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM "${table}" LIMIT 1`);
        log(`   ✅ ${table}: Existe`, 'green');
      } catch (error) {
        log(`   ❌ ${table}: No existe`, 'red');
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      log('\n✅ Todas las tablas existen. Base de datos lista.', 'green');
    } else {
      log('\n⚠️  Algunas tablas faltan. Ejecuta setup para crearlas.', 'yellow');
    }

  } catch (error) {
    log(`❌ Error verificando estado: ${error.message}`, 'red');
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--check')) {
    await checkDatabaseStatus();
  } else {
    await setupDatabase();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { setupDatabase, checkDatabaseStatus };
