// lib/supabase.js - Cliente de Supabase para Auth
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validar que existan las variables de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Advertencia: SUPABASE_URL o SUPABASE_ANON_KEY no configurados');
}

// Crear cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // En backend no necesitamos persistir sesiones
      detectSessionInUrl: false
    }
  }
);

// Función para verificar la conexión
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('User').select('count').limit(1);
    
    if (error) {
      console.warn('⚠️  Supabase Auth disponible pero sin acceso a tabla User:', error.message);
    } else {
      console.log('✅ Supabase Auth conectado correctamente');
    }
    return true;
  } catch (error) {
    console.error('❌ Error conectando con Supabase:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  testSupabaseConnection
};

