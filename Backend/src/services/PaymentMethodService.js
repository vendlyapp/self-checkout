const { query } = require('../../lib/database');

class PaymentMethodService {

  /**
   * Obtiene todos los métodos de pago de un store
   * @param {string} storeId - ID del store
   * @param {Object} options - Opciones de consulta
   * @param {boolean} options.activeOnly - Si es true, solo retorna métodos activos
   * @returns {Promise<Object>} Lista de métodos de pago
   */
  async findByStoreId(storeId, options = {}) {
    if (!storeId || !storeId.trim()) {
      throw new Error('El ID del store es requerido');
    }

    const { activeOnly = false } = options;
    
    let selectQuery = `
      SELECT * FROM "PaymentMethod"
      WHERE "storeId" = $1
    `;
    
    const params = [storeId];
    
    if (activeOnly) {
      selectQuery += ' AND "isActive" = $2';
      params.push(true);
    }
    
    selectQuery += ' ORDER BY "sortOrder" ASC, "createdAt" ASC';
    
    const result = await query(selectQuery, params);
    const methods = result.rows;

    return {
      success: true,
      data: methods,
      count: methods.length
    };
  }

  /**
   * Obtiene un método de pago por ID
   * @param {string} id - ID del método de pago
   * @returns {Promise<Object>} Método de pago
   */
  async findById(id) {
    if (!id || !id.trim()) {
      throw new Error('El ID del método de pago es requerido');
    }

    const selectQuery = 'SELECT * FROM "PaymentMethod" WHERE id = $1';
    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Método de pago no encontrado');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  /**
   * Crea un nuevo método de pago
   * @param {Object} methodData - Datos del método de pago
   * @param {string} methodData.storeId - ID del store
   * @param {string} methodData.name - Nombre del método
   * @param {string} methodData.displayName - Nombre para mostrar
   * @param {string} methodData.code - Código único del método
   * @param {string} [methodData.icon] - Icono
   * @param {string} [methodData.bgColor] - Color de fondo
   * @param {string} [methodData.textColor] - Color del texto
   * @param {boolean} [methodData.isActive] - Si está activo
   * @param {number} [methodData.sortOrder] - Orden de clasificación
   * @returns {Promise<Object>} Método de pago creado
   */
  async create(methodData) {
    // Validaciones
    if (!methodData.storeId || !methodData.storeId.trim()) {
      throw new Error('El ID del store es requerido');
    }

    if (!methodData.name || !methodData.name.trim()) {
      throw new Error('El nombre del método de pago es requerido');
    }

    if (!methodData.displayName || !methodData.displayName.trim()) {
      throw new Error('El nombre para mostrar es requerido');
    }

    if (!methodData.code || !methodData.code.trim()) {
      throw new Error('El código del método de pago es requerido');
    }

    // Verificar que el store existe
    const storeResult = await query('SELECT id FROM "Store" WHERE id = $1', [methodData.storeId.trim()]);
    if (storeResult.rows.length === 0) {
      throw new Error('Store no encontrado');
    }

    // Verificar que el código no esté duplicado para este store
    const existingMethod = await query(
      'SELECT id FROM "PaymentMethod" WHERE "storeId" = $1 AND code = $2',
      [methodData.storeId.trim(), methodData.code.trim()]
    );

    if (existingMethod.rows.length > 0) {
      throw new Error('Ya existe un método de pago con ese código para este store');
    }

    // Si no se proporciona sortOrder, obtener el siguiente valor
    let sortOrder = methodData.sortOrder;
    if (sortOrder === undefined || sortOrder === null) {
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX("sortOrder"), 0) + 1 as next_order FROM "PaymentMethod" WHERE "storeId" = $1',
        [methodData.storeId.trim()]
      );
      sortOrder = parseInt(maxOrderResult.rows[0].next_order) || 1;
    }

    const insertQuery = `
      INSERT INTO "PaymentMethod" 
      ("storeId", name, "displayName", code, icon, "bgColor", "textColor", "isActive", "sortOrder")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      methodData.storeId.trim(),
      methodData.name.trim(),
      methodData.displayName.trim(),
      methodData.code.trim(),
      methodData.icon?.trim() || null,
      methodData.bgColor?.trim() || null,
      methodData.textColor?.trim() || null,
      methodData.isActive !== undefined ? Boolean(methodData.isActive) : true,
      sortOrder
    ]);

    const method = result.rows[0];

    return {
      success: true,
      data: method,
      message: 'Método de pago creado exitosamente'
    };
  }

  /**
   * Actualiza un método de pago existente
   * @param {string} id - ID del método de pago
   * @param {Object} methodData - Datos a actualizar
   * @returns {Promise<Object>} Método de pago actualizado
   */
  async update(id, methodData) {
    // Verificar que el método existe
    const existingMethod = await this.findById(id);
    if (!existingMethod.success) {
      throw new Error('Método de pago no encontrado');
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const updatableFields = ['name', 'displayName', 'code', 'icon', 'bgColor', 'textColor', 'isActive', 'sortOrder'];

    // Si se actualiza el código, verificar que no esté duplicado
    if (methodData.code !== undefined && methodData.code.trim() !== existingMethod.data.code) {
      const duplicateCheck = await query(
        'SELECT id FROM "PaymentMethod" WHERE "storeId" = $1 AND code = $2 AND id != $3',
        [existingMethod.data.storeId, methodData.code.trim(), id]
      );
      if (duplicateCheck.rows.length > 0) {
        throw new Error('Ya existe un método de pago con ese código para este store');
      }
    }

    for (const field of updatableFields) {
      if (methodData[field] !== undefined) {
        paramCount++;
        updateFields.push(`"${field}" = $${paramCount}`);

        // Procesar valores según el tipo
        let value = methodData[field];
        if (field === 'sortOrder') {
          value = parseInt(value);
        } else if (field === 'isActive') {
          value = Boolean(value);
        } else if (typeof value === 'string') {
          value = value.trim();
        }

        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar ID como último parámetro
    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE "PaymentMethod"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const method = result.rows[0];

    return {
      success: true,
      data: method,
      message: 'Método de pago actualizado exitosamente'
    };
  }

  /**
   * Elimina un método de pago
   * @param {string} id - ID del método de pago
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async delete(id) {
    // Verificar que el método existe
    const existingMethod = await this.findById(id);
    if (!existingMethod.success) {
      throw new Error('Método de pago no encontrado');
    }

    const deleteQuery = 'DELETE FROM "PaymentMethod" WHERE id = $1';
    await query(deleteQuery, [id]);

    return {
      success: true,
      message: 'Método de pago eliminado exitosamente'
    };
  }

  /**
   * Verifica que el usuario sea el propietario del store
   * @param {string} storeId - ID del store
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>} True si es el propietario
   */
  async verifyStoreOwner(storeId, userId) {
    const storeResult = await query('SELECT "ownerId" FROM "Store" WHERE id = $1', [storeId]);
    
    if (storeResult.rows.length === 0) {
      throw new Error('Store no encontrado');
    }
    
    return storeResult.rows[0].ownerId === userId;
  }
}

module.exports = new PaymentMethodService();

