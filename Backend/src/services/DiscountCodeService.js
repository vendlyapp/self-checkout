const { query } = require('../../lib/database');

class DiscountCodeService {
  /**
   * Calcula el estado de un código basado en fechas y redemptions
   * @param {Object} code - Código de descuento
   * @returns {string} - 'active', 'inactive' o 'archived'
   */
  calculateStatus(code) {
    // Si está archivado, retornar archived
    if (code.archived) {
      return 'archived';
    }
    
    const now = new Date();
    const validFrom = new Date(code.valid_from);
    const validUntil = code.valid_until ? new Date(code.valid_until) : null;
    
    // Si no está activo manualmente, está inactivo
    if (!code.is_active) {
      return 'inactive';
    }
    
    // Si la fecha de inicio aún no ha llegado
    if (validFrom > now) {
      return 'inactive';
    }
    
    // Si tiene fecha de caducidad y ya pasó
    if (validUntil && validUntil < now) {
      return 'inactive';
    }
    
    // Si alcanzó el máximo de redenciones
    if (code.current_redemptions >= code.max_redemptions) {
      return 'inactive';
    }
    
    return 'active';
  }

  /**
   * Obtiene todos los códigos de descuento de un usuario (excluyendo archivados)
   * @param {string} ownerId - ID del propietario
   * @param {boolean} includeArchived - Si incluir archivados
   * @returns {Promise<Object>}
   */
  async findAll(ownerId, includeArchived = false) {
    const selectQuery = `
      SELECT 
        id,
        code,
        discount_type,
        discount_value,
        max_redemptions,
        current_redemptions,
        valid_from,
        valid_until,
        is_active,
        archived,
        created_at,
        updated_at
      FROM "DiscountCode"
      WHERE owner_id = $1 ${includeArchived ? '' : 'AND archived = false'}
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery, [ownerId]);
    const codes = result.rows.map(code => ({
      ...code,
      status: this.calculateStatus(code)
    }));

    return {
      success: true,
      data: codes,
      count: codes.length
    };
  }

  /**
   * Obtiene todos los códigos archivados de un usuario
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async findArchived(ownerId) {
    const selectQuery = `
      SELECT 
        id,
        code,
        discount_type,
        discount_value,
        max_redemptions,
        current_redemptions,
        valid_from,
        valid_until,
        is_active,
        archived,
        created_at,
        updated_at
      FROM "DiscountCode"
      WHERE owner_id = $1 AND archived = true
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery, [ownerId]);
    const codes = result.rows.map(code => ({
      ...code,
      status: this.calculateStatus(code)
    }));

