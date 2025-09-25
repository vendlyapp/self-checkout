const { query } = require('../../lib/database');
const bcrypt = require('bcrypt');

class UserService {

  async create(userData) {
    // Validaciones
    if (!userData.email || !userData.email.trim()) {
      throw new Error('El email es requerido');
    }

    if (!userData.password || !userData.password.trim()) {
      throw new Error('La contraseña es requerida');
    }

    if (!userData.name || !userData.name.trim()) {
      throw new Error('El nombre es requerido');
    }

    // Verificar email único
    const existingUser = await query('SELECT id FROM "User" WHERE email = $1', [userData.email.trim()]);
    if (existingUser.rows.length > 0) {
      throw new Error('El email ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insertar usuario
    const insertQuery = `
      INSERT INTO "User" (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, "createdAt", "updatedAt"
    `;

    const result = await query(insertQuery, [
      userData.email.trim(),
      hashedPassword,
      userData.name.trim(),
      userData.role || 'CUSTOMER'
    ]);

    const user = result.rows[0];

    return {
      success: true,
      data: user,
      message: 'Usuario creado exitosamente'
    };
  }

  async findAll(options = {}) {
    const { limit = 50, offset = 0 } = options;

    const selectQuery = `
      SELECT id, email, name, role, "createdAt", "updatedAt"
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(selectQuery, [limit, offset]);
    const users = result.rows;

    // Contar total
    const countResult = await query('SELECT COUNT(*) FROM "User"');
    const total = parseInt(countResult.rows[0].count);

    return {
      success: true,
      data: users,
      count: users.length,
      total: total
    };
  }

  async findById(id) {
    const selectQuery = `
      SELECT id, email, name, role, "createdAt", "updatedAt"
      FROM "User"
      WHERE id = $1
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  async findByEmail(email) {
    const selectQuery = `
      SELECT id, email, name, role, password, "createdAt", "updatedAt"
      FROM "User"
      WHERE email = $1
    `;

    const result = await query(selectQuery, [email]);

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  async update(id, userData) {
    // Verificar que el usuario existe
    const existingUser = await this.findById(id);
    if (!existingUser.success) {
      throw new Error('Usuario no encontrado');
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const updatableFields = ['email', 'name', 'role'];

    for (const field of updatableFields) {
      if (userData[field] !== undefined) {
        paramCount++;
        updateFields.push(`"${field}" = $${paramCount}`);
        values.push(userData[field].trim());
      }
    }

    // Si se actualiza la contraseña
    if (userData.password) {
      paramCount++;
      updateFields.push(`password = $${paramCount}`);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      values.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar ID como último parámetro
    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE "User"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, "createdAt", "updatedAt"
    `;

    const result = await query(updateQuery, values);
    const user = result.rows[0];

    return {
      success: true,
      data: user,
      message: 'Usuario actualizado exitosamente'
    };
  }

  async delete(id) {
    // Verificar que el usuario existe
    const existingUser = await this.findById(id);
    if (!existingUser.success) {
      throw new Error('Usuario no encontrado');
    }

    const deleteQuery = 'DELETE FROM "User" WHERE id = $1';
    await query(deleteQuery, [id]);

    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
  }

  async getStats() {
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'ADMIN') as admins,
        COUNT(*) FILTER (WHERE role = 'CUSTOMER') as customers,
        COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as newUsers
      FROM "User"
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        total: parseInt(stats.total),
        admins: parseInt(stats.admins),
        customers: parseInt(stats.customers),
        newUsers: parseInt(stats.newusers)
      }
    };
  }

  async createAdmin(userData) {
    // Validaciones
    if (!userData.email || !userData.email.trim()) {
      throw new Error('El email es requerido');
    }

    if (!userData.password || !userData.password.trim()) {
      throw new Error('La contraseña es requerida');
    }

    if (!userData.name || !userData.name.trim()) {
      throw new Error('El nombre es requerido');
    }

    // Verificar email único
    const existingUser = await query('SELECT id FROM "User" WHERE email = $1', [userData.email.trim()]);
    if (existingUser.rows.length > 0) {
      throw new Error('El email ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insertar usuario como ADMIN
    const insertQuery = `
      INSERT INTO "User" (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, "createdAt", "updatedAt"
    `;

    const result = await query(insertQuery, [
      userData.email.trim(),
      hashedPassword,
      userData.name.trim(),
      'ADMIN'
    ]);

    const user = result.rows[0];

    return {
      success: true,
      data: user,
      message: 'Administrador creado exitosamente'
    };
  }

  async validatePassword(email, password) {
    try {
      const user = await this.findByEmail(email);
      const isValid = await bcrypt.compare(password, user.data.password);

      if (isValid) {
        return {
          success: true,
          data: {
            id: user.data.id,
            email: user.data.email,
            name: user.data.name,
            role: user.data.role
          }
        };
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  }
}

module.exports = new UserService();
