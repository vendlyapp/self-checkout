// scripts/validate_auth.js - Script para validar la implementación de autenticación
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

async function validateAuth() {
  log('\n🔍 VALIDANDO SISTEMA DE AUTENTICACIÓN CON SUPABASE\n', 'cyan');
  
  let passed = 0;
  let failed = 0;

  // 1. Verificar archivos necesarios
  log('📁 Verificando archivos necesarios...', 'blue');
  
  const requiredFiles = [
    'lib/supabase.js',
    'src/services/AuthService.js',
    'src/controllers/AuthController.js',
    'src/middleware/authMiddleware.js',
    'src/routes/authRoutes.js'
  ];

  for (const file of requiredFiles) {
    if (checkFileExists(file)) {
      log(`  ✅ ${file}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${file} - NO EXISTE`, 'red');
      failed++;
    }
  }

  // 2. Verificar dependencias
  log('\n📦 Verificando dependencias...', 'blue');
  
  try {
    const packageJson = require('../package.json');
    const requiredDeps = [
      '@supabase/supabase-js',
      'bcryptjs',
      'jsonwebtoken',
      'dotenv'
    ];

    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        log(`  ✅ ${dep} - ${packageJson.dependencies[dep]}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${dep} - NO INSTALADO`, 'red');
        failed++;
      }
    }
  } catch (error) {
    log(`  ❌ Error al leer package.json`, 'red');
    failed++;
  }

  // 3. Verificar variables de entorno
  log('\n⚙️  Verificando variables de entorno...', 'blue');
  
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'DATABASE_URL'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log(`  ✅ ${envVar} - Configurado`, 'green');
      passed++;
    } else {
      log(`  ❌ ${envVar} - NO CONFIGURADO`, 'red');
      log(`     Agrégalo al archivo .env`, 'yellow');
      failed++;
    }
  }

  // 4. Verificar integración en app.js
  log('\n🔗 Verificando integración en app.js...', 'blue');
  
  try {
    const appContent = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
    
    if (appContent.includes('authRoutes')) {
      log(`  ✅ authRoutes importado`, 'green');
      passed++;
    } else {
      log(`  ❌ authRoutes NO importado`, 'red');
      failed++;
    }

    if (appContent.includes('/api/auth')) {
      log(`  ✅ Rutas /api/auth configuradas`, 'green');
      passed++;
    } else {
      log(`  ❌ Rutas /api/auth NO configuradas`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Error al leer app.js`, 'red');
    failed++;
  }

  // 5. Verificar módulos pueden ser importados
  log('\n🔌 Verificando que los módulos se pueden importar...', 'blue');
  
  try {
    require('../lib/supabase');
    log(`  ✅ lib/supabase.js - OK`, 'green');
    passed++;
  } catch (error) {
    log(`  ❌ lib/supabase.js - Error: ${error.message}`, 'red');
    failed++;
  }

  try {
    require('../src/services/AuthService');
    log(`  ✅ AuthService.js - OK`, 'green');
    passed++;
  } catch (error) {
    log(`  ❌ AuthService.js - Error: ${error.message}`, 'red');
    failed++;
  }

  try {
    require('../src/controllers/AuthController');
    log(`  ✅ AuthController.js - OK`, 'green');
    passed++;
  } catch (error) {
    log(`  ❌ AuthController.js - Error: ${error.message}`, 'red');
    failed++;
  }

  try {
    require('../src/middleware/authMiddleware');
    log(`  ✅ authMiddleware.js - OK`, 'green');
    passed++;
  } catch (error) {
    log(`  ❌ authMiddleware.js - Error: ${error.message}`, 'red');
    failed++;
  }

  try {
    require('../src/routes/authRoutes');
    log(`  ✅ authRoutes.js - OK`, 'green');
    passed++;
  } catch (error) {
    log(`  ❌ authRoutes.js - Error: ${error.message}`, 'red');
    failed++;
  }

  // 6. Verificar conexión a Supabase (si está configurado)
  log('\n🌐 Verificando conexión a Supabase...', 'blue');
  
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const { supabase } = require('../lib/supabase');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        log(`  ⚠️  Supabase conectado pero con advertencia: ${error.message}`, 'yellow');
        passed++;
      } else {
        log(`  ✅ Supabase Auth conectado correctamente`, 'green');
        passed++;
      }
    } catch (error) {
      log(`  ❌ Error al conectar con Supabase: ${error.message}`, 'red');
      failed++;
    }
  } else {
    log(`  ⚠️  Variables de Supabase no configuradas - Saltando prueba`, 'yellow');
  }

  // Resumen final
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN DE VALIDACIÓN', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const total = passed + failed;
  const percentage = Math.round((passed / total) * 100);
  
  log(`\n✅ Pruebas exitosas: ${passed}`, 'green');
  log(`❌ Pruebas fallidas: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📊 Porcentaje: ${percentage}%\n`, percentage >= 80 ? 'green' : 'yellow');

  if (failed === 0) {
    log('🎉 ¡VALIDACIÓN COMPLETA! Sistema de autenticación implementado correctamente.', 'green');
    log('📝 Siguiente paso: Configurar credenciales de Supabase en .env y probar endpoints', 'cyan');
  } else if (failed <= 3) {
    log('⚠️  Sistema mayormente implementado. Revisa los errores arriba.', 'yellow');
  } else {
    log('❌ Sistema con problemas. Revisa los errores detallados arriba.', 'red');
  }

  log('\n📚 Documentación completa en: VALIDACION_AUTH.md', 'blue');
  log('🧪 Pruebas de endpoints en: RESUMEN_IMPLEMENTACION.md\n', 'blue');

  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar validación
validateAuth().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});

