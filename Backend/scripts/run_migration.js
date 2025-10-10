const fs = require('fs');
const path = require('path');
const { query } = require('../lib/database');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function runMigration(migrationFile) {
  try {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`🔄 Ejecutando migración: ${path.basename(migrationFile)}`, 'bright');
    log('='.repeat(60), 'cyan');

    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.toUpperCase().includes('SELECT') && statement.includes('status')) {
        const result = await query(statement);
        if (result.rows && result.rows.length > 0) {
          log(`  ${result.rows[0].status || result.rows[0].final_status}`, 'green');
        }
      } else if (statement.trim().length > 0) {
        await query(statement);
      }
    }

    log('\n✅ Migración completada exitosamente', 'green');
    log('='.repeat(60), 'cyan');
    
  } catch (error) {
    log('\n❌ Error ejecutando migración:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function runAllMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    log('\n📋 Migraciones encontradas:', 'cyan');
    files.forEach((f, i) => log(`  ${i + 1}. ${f}`, 'blue'));

    for (const file of files) {
      await runMigration(path.join(migrationsDir, file));
    }

    log('\n🎉 Todas las migraciones ejecutadas exitosamente\n', 'green');
    process.exit(0);
    
  } catch (error) {
    log('\n💥 Error ejecutando migraciones:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  runAllMigrations();
}

module.exports = { runMigration, runAllMigrations };

