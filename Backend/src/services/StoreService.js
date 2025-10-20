const { query } = require('../../lib/database');
const qrCodeGenerator = require('../utils/qrCodeGenerator');

class StoreService {
  /**
   * Crear tienda para un usuario
   */
  async create(ownerId, storeData) {
    try {
      const { name, logo } = storeData;

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
          "ownerId", "name", "slug", "logo", "isActive"
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await query(insertQuery, [
        ownerId,
        name.trim(),
        slug,
        logo || null,
        true
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
   * Actualizar tienda
   */
  async update(ownerId, storeData) {
    try {
      const { name, logo } = storeData;

      const updateQuery = `
        UPDATE "Store" 
        SET "name" = COALESCE($1, "name"),
            "logo" = COALESCE($2, "logo")
        WHERE "ownerId" = $3
        RETURNING *
      `;

      const result = await query(updateQuery, [
        name || null,
        logo || null,
        ownerId
      ]);

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
}

module.exports = new StoreService();

