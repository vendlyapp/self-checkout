require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function resetSuperAdminPassword() {
  try {
    console.log('\n🔐 Reseteando contraseña del Super Admin...\n');

    const email = 'admin@vendly.co';
    const newPassword = 'SuperAdmin123!';

    // Crear cliente admin de Supabase
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}\n`);

    // Actualizar contraseña usando admin
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      '370619a9-d1b4-4ade-ae74-2c67b2e6454c', // ID del usuario
      {
        password: newPassword,
        email_confirm: true // Confirmar email también
      }
    );

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('============================================================');
    console.log('🎉 CONTRASEÑA ACTUALIZADA EXITOSAMENTE');
    console.log('============================================================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${newPassword}`);
    console.log('============================================================\n');
    console.log('✅ Ahora puedes hacer login con estas credenciales\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

resetSuperAdminPassword();