    return {
      success: true,
      data: codes,
      count: codes.length
    };
  }

  /**
   * Obtiene un código por ID
   * @param {string} id - ID del código
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async findById(id, ownerId) {
    const selectQuery = `
      SELECT 
        id,
        code,
        discount_type,
        discount_value,
        max_redemptions,
        current_redemptions,
        valid_from,
        valid_until,
        is_active,
        archived,
        created_at,
        updated_at
      FROM "DiscountCode"
      WHERE id = $1 AND owner_id = $2
    `;
    
    const result = await query(selectQuery, [id, ownerId]);

    if (result.rows.length === 0) {
      throw new Error('Código de descuento no encontrado');
    }

    const code = result.rows[0];
    return {
      success: true,
      data: {
        ...code,
        status: this.calculateStatus(code)
      }
    };
  }

  /**
   * Busca un código por su código (string)
   * @param {string} code - Código a buscar
   * @returns {Promise<Object>}
   */
  async findByCode(code) {
    const selectQuery = `
      SELECT 
        id,
        code,
        discount_type,
        discount_value,
        max_redemptions,
        current_redemptions,
        valid_from,
        valid_until,
        is_active,
        archived,
        created_at,
        updated_at
      FROM "DiscountCode"
      WHERE code = $1 AND archived = false
    `;
    
    const result = await query(selectQuery, [code.toUpperCase()]);

    if (result.rows.length === 0) {
      throw new Error('Código de descuento no encontrado');
    }

    const discountCode = result.rows[0];
    const status = this.calculateStatus(discountCode);
    
    if (status !== 'active') {
      throw new Error('El código de descuento no está activo o ha expirado');
    }

    return {
      success: true,
      data: {
        ...discountCode,
        status
      }
    };
  }

  /**
   * Crea un nuevo código de descuento
   * @param {Object} codeData - Datos del código
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async create(codeData, ownerId) {
    // Validaciones
    if (!codeData.code || !codeData.code.trim()) {
      throw new Error('El código es requerido');
    }

    if (!codeData.discountType || !['percentage', 'fixed'].includes(codeData.discountType)) {
      throw new Error('El tipo de descuento debe ser "percentage" o "fixed"');
    }

    if (!codeData.discountValue || codeData.discountValue <= 0) {
      throw new Error('El valor del descuento debe ser mayor a 0');
    }

    if (codeData.discountType === 'percentage' && codeData.discountValue > 100) {
      throw new Error('El porcentaje de descuento no puede ser mayor a 100');
    }

    if (!codeData.maxRedemptions || codeData.maxRedemptions <= 0) {
      throw new Error('El máximo de redenciones debe ser mayor a 0');
    }

    if (!codeData.validFrom) {
      throw new Error('La fecha de inicio es requerida');
    }

    // Verificar que el código no exista
    const existingCode = await query(
      'SELECT id FROM "DiscountCode" WHERE code = $1',
      [codeData.code.trim().toUpperCase()]
    );

    if (existingCode.rows.length > 0) {
      throw new Error('Ya existe un código con ese nombre');
    }

    // Validar fechas
    const validFrom = new Date(codeData.validFrom);
    const validUntil = codeData.validUntil ? new Date(codeData.validUntil) : null;

    if (validUntil && validUntil <= validFrom) {
      throw new Error('La fecha de caducidad debe ser posterior a la fecha de inicio');
    }

    const insertQuery = `
      INSERT INTO "DiscountCode" (
        code,
        discount_type,
        discount_value,
        max_redemptions,
        current_redemptions,
        valid_from,
        valid_until,
        is_active,
        owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    // Redondear porcentajes a números enteros
    const discountValue = codeData.discountType === 'percentage' 
      ? Math.round(codeData.discountValue)
      : codeData.discountValue;

    const result = await query(insertQuery, [
      codeData.code.trim().toUpperCase(),
      codeData.discountType,
      discountValue,
      codeData.maxRedemptions,
      0, // current_redemptions inicia en 0
      validFrom.toISOString(),
      validUntil ? validUntil.toISOString() : null,
      codeData.isActive !== undefined ? codeData.isActive : true,
      ownerId
    ]);

    const newCode = result.rows[0];
    return {
      success: true,
      data: {
        ...newCode,
        status: this.calculateStatus(newCode)
      },
      message: 'Código de descuento creado exitosamente'
    };
  }

  /**
   * Actualiza un código de descuento
   * @param {string} id - ID del código
   * @param {Object} codeData - Datos a actualizar
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async update(id, codeData, ownerId) {
    // Verificar que el código existe y pertenece al usuario
    const existing = await query(
      'SELECT * FROM "DiscountCode" WHERE id = $1 AND owner_id = $2',
      [id, ownerId]
    );

    if (existing.rows.length === 0) {
      throw new Error('Código de descuento no encontrado');
    }

    const currentCode = existing.rows[0];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Construir query dinámicamente
    if (codeData.code !== undefined) {
      // Verificar que el nuevo código no exista (excepto el actual)
      const codeCheck = await query(
        'SELECT id FROM "DiscountCode" WHERE code = $1 AND id != $2',
        [codeData.code.trim().toUpperCase(), id]
      );

      if (codeCheck.rows.length > 0) {
        throw new Error('Ya existe otro código con ese nombre');
      }

      updates.push(`code = $${paramIndex++}`);
      values.push(codeData.code.trim().toUpperCase());
    }

    if (codeData.discountType !== undefined) {
      if (!['percentage', 'fixed'].includes(codeData.discountType)) {
        throw new Error('El tipo de descuento debe ser "percentage" o "fixed"');
      }
      updates.push(`discount_type = $${paramIndex++}`);
      values.push(codeData.discountType);
    }

    if (codeData.discountValue !== undefined) {
      if (codeData.discountValue <= 0) {
        throw new Error('El valor del descuento debe ser mayor a 0');
      }
      if (codeData.discountType === 'percentage' && codeData.discountValue > 100) {
        throw new Error('El porcentaje de descuento no puede ser mayor a 100');
      }
      // Redondear porcentajes a números enteros
      const discountValue = codeData.discountType === 'percentage' 
        ? Math.round(codeData.discountValue)
        : codeData.discountValue;
      updates.push(`discount_value = $${paramIndex++}`);
      values.push(discountValue);
    }

    if (codeData.maxRedemptions !== undefined) {
      if (codeData.maxRedemptions <= 0) {
        throw new Error('El máximo de redenciones debe ser mayor a 0');
      }
      if (codeData.maxRedemptions < currentCode.current_redemptions) {
        throw new Error('El máximo de redenciones no puede ser menor al número actual de redenciones');
      }
      updates.push(`max_redemptions = $${paramIndex++}`);
      values.push(codeData.maxRedemptions);
    }

    if (codeData.validFrom !== undefined) {
      updates.push(`valid_from = $${paramIndex++}`);
      values.push(new Date(codeData.validFrom).toISOString());
    }

    if (codeData.validUntil !== undefined) {
      const validUntil = codeData.validUntil ? new Date(codeData.validUntil).toISOString() : null;
      const validFrom = codeData.validFrom ? new Date(codeData.validFrom) : new Date(currentCode.valid_from);
      
      if (validUntil && validUntil <= validFrom.toISOString()) {
        throw new Error('La fecha de caducidad debe ser posterior a la fecha de inicio');
      }
      
      updates.push(`valid_until = $${paramIndex++}`);
      values.push(validUntil);
    }

    if (codeData.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(codeData.isActive);
    }

    if (updates.length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    values.push(id, ownerId);
    const updateQuery = `
      UPDATE "DiscountCode"
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex++} AND owner_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const updatedCode = result.rows[0];

    return {
      success: true,
      data: {
        ...updatedCode,
        status: this.calculateStatus(updatedCode)
      },
      message: 'Código de descuento actualizado exitosamente'
    };
  }

  /**
   * Archiva un código de descuento (en lugar de eliminarlo)
   * @param {string} id - ID del código
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async archive(id, ownerId) {
    const archiveQuery = `
      UPDATE "DiscountCode"
      SET archived = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND owner_id = $2
      RETURNING *
    `;

    const result = await query(archiveQuery, [id, ownerId]);

    if (result.rows.length === 0) {
      throw new Error('Código de descuento no encontrado');
    }

    const archivedCode = result.rows[0];
    return {
      success: true,
      data: {
        ...archivedCode,
        status: this.calculateStatus(archivedCode)
      },
      message: 'Código de descuento archivado exitosamente'
    };
  }

  /**
   * Elimina un código de descuento (solo para casos especiales)
   * @param {string} id - ID del código
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async delete(id, ownerId) {
    const deleteQuery = `
      DELETE FROM "DiscountCode"
      WHERE id = $1 AND owner_id = $2
      RETURNING id
    `;

    const result = await query(deleteQuery, [id, ownerId]);

    if (result.rows.length === 0) {
      throw new Error('Código de descuento no encontrado');
    }

    return {
      success: true,
      message: 'Código de descuento eliminado exitosamente'
    };
  }

  /**
   * Incrementa el contador de redenciones
   * @param {string} code - Código de descuento
   * @returns {Promise<Object>}
   */
  async incrementRedemptions(code) {
    const updateQuery = `
      UPDATE "DiscountCode"
      SET current_redemptions = current_redemptions + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE code = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [code.toUpperCase()]);

    if (result.rows.length === 0) {
      throw new Error('Código de descuento no encontrado');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  /**
   * Obtiene estadísticas de códigos de descuento
   * @param {string} ownerId - ID del propietario
   * @returns {Promise<Object>}
   */
  async getStats(ownerId) {
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE archived = false) as total,
        COUNT(*) FILTER (WHERE archived = false AND is_active = true AND 
                         valid_from <= CURRENT_TIMESTAMP AND
                         (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP) AND
                         current_redemptions < max_redemptions) as active,
        COUNT(*) FILTER (WHERE archived = false AND (is_active = false OR
                         valid_from > CURRENT_TIMESTAMP OR
                         (valid_until IS NOT NULL AND valid_until < CURRENT_TIMESTAMP) OR
                         current_redemptions >= max_redemptions)) as inactive,
        COUNT(*) FILTER (WHERE archived = true) as archived
      FROM "DiscountCode"
      WHERE owner_id = $1
    `;

    const result = await query(statsQuery, [ownerId]);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        inactive: parseInt(stats.inactive) || 0,
        archived: parseInt(stats.archived) || 0
      }
    };
  }
}

module.exports = new DiscountCodeService();

