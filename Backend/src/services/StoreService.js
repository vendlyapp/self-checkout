const { query } = require('../../lib/database');
const qrCodeGenerator = require('../utils/qrCodeGenerator');

class StoreService {
  /**
   * Crear tienda para un usuario
   */
  async create(ownerId, storeData) {
    try {
      const { name, logo, isOpen } = storeData;

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
      const insertQuery = `
        INSERT INTO "Store" (
          "ownerId", "name", "slug", "logo", "isActive", "isOpen"
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await query(insertQuery, [
        ownerId,
        name.trim(),
        slug,
        logo || null,
        true,
        isOpen !== undefined ? isOpen : true
      ]);

      const store = result.rows[0];

      // Generar QR code para la tienda
      const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/store/${slug}`;
      const qrCode = await qrCodeGenerator.generateQRCode(store.id, qrUrl);

      // Actualizar con QR
      const updateQuery = 'UPDATE "Store" SET "qrCode" = $1 WHERE "id" = $2 RETURNING *';
      const updatedResult = await query(updateQuery, [qrCode, store.id]);

      return {
        success: true,
        data: updatedResult.rows[0]
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
   * Actualizar tienda
   */
  async update(ownerId, storeData) {
    try {
      const { name, logo, isOpen } = storeData;

      // Construir query de actualización dinámicamente
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

      const result = await query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Tienda no encontrada');
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating store:', error);
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
}

module.exports = new StoreService();

