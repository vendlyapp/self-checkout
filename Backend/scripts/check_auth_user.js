require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkAuthUser() {
  try {
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

    const email = 'admin@vendly.co';
    
    // Buscar usuario por email
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    const user = data.users.find(u => u.email === email);
    
    if (user) {
      console.log('\n✅ Usuario encontrado en Auth:');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Email confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
      console.log(`Creado: ${user.created_at}`);
      
      // Actualizar contraseña
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          password: 'SuperAdmin123!',
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.log('❌ Error actualizando:', updateError.message);
      } else {
        console.log('\n🎉 Contraseña actualizada: SuperAdmin123!');
      }
    } else {
      console.log('❌ Usuario no encontrado en Auth');
      console.log('\nUsuarios disponibles:');
      data.users.forEach(u => {
        console.log(`- ${u.email} (${u.id})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAuthUser();

