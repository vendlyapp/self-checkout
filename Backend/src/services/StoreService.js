const { query } = require('../../lib/database');
const qrCodeGenerator = require('../utils/qrCodeGenerator');
const paymentMethodService = require('./PaymentMethodService');
const categoryService = require('./CategoryService');

class StoreService {
  /**
   * Crear tienda para un usuario
   */
  async create(ownerId, storeData) {
    try {
      const { name, logo, isOpen, address, phone, email, description } = storeData;

      if (!name || !name.trim()) {
        throw new Error('El nombre de la tienda es requerido');
      }

      // Generar slug único desde el nombre
      const baseSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      // Verificar si el slug ya existe
      while (true) {
        const existing = await query(
          'SELECT id FROM "Store" WHERE slug = $1',
          [slug]
        );

        if (existing.rows.length === 0) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Crear tienda
      // Intentar insertar con campos adicionales si existen en la tabla
      const insertQuery = `
        INSERT INTO "Store" (
          "ownerId", "name", "slug", "logo", "isActive", "isOpen", 
          "address", "phone", "email", "description"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await query(insertQuery, [
        ownerId,
        name.trim(),
        slug,
        logo || null,
        true,
        isOpen !== undefined ? isOpen : true,
        storeData.address || null,
        storeData.phone || null,
        storeData.email || null,
        storeData.description || null
      ]).catch(async (error) => {
        // Si falla por campos que no existen, intentar sin ellos
        if (error.message.includes('column') && (error.message.includes('address') || error.message.includes('phone') || error.message.includes('email') || error.message.includes('description'))) {
          console.warn('Algunos campos no existen en la tabla Store, creando sin ellos:', error.message);
          const fallbackQuery = `
            INSERT INTO "Store" (
              "ownerId", "name", "slug", "logo", "isActive", "isOpen"
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          return await query(fallbackQuery, [
            ownerId,
            name.trim(),
            slug,
            logo || null,
            true,
            isOpen !== undefined ? isOpen : true
          ]);
        }
        throw error;
      });

      const store = result.rows[0];

      // Generar QR code para la tienda con la URL completa
      // Usar URL de producción por defecto para que los QR codes funcionen en producción
      const qrUrl = `${process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app'}/store/${slug}`;
      const qrCode = await qrCodeGenerator.generateQRCode(qrUrl, store.name);

      // Actualizar con QR
      const updateQuery = 'UPDATE "Store" SET "qrCode" = $1 WHERE "id" = $2 RETURNING *';
      const updatedResult = await query(updateQuery, [qrCode, store.id]);
      const finalStore = updatedResult.rows[0];

      // Crear método de pago "Efectivo" (Bargeld) por defecto para la nueva tienda
      try {
        await paymentMethodService.create({
          storeId: finalStore.id,
          name: 'Bargeld',
          displayName: 'Bargeld',
          code: 'bargeld',
          icon: 'Coins',
          bgColor: '#766B6A',
          textColor: '#FFFFFF',
          sortOrder: 1,
          isActive: true
        });
      } catch (bargeldError) {
        if (bargeldError.message && !bargeldError.message.includes('existiert bereits')) {
          console.warn('No se pudo crear Bargeld por defecto para la tienda:', bargeldError.message);
        }
      }

      // Crear categoría por defecto para la nueva tienda (necesaria para crear productos)
      try {
        await categoryService.create(finalStore.id, {
          name: 'Allgemein',
          count: 0,
          isActive: true
        });
      } catch (catError) {
        if (!catError.message || !catError.message.includes('existiert bereits')) {
          console.warn('No se pudo crear categoría por defecto para la tienda:', catError.message);
        }
      }

      return {
        success: true,
        data: finalStore
      };
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Obtener tienda por ownerId
   */
  async getByOwnerId(ownerId) {
    try {
      const result = await query(
        'SELECT * FROM "Store" WHERE "ownerId" = $1',
        [ownerId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting store:', error);
      throw error;
    }
  }

  /**
   * Obtener tienda por slug (para vista pública)
   */
  async getBySlug(slug) {
    try {
      const result = await query(
        'SELECT * FROM "Store" WHERE "slug" = $1 AND "isActive" = true',
        [slug]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting store by slug:', error);
      throw error;
    }
  }

  /**
   * Obtener tienda por id
   */
  async getById(storeId) {
    try {
      const result = await query(
        'SELECT * FROM "Store" WHERE "id" = $1',
        [storeId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting store by id:', error);
      throw error;
    }
  }

  /**
   * Verificar si la tienda está abierta
   */
  async isStoreOpen(slug) {
    try {
      const result = await query(
        'SELECT "isOpen" FROM "Store" WHERE "slug" = $1 AND "isActive" = true',
        [slug]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].isOpen;
    } catch (error) {
      console.error('Error checking if store is open:', error);
      throw error;
    }
  }

  /**
   * Normaliza un slug: solo minúsculas, números y guiones
   */
  _normalizeSlug(input) {
    if (!input || typeof input !== 'string') return null;
    const slug = input
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug.length > 0 ? slug : null;
  }

  /**
   * Actualizar tienda.
   * El slug solo se puede cambiar en la primera configuración (settingsCompletedAt IS NULL).
   */
  async update(ownerId, storeData) {
    try {
      const { name, logo, isOpen, address, phone, email, description, slug: slugInput } = storeData;

      const existing = await query('SELECT id, slug, "settingsCompletedAt" FROM "Store" WHERE "ownerId" = $1', [ownerId]);
      if (existing.rows.length === 0) {
        throw new Error('Tienda no encontrada');
      }
      const currentStore = existing.rows[0];
      const isFirstTimeSetup = currentStore.settingsCompletedAt == null;

      const updateFields = [];
      const values = [];
      let paramCount = 0;

      if (name !== undefined) {
        paramCount++;
        updateFields.push(`"name" = $${paramCount}`);
        values.push(name);
      }

      if (logo !== undefined) {
        paramCount++;
        updateFields.push(`"logo" = $${paramCount}`);
        values.push(logo);
      }

      if (isOpen !== undefined) {
        paramCount++;
        updateFields.push(`"isOpen" = $${paramCount}`);
        values.push(isOpen);
      }

      if (address !== undefined) {
        paramCount++;
        updateFields.push(`"address" = $${paramCount}`);
        values.push(address);
      }

      if (phone !== undefined) {
        paramCount++;
        updateFields.push(`"phone" = $${paramCount}`);
        values.push(phone);
      }

      if (email !== undefined) {
        paramCount++;
        updateFields.push(`"email" = $${paramCount}`);
        values.push(email);
      }

      if (description !== undefined) {
        paramCount++;
        updateFields.push(`"description" = $${paramCount}`);
        values.push(description);
      }

      if (isFirstTimeSetup && slugInput !== undefined && slugInput !== null) {
        const newSlug = this._normalizeSlug(slugInput);
        if (newSlug) {
          const existingSlug = await query('SELECT id FROM "Store" WHERE slug = $1 AND id != $2', [newSlug, currentStore.id]);
          if (existingSlug.rows.length > 0) {
            throw new Error('Diese URL ist bereits vergeben. Bitte wählen Sie eine andere.');
          }
          paramCount++;
          updateFields.push(`"slug" = $${paramCount}`);
          values.push(newSlug);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      // Agregar ownerId como último parámetro
      paramCount++;
      values.push(ownerId);

      const updateQuery = `
        UPDATE "Store" 
        SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "ownerId" = $${paramCount}
        RETURNING *
      `;

      let result;
      try {
        result = await query(updateQuery, values);
      } catch (error) {
        if (error.code === '23505' && error.constraint?.includes('slug')) {
          throw new Error('Diese URL ist bereits vergeben. Bitte wählen Sie eine andere.');
        }
        // Si falla por campos que no existen, intentar actualizar solo los campos básicos
        if (error.message.includes('column') && (error.message.includes('address') || error.message.includes('phone') || error.message.includes('email') || error.message.includes('description'))) {
          console.warn('Algunos campos no existen en la tabla Store, actualizando solo campos básicos:', error.message);
          const basicFields = [];
          const basicValues = [];
          let basicParamCount = 0;
          
          if (name !== undefined) {
            basicParamCount++;
            basicFields.push(`"name" = $${basicParamCount}`);
            basicValues.push(name);
          }
          if (logo !== undefined) {
            basicParamCount++;
            basicFields.push(`"logo" = $${basicParamCount}`);
            basicValues.push(logo);
          }
          if (isOpen !== undefined) {
            basicParamCount++;
            basicFields.push(`"isOpen" = $${basicParamCount}`);
            basicValues.push(isOpen);
          }
          
          if (basicFields.length === 0) {
            throw new Error('No hay campos básicos para actualizar');
          }
          
          basicParamCount++;
          basicValues.push(ownerId);
          
          const basicQuery = `
            UPDATE "Store" 
            SET ${basicFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
            WHERE "ownerId" = $${basicParamCount}
            RETURNING *
          `;
          
          result = await query(basicQuery, basicValues);
        } else {
          throw error;
        }
      }

      if (result.rows.length === 0) {
        throw new Error('Tienda no encontrada');
      }

      let updatedStore = result.rows[0];

      // Marcar configuración completada la primera vez que guardan (onboarding)
      try {
        const onboardingUpdate = await query(
          `UPDATE "Store" SET "settingsCompletedAt" = CURRENT_TIMESTAMP WHERE "ownerId" = $1 AND "settingsCompletedAt" IS NULL RETURNING *`,
          [ownerId]
        );
        if (onboardingUpdate.rows.length > 0) {
          updatedStore = onboardingUpdate.rows[0];
        }
      } catch (colErr) {
        if (!colErr.message?.includes('column')) {
          throw colErr;
        }
      }

      // Regenerar QR code si el slug cambió, el nombre cambió o no existe
      const slugChanged = updatedStore.slug !== currentStore.slug;
      if (!updatedStore.qrCode || slugChanged || (name !== undefined && name !== updatedStore.name)) {
        const qrUrl = `${process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app'}/store/${updatedStore.slug}`;
        const qrCode = await qrCodeGenerator.generateQRCode(qrUrl, updatedStore.name);
        
        // Actualizar QR code
        const qrUpdateQuery = 'UPDATE "Store" SET "qrCode" = $1 WHERE "id" = $2 RETURNING *';
        const qrResult = await query(qrUpdateQuery, [qrCode, updatedStore.id]);
        
        return {
          success: true,
          data: qrResult.rows[0]
        };
      }

      return {
        success: true,
        data: updatedStore
      };
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  }

  /**
   * Marca el onboarding como completado (después de configuración y opcionalmente métodos de pago)
   * @param {string} ownerId - ID del propietario
   */
  async completeOnboarding(ownerId) {
    try {
      const updateQuery = `
        UPDATE "Store"
        SET "onboardingCompletedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "ownerId" = $1
        RETURNING *
      `;
      const result = await query(updateQuery, [ownerId]);
      if (result.rows.length === 0) {
        throw new Error('Tienda no encontrada');
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      if (error.message === 'Tienda no encontrada') throw error;
      if (error.message?.includes('column')) {
        return { success: true, data: await this.getByOwnerId(ownerId) };
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de apertura de la tienda
   * @param {string} ownerId - ID del propietario
   * @param {boolean} isOpen - Estado de apertura
   */
  async updateStoreStatus(ownerId, isOpen) {
    try {
      const updateQuery = `
        UPDATE "Store" 
        SET "isOpen" = $1, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "ownerId" = $2
        RETURNING *
      `;

      const result = await query(updateQuery, [isOpen, ownerId]);

      if (result.rows.length === 0) {
        throw new Error('Tienda no encontrada');
      }

      return {
        success: true,
        data: result.rows[0],
        message: isOpen ? 'Tienda abierta' : 'Tienda cerrada'
      };
    } catch (error) {
      console.error('Error updating store status:', error);
      throw error;
    }
  }

  /**
   * Regenera el código QR de la tienda
   * @param {string} ownerId - ID del propietario
   */
  async regenerateQRCode(ownerId) {
    try {
      // Obtener la tienda
      const store = await this.getByOwnerId(ownerId);

      if (!store) {
        throw new Error('Tienda no encontrada');
      }

      // Generar nuevo QR code con la URL completa
      const qrUrl = `${process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app'}/store/${store.slug}`;
      const qrCode = await qrCodeGenerator.generateQRCode(qrUrl, store.name);

      // Actualizar QR code en la base de datos
      const updateQuery = 'UPDATE "Store" SET "qrCode" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2 RETURNING *';
      const result = await query(updateQuery, [qrCode, store.id]);

      if (result.rows.length === 0) {
        throw new Error('Error al actualizar el QR code');
      }

      return {
        success: true,
        data: result.rows[0],
        message: 'QR code regenerado exitosamente'
      };
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      throw error;
    }
  }
}

module.exports = new StoreService();

