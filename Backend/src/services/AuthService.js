const { supabase } = require('../../lib/supabase');
const { query } = require('../../lib/database');
const storeService = require('./StoreService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class AuthService {
  /** Register a new user via Supabase Auth */
  async register(userData) {
    const { email, password, name, role = 'ADMIN' } = userData;

    if (!email || !password || !name) {
      throw new AppError('Email, password and name are required', 400, 'MISSING_FIELDS');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AppError(
        'Password must be at least 8 characters and include one uppercase letter and one number',
        400,
        'WEAK_PASSWORD'
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (authError) {
      throw new AppError(authError.message, 400, 'AUTH_SIGNUP_FAILED');
    }

    if (!authData.user) {
      throw new AppError('Failed to create user', 500, 'USER_CREATION_FAILED');
    }

    // Insert into local User table
    try {
      await query(
        `INSERT INTO "User" (id, email, name, role, password)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name = $3, role = $4`,
        [authData.user.id, email, name, role, 'supabase-auth']
      );

      if (role === 'ADMIN') {
        await storeService.create(authData.user.id, {
          name: `${name}'s Store`,
          logo: null,
        });
      }
    } catch (dbError) {
      logger.error('Failed to save user to local DB', { error: dbError.message });
      // Continue — user already exists in Auth
    }

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          role,
          emailConfirmed: !!authData.user.email_confirmed_at,
        },
        session: authData.session,
        needsEmailConfirmation: !authData.session,
      },
    };
  }

  /** Login via Supabase Auth */
  async login(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'MISSING_FIELDS');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!data.user || !data.session) {
      throw new AppError('Login failed', 500, 'LOGIN_FAILED');
    }

    // Get additional user info from local DB
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
      logger.error('Failed to fetch user data from DB', { error: dbError.message });
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: userRole,
          emailConfirmed: !!data.user.email_confirmed_at,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
        },
      },
    };
  }

  /** Verify a Supabase token */
  async verifyToken(token) {
    if (!token) {
      throw new AppError('Token not provided', 401, 'MISSING_TOKEN');
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }

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
      logger.error('Failed to fetch user data during token verification', { error: dbError.message });
    }

    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userName,
          role: userRole,
          emailConfirmed: !!data.user.email_confirmed_at,
        },
      },
    };
  }

  /** Get user profile from local DB */
  async getProfile(userId) {
    const result = await query(
      'SELECT id, email, name, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
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
          updatedAt: user.updatedAt,
        },
      },
    };
  }

  /** Change password via Supabase Auth */
  async changePassword(token, newPassword) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!newPassword || !passwordRegex.test(newPassword)) {
      throw new AppError(
        'New password must be at least 8 characters and include one uppercase letter and one number',
        400,
        'WEAK_PASSWORD'
      );
    }

    const { data, error } = await supabase.auth.updateUser(
      { password: newPassword },
      { access_token: token }
    );

    if (error) {
      throw new AppError(error.message, 400, 'PASSWORD_UPDATE_FAILED');
    }

    if (!data.user) {
      throw new AppError('Failed to update password', 500, 'PASSWORD_UPDATE_FAILED');
    }

    return { success: true, message: 'Password updated successfully' };
  }

  /** Logout (best-effort, never fails) */
  async logout(token) {
    try {
      const { error } = await supabase.auth.admin.signOut(token);
      if (error) {
        logger.error('Logout error', { error: error.message });
      }
    } catch (_) {
      // Best-effort — always succeed
    }

    return { success: true, message: 'Logout successful' };
  }

  /** Request password reset email */
  async requestPasswordReset(email) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app';
    // Always return the same generic message regardless of whether the email
    // exists — prevents user enumeration via timing or response differences.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/reset-password`,
    });

    return { success: true, message: 'If that email is registered, you will receive a reset link shortly' };
  }
}

module.exports = new AuthService();
