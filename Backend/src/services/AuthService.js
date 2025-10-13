const { supabase } = require('../../lib/supabase');
const { query } = require('../../lib/database');

class AuthService {
  /**
   * Registrar un nuevo usuario usando Supabase Auth
   */
  async register(userData) {
    const { email, password, name, role = 'ADMIN' } = userData;

    try {
      // Validar datos requeridos
      if (!email || !password || !name) {
        throw new Error('Email, password y nombre son requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
      }

      // Validar longitud de password
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Error al crear el usuario');
      }

      // Insertar información adicional en la tabla User
      try {
        await query(
          `INSERT INTO "User" (id, email, name, role, password) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO UPDATE SET name = $3, role = $4`,
          [authData.user.id, email, name, role, 'supabase-auth'] // Password manejado por Supabase
        );
      } catch (dbError) {
        console.error('Error al guardar en tabla User:', dbError.message);
        // Continuar aunque falle, el usuario ya está en Auth
      }

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
            name,
            role,
            emailConfirmed: authData.user.email_confirmed_at ? true : false
          },
          session: authData.session,
          needsEmailConfirmation: !authData.session // Si no hay sesión, necesita confirmar email
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login usando Supabase Auth
   */
  async login(credentials) {
    const { email, password } = credentials;

    try {
      // Validar datos requeridos
      if (!email || !password) {
        throw new Error('Email y password son requeridos');
      }

      // Login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error('Credenciales inválidas');
      }

      if (!data.user || !data.session) {
        throw new Error('Error al iniciar sesión');
      }

      // Obtener información adicional de la tabla User
      let userRole = 'CUSTOMER';
      let userName = data.user.email;

      try {
        const userResult = await query(
          'SELECT name, role FROM "User" WHERE id = $1',
          [data.user.id]
        );

        if (userResult.rows.length > 0) {
          userName = userResult.rows[0].name;
          userRole = userResult.rows[0].role;
        }
      } catch (dbError) {
        console.error('Error al obtener datos del usuario:', dbError.message);
      }

      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: userName,
            role: userRole,
            emailConfirmed: data.user.email_confirmed_at ? true : false
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar token de Supabase
   */
  async verifyToken(token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Verificar token con Supabase
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new Error('Token inválido o expirado');
      }

      // Obtener información adicional
      let userRole = 'CUSTOMER';
      let userName = data.user.email;

      try {
        const userResult = await query(
          'SELECT name, role FROM "User" WHERE id = $1',
          [data.user.id]
        );

        if (userResult.rows.length > 0) {
          userName = userResult.rows[0].name;
          userRole = userResult.rows[0].role;
        }
      } catch (dbError) {
        console.error('Error al obtener datos del usuario:', dbError.message);
      }

      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: userName,
            role: userRole,
            emailConfirmed: data.user.email_confirmed_at ? true : false
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario
   */
  async getProfile(userId) {
    try {
      const result = await query(
        'SELECT id, email, name, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = result.rows[0];

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar contraseña usando Supabase Auth
   */
  async changePassword(token, newPassword) {
    try {
      // Validar nueva contraseña
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // Actualizar contraseña en Supabase Auth
      const { data, error } = await supabase.auth.updateUser(
        { password: newPassword },
        { access_token: token }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Error al actualizar la contraseña');
      }

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout usando Supabase Auth
   */
  async logout(token) {
    try {
      const { error } = await supabase.auth.admin.signOut(token);

      if (error) {
        console.error('Error al hacer logout:', error.message);
      }

      return {
        success: true,
        message: 'Logout exitoso'
      };
    } catch (error) {
      // El logout es best-effort, no fallar
      return {
        success: true,
        message: 'Logout exitoso'
      };
    }
  }

  /**
   * Solicitar reseteo de contraseña
   */
  async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Email de recuperación enviado'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
