#!/usr/bin/env node
/**
 * Script de verificación para despliegue en producción
 * Verifica que todas las variables de entorno y configuraciones estén correctas
 */

require('dotenv').config();
const { testConnection } = require('../lib/database');
const { createClient } = require('@supabase/supabase-js');

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'CORS_ORIGIN',
  'FRONTEND_URL',
];

const OPTIONAL_ENV_VARS = [
  'DIRECT_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET',
  'SUPER_ADMIN_EMAIL',
  'SUPER_ADMIN_PASSWORD',
];

async function verifyEnvironment() {
  console.log('🔍 Verificando configuración de producción...\n');

  let errors = [];
  let warnings = [];

  // Verificar variables requeridas
  console.log('📋 Variables de entorno requeridas:');
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      errors.push(`❌ ${varName} no está definida`);
      console.log(`   ❌ ${varName}: NO DEFINIDA`);
    } else {
      // Ocultar valores sensibles
      const displayValue = varName.includes('KEY') || varName.includes('URL') || varName.includes('PASSWORD')
        ? `${value.substring(0, 20)}...`
        : value;
      console.log(`   ✅ ${varName}: ${displayValue}`);
    }
  }

  // Verificar variables opcionales
  console.log('\n📋 Variables de entorno opcionales:');
  for (const varName of OPTIONAL_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      warnings.push(`⚠️  ${varName} no está definida (opcional)`);
      console.log(`   ⚠️  ${varName}: NO DEFINIDA (opcional)`);
    } else {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  }

  // Verificar NODE_ENV
  console.log('\n🌍 Entorno:');
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('⚠️  NODE_ENV no está en "production"');
    console.log(`   ⚠️  NODE_ENV: ${process.env.NODE_ENV} (debería ser "production")`);
  } else {
    console.log('   ✅ NODE_ENV: production');
  }

  // Verificar CORS
  console.log('\n🔒 Configuración de seguridad:');
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin && corsOrigin.includes('*')) {
    errors.push('❌ CORS_ORIGIN contiene wildcard, no seguro para producción');
    console.log('   ❌ CORS_ORIGIN: Contiene wildcard (no seguro)');
  } else if (corsOrigin && corsOrigin.startsWith('https://')) {
    console.log(`   ✅ CORS_ORIGIN: ${corsOrigin} (HTTPS)`);
  } else if (corsOrigin) {
    warnings.push('⚠️  CORS_ORIGIN no usa HTTPS');
    console.log(`   ⚠️  CORS_ORIGIN: ${corsOrigin} (debería usar HTTPS)`);
  }

  // Verificar conexión a base de datos
  console.log('\n🗄️  Conexión a base de datos:');
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('   ✅ Conexión a Supabase establecida');
    } else {
      errors.push('❌ No se pudo conectar a la base de datos');
      console.log('   ❌ No se pudo conectar a la base de datos');
    }
  } catch (error) {
    errors.push(`❌ Error de conexión: ${error.message}`);
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Verificar Supabase Auth
  console.log('\n🔐 Supabase Auth:');
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Intentar una operación simple
      const { data, error } = await supabase.auth.getSession();
      if (error && error.message.includes('Invalid API key')) {
        errors.push('❌ SUPABASE_ANON_KEY inválida');
        console.log('   ❌ SUPABASE_ANON_KEY inválida');
      } else {
        console.log('   ✅ Supabase Auth configurado correctamente');
      }
    } else {
      errors.push('❌ Variables de Supabase no configuradas');
      console.log('   ❌ Variables de Supabase no configuradas');
    }
  } catch (error) {
    warnings.push(`⚠️  Error verificando Supabase: ${error.message}`);
    console.log(`   ⚠️  Error: ${error.message}`);
  }

  // Verificar puerto
  console.log('\n🚪 Puerto:');
  const port = process.env.PORT || 5000;
  if (port === '5000' && process.env.NODE_ENV === 'production') {
    warnings.push('⚠️  Puerto por defecto (5000) en producción');
    console.log('   ⚠️  Puerto: 5000 (considera usar variable PORT)');
  } else {
    console.log(`   ✅ Puerto: ${port}`);
  }

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE VERIFICACIÓN\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ ¡Todo correcto! Listo para producción.\n');
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log('❌ ERRORES CRÍTICOS (deben corregirse):');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  ADVERTENCIAS (recomendado corregir):');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ La verificación falló. Corrige los errores antes de desplegar.\n');
    process.exit(1);
  } else {
    console.log('⚠️  La verificación pasó con advertencias. Revisa las recomendaciones.\n');
    process.exit(0);
  }
}

// Ejecutar verificación
verifyEnvironment().catch((error) => {
  console.error('❌ Error durante la verificación:', error);
  process.exit(1);
});

