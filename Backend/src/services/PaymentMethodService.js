const { query } = require('../../lib/database');
const globalPaymentMethodConfigService = require('./GlobalPaymentMethodConfigService');

class PaymentMethodService {

  /**
   * Asegura que el método Bargeld (efectivo) exista para la tienda. Si no existe, lo crea.
   * Así las tiendas creadas antes de tener creación automática de Bargeld lo tendrán al abrir métodos de pago.
   * @param {string} storeId - ID del store
   */
  async ensureBargeldExistsForStore(storeId) {
    const existing = await query(
      'SELECT id FROM "PaymentMethod" WHERE "storeId" = $1 AND LOWER(code) = $2',
      [storeId.trim(), 'bargeld']
    );
    if (existing.rows.length > 0) return;
    try {
      await this.create({
        storeId: storeId.trim(),
        name: 'Bargeld',
        displayName: 'Bargeld',
        code: 'bargeld',
        icon: 'Coins',
        bgColor: '#766B6A',
        textColor: '#FFFFFF',
        sortOrder: 1,
        isActive: true
      });
    } catch (err) {
      if (!err.message || !err.message.includes('existiert bereits')) {
        console.warn('[PaymentMethodService] ensureBargeldExistsForStore:', err.message);
      }
    }
  }

  /**
   * Obtiene todos los métodos de pago de un store
   * @param {string} storeId - ID del store
   * @param {Object} options - Opciones de consulta
   * @param {boolean} options.activeOnly - Si es true, solo retorna métodos activos
   * @returns {Promise<Object>} Lista de métodos de pago
   */
  async findByStoreId(storeId, options = {}) {
    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }

    await this.ensureBargeldExistsForStore(storeId);

    const { activeOnly = false } = options;
    
    let selectQuery = `
      SELECT * FROM "PaymentMethod"
      WHERE "storeId" = $1
    `;
    
    const params = [storeId];
    
    if (activeOnly) {
      // Solo métodos activos Y que tengan configuración (config no nulo y no vacío)
      // EXCEPCIÓN: Bargeld (efectivo) siempre está activo, no requiere configuración
      // EXCLUIR métodos inhabilitados por super admin (disabledBySuperAdmin = false)
      // Verificar que config no sea null, que sea un objeto, y que no esté vacío
      // O que sea Bargeld (que siempre está activo y siempre se muestra)
      params.push(true); // $2
      selectQuery += ` AND (
                         ("isActive" = $2 AND config IS NOT NULL AND jsonb_typeof(config) = 'object' AND config != '{}'::jsonb)
                         OR (LOWER(code) = 'bargeld' AND "isActive" = $2)
                       )
                       AND ("disabledBySuperAdmin" = false OR "disabledBySuperAdmin" IS NULL)`;
    }
    // Si activeOnly=false, NO filtrar métodos inhabilitados
    // Esto permite que el super admin vea TODOS los métodos, incluyendo los inhabilitados
    // El frontend se encargará de filtrarlos según el contexto (admin vs super admin)
    
    selectQuery += ' ORDER BY "sortOrder" ASC, "createdAt" ASC';
    
    // Debug: Verificar que los parámetros coincidan con los placeholders
    const paramPlaceholders = selectQuery.match(/\$(\d+)/g) || [];
    const maxParamNumber = paramPlaceholders.length > 0 
      ? Math.max(...paramPlaceholders.map(p => parseInt(p.replace('$', ''))))
      : 0;
    
    if (maxParamNumber > params.length) {
      console.error('[PaymentMethodService.findByStoreId] Error: Query requiere más parámetros de los proporcionados');
      console.error('Query completa:', selectQuery);
      console.error('Params requeridos:', maxParamNumber);
      console.error('Params proporcionados:', params.length);
      console.error('Params:', params);
      console.error('activeOnly:', activeOnly);
      throw new Error(`Query requiere ${maxParamNumber} parámetros pero solo se proporcionaron ${params.length}`);
    }
    
    // Log para debugging
    if (activeOnly) {
      console.log('[PaymentMethodService.findByStoreId] Query con activeOnly=true:', selectQuery.substring(0, 200) + '...');
      console.log('[PaymentMethodService.findByStoreId] Params:', params);
    }
    
    const result = await query(selectQuery, params);
    let methods = result.rows;

    // Obtener códigos de métodos globalmente deshabilitados
    let disabledGlobalCodes = [];
    try {
      disabledGlobalCodes = await globalPaymentMethodConfigService.getDisabledCodes();
    } catch (error) {
      console.error('[PaymentMethodService.findByStoreId] Error verificando configuraciones globales:', error);
      // En caso de error, continuar sin filtrar (fail-safe)
    }

    // Si activeOnly=true, filtrar métodos deshabilitados globalmente (clientes no deben verlos)
    // Si activeOnly=false, NO filtrar pero marcar con disabledGlobally=true (admin debe verlos con info)
    if (activeOnly) {
      if (disabledGlobalCodes.length > 0) {
        const beforeCount = methods.length;
        methods = methods.filter(method => {
          const methodCode = method.code?.toLowerCase() || '';
          const isDisabled = disabledGlobalCodes.includes(methodCode);
          if (isDisabled) {
            console.log(`[PaymentMethodService] Filtrando método globalmente deshabilitado: ${method.code}`);
          }
          return !isDisabled;
        });
        const afterCount = methods.length;
        if (beforeCount !== afterCount) {
          console.log(`[PaymentMethodService] Filtrados ${beforeCount - afterCount} métodos globalmente deshabilitados`);
        }
      }
    } else {
      // Para activeOnly=false (admin de tienda), agregar campo disabledGlobally a cada método
      methods = methods.map(method => {
        const methodCode = method.code?.toLowerCase() || '';
        const isGloballyDisabled = disabledGlobalCodes.includes(methodCode);
        return {
          ...method,
          disabledGlobally: isGloballyDisabled
        };
      });
    }

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
      throw new Error('Zahlungsmethoden-ID ist erforderlich');
    }

    const selectQuery = 'SELECT * FROM "PaymentMethod" WHERE id = $1';
    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Zahlungsmethode nicht gefunden');
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
      throw new Error('Store-ID ist erforderlich');
    }

    if (!methodData.name || !methodData.name.trim()) {
      throw new Error('Name der Zahlungsmethode ist erforderlich');
    }

    if (!methodData.displayName || !methodData.displayName.trim()) {
      throw new Error('Anzeigename ist erforderlich');
    }

    if (!methodData.code || !methodData.code.trim()) {
      throw new Error('Code der Zahlungsmethode ist erforderlich');
    }

    // Verificar que el store existe
    const storeResult = await query('SELECT id FROM "Store" WHERE id = $1', [methodData.storeId.trim()]);
    if (storeResult.rows.length === 0) {
      throw new Error('Geschäft nicht gefunden');
    }

    // Verificar que el código no esté duplicado para este store
    const existingMethod = await query(
      'SELECT id FROM "PaymentMethod" WHERE "storeId" = $1 AND code = $2',
      [methodData.storeId.trim(), methodData.code.trim()]
    );

    if (existingMethod.rows.length > 0) {
      throw new Error('Es existiert bereits eine Zahlungsmethode mit diesem Code für dieses Geschäft');
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
      ("storeId", name, "displayName", code, icon, "bgColor", "textColor", "isActive", "sortOrder", config)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    // Procesar config si existe
    let configValue = null;
    if (methodData.config) {
      configValue = typeof methodData.config === 'string' ? JSON.parse(methodData.config) : methodData.config;
    }

    // Bargeld (efectivo) debe estar activo por defecto
    let isActive = methodData.isActive !== undefined ? Boolean(methodData.isActive) : true;
    if (methodData.code.trim().toLowerCase() === 'bargeld' && methodData.isActive === undefined) {
      isActive = true;
    }

    const result = await query(insertQuery, [
      methodData.storeId.trim(),
      methodData.name.trim(),
      methodData.displayName.trim(),
      methodData.code.trim(),
      methodData.icon?.trim() || null,
      methodData.bgColor?.trim() || null,
      methodData.textColor?.trim() || null,
      isActive,
      sortOrder,
      configValue ? JSON.stringify(configValue) : null
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
      throw new Error('Zahlungsmethode nicht gefunden');
    }

    // Verificar si la columna config existe en la tabla
    let configColumnExists = true;
    try {
      const columnCheck = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'PaymentMethod' 
        AND column_name = 'config'
      `);
      configColumnExists = columnCheck.rows.length > 0;
    } catch (error) {
      console.warn('No se pudo verificar la existencia de la columna config:', error);
      configColumnExists = false;
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    // El campo disabledBySuperAdmin solo puede ser actualizado por SUPER_ADMIN (se verifica en el controller)
    let updatableFields = ['name', 'displayName', 'code', 'icon', 'bgColor', 'textColor', 'isActive', 'sortOrder', 'disabledBySuperAdmin'];
    // Solo agregar config si la columna existe
    if (configColumnExists) {
      updatableFields.push('config');
    } else if (methodData.config !== undefined) {
      // Si se intenta actualizar config pero la columna no existe, ignorar
      console.warn('Se intentó actualizar config pero la columna no existe en la tabla');
    }

    // Si se actualiza el código, verificar que no esté duplicado
    if (methodData.code !== undefined && methodData.code.trim() !== existingMethod.data.code) {
      const duplicateCheck = await query(
        'SELECT id FROM "PaymentMethod" WHERE "storeId" = $1 AND code = $2 AND id != $3',
        [existingMethod.data.storeId, methodData.code.trim(), id]
      );
      if (duplicateCheck.rows.length > 0) {
        throw new Error('Es existiert bereits eine Zahlungsmethode mit diesem Code für dieses Geschäft');
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
          // El admin de la tienda puede activar/desactivar Bargeld si lo desea
        } else if (field === 'disabledBySuperAdmin') {
          value = Boolean(value);
          // Bargeld nunca puede ser inhabilitado por super admin
          if (existingMethod.success && existingMethod.data.code.toLowerCase() === 'bargeld' && value) {
            throw new Error('Bargeld (Bargeld) kann nicht vom Super-Admin deaktiviert werden');
          }
        } else if (field === 'config') {
          // Si es config, convertir a JSON string para PostgreSQL JSONB
          if (value === null || value === undefined) {
            value = null;
          } else if (typeof value === 'string') {
            // Si ya es string, validar que sea JSON válido, sino dejarlo como está
            try {
              JSON.parse(value);
            } catch {
              // Si no es JSON válido, convertirlo a objeto y luego a JSON string
              value = JSON.stringify(value);
            }
          } else {
            // Si es objeto, convertir a JSON string
            value = JSON.stringify(value);
          }
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

    // Construir query con cast JSONB para el campo config si existe
    const processedUpdateFields = updateFields.map((field, idx) => {
      if (field.includes('"config"')) {
        // Usar cast a JSONB para el campo config
        const paramNumber = idx + 1;
        const configValue = values[idx];
        // Si el valor es null, usar NULL directamente sin cast
        if (configValue === null || configValue === undefined) {
          return `"config" = NULL`;
        }
        // Si tiene valor, usar cast a JSONB
        return `"config" = $${paramNumber}::jsonb`;
      }
      return field;
    });

    // Construir valores finales: excluir nulls de config y mantener el orden
    const finalValues = [];
    const finalUpdateFields = [];
    let finalParamCount = 0;

    for (let i = 0; i < processedUpdateFields.length; i++) {
      const field = processedUpdateFields[i];
      const value = values[i];
      
      if (field.includes('"config"')) {
        const configValue = values[i];
        if (configValue === null || configValue === undefined) {
          // NULL directo, no necesita parámetro
          finalUpdateFields.push(`"config" = NULL`);
        } else {
          // Tiene valor, necesita parámetro
          finalParamCount++;
          finalUpdateFields.push(`"config" = $${finalParamCount}::jsonb`);
          finalValues.push(value);
        }
      } else {
        // Otro campo normal
        finalParamCount++;
        finalUpdateFields.push(field.replace(/\$\d+/, `$${finalParamCount}`));
        finalValues.push(value);
      }
    }

    // Agregar ID como último parámetro
    finalParamCount++;
    finalValues.push(id);

    const finalUpdateQuery = `
      UPDATE "PaymentMethod"
      SET ${finalUpdateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${finalParamCount}
      RETURNING *
    `;

    try {
      const result = await query(finalUpdateQuery, finalValues);
      const method = result.rows[0];
      
      // Parsear config si es necesario
      if (method.config && typeof method.config === 'string') {
        try {
          method.config = JSON.parse(method.config);
        } catch (e) {
          // Si no se puede parsear, dejarlo como está
          console.warn('No se pudo parsear config:', e);
        }
      }

      return {
        success: true,
        data: method,
        message: 'Zahlungsmethode erfolgreich aktualisiert'
      };
    } catch (error) {
      console.error('Error al actualizar método de pago:', error);
      throw new Error(`Fehler beim Aktualisieren der Zahlungsmethode: ${error.message}`);
    }
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
      throw new Error('Zahlungsmethode nicht gefunden');
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
      throw new Error('Geschäft nicht gefunden');
    }
    
    return storeResult.rows[0].ownerId === userId;
  }
}

module.exports = new PaymentMethodService();

