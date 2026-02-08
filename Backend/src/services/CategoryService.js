const { query } = require('../../lib/database');

class CategoryService {

  /**
   * Asegura que la tienda tenga al menos la categoría "Allgemein". Para tiendas creadas antes de categorías por tienda.
   */
  async ensureDefaultCategoryForStore(storeId) {
    if (!storeId || !storeId.trim()) return;
    const existing = await query(
      'SELECT id FROM "ProductCategory" WHERE "storeId" = $1 LIMIT 1',
      [storeId.trim()]
    );
    if (existing.rows.length > 0) return;
    try {
      await this.create(storeId, { name: 'Allgemein', count: 0, isActive: true });
    } catch (e) {
      if (!e.message || !e.message.includes('existiert bereits')) {
        console.warn('[CategoryService] ensureDefaultCategoryForStore:', e.message);
      }
    }
  }

  /**
   * Lista categorías. Si storeId se proporciona, solo de esa tienda. Si no, todas (legacy/super-admin).
   */
  async findAll(storeId = null) {
    if (storeId) {
      await this.ensureDefaultCategoryForStore(storeId);
    }
    let selectQuery = 'SELECT * FROM "ProductCategory"';
    const params = [];
    if (storeId) {
      selectQuery += ' WHERE "storeId" = $1';
      params.push(storeId);
    }
    selectQuery += ' ORDER BY name ASC';

    const result = await query(selectQuery, params);
    const categories = result.rows;

    return {
      success: true,
      data: categories,
      count: categories.length
    };
  }

  async findById(id, storeId = null) {
    let selectQuery = 'SELECT * FROM "ProductCategory" WHERE id = $1';
    const params = [id];
    if (storeId) {
      selectQuery += ' AND "storeId" = $2';
      params.push(storeId);
    }
    const result = await query(selectQuery, params);

    if (result.rows.length === 0) {
      throw new Error('Categoría no encontrada');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  async create(storeId, categoryData) {
    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }
    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }

    const existingCategory = await query(
      'SELECT id FROM "ProductCategory" WHERE "storeId" = $1 AND name = $2',
      [storeId.trim(), categoryData.name.trim()]
    );
    if (existingCategory.rows.length > 0) {
      throw new Error('Ya existe una categoría con ese nombre en esta tienda');
    }

    const insertQuery = `
      INSERT INTO "ProductCategory" ("storeId", name, count, color, icon, "isActive")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(insertQuery, [
      storeId.trim(),
      categoryData.name.trim(),
      parseInt(categoryData.count) || 0,
      categoryData.color?.trim() || null,
      categoryData.icon?.trim() || null,
      categoryData.isActive !== undefined ? categoryData.isActive : true
    ]);
    const category = result.rows[0];

    return {
      success: true,
      data: category,
      message: 'Categoría creada exitosamente'
    };
  }

  async update(id, categoryData, storeId = null) {
    const existingCategory = await this.findById(id, storeId);
    if (!existingCategory.success) {
      throw new Error('Categoría no encontrada');
    }
    if (storeId && existingCategory.data.storeId !== storeId) {
      throw new Error('Categoría no pertenece a esta tienda');
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const updatableFields = ['name', 'count', 'color', 'icon', 'isActive'];

    for (const field of updatableFields) {
      if (categoryData[field] !== undefined) {
        paramCount++;
        updateFields.push(`"${field}" = $${paramCount}`);

        // Procesar valores según el tipo
        let value = categoryData[field];
        if (field === 'count') {
          value = parseInt(value);
        } else if (field === 'isActive') {
          value = Boolean(value);
        } else if (field === 'name' && typeof value === 'string') {
          value = value.trim();
          if (storeId) {
            const duplicate = await query(
              'SELECT id FROM "ProductCategory" WHERE "storeId" = $1 AND name = $2 AND id != $3',
              [storeId, value, id]
            );
            if (duplicate.rows.length > 0) {
              throw new Error('Ya existe una categoría con ese nombre en esta tienda');
            }
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

    let updateQuery = `
      UPDATE "ProductCategory"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
    `;
    if (storeId) {
      paramCount++;
      values.push(storeId);
      updateQuery = `
      UPDATE "ProductCategory"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount - 1} AND "storeId" = $${paramCount}
      RETURNING *
    `;
    } else {
      updateQuery += ' RETURNING *';
    }

    const result = await query(updateQuery, values);
    const category = result.rows[0];

    return {
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    };
  }

  async delete(id, storeId = null, options = {}) {
    const { moveProductsToCategoryId } = options;

    const existingCategory = await this.findById(id, storeId);
    if (!existingCategory.success) {
      throw new Error('Categoría no encontrada');
    }
    if (storeId && existingCategory.data.storeId !== storeId) {
      throw new Error('Categoría no pertenece a esta tienda');
    }

    const cat = existingCategory.data;
    const isActive = cat.isActive === true;
    if (isActive) {
      throw new Error('Nur inaktive Kategorien können gelöscht werden. Bitte deaktivieren Sie die Kategorie zuerst.');
    }

    const productsCount = await query(
      'SELECT COUNT(*) FROM "Product" WHERE "categoryId" = $1',
      [id]
    );
    const count = parseInt(productsCount.rows[0].count);

    if (count > 0) {
      if (!moveProductsToCategoryId || !moveProductsToCategoryId.trim()) {
        throw new Error(`Diese Kategorie hat ${count} zugeordnete Produkte. Bitte wählen Sie eine Zielkategorie aus, um die Produkte zu verschieben.`);
      }
      const targetCategory = await this.findById(moveProductsToCategoryId.trim(), storeId);
      if (!targetCategory.success) {
        throw new Error('Zielkategorie nicht gefunden');
      }
      if (targetCategory.data.id === id) {
        throw new Error('Die Zielkategorie muss eine andere Kategorie sein');
      }
      if (storeId && targetCategory.data.storeId !== storeId) {
        throw new Error('Die Zielkategorie gehört nicht zu Ihrer Tienda');
      }

      await query(
        'UPDATE "Product" SET "categoryId" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "categoryId" = $2',
        [moveProductsToCategoryId.trim(), id]
      );
    }

    await query('DELETE FROM "ProductCategory" WHERE id = $1', [id]);

    return {
      success: true,
      message: 'Categoría eliminada exitosamente'
    };
  }

  async updateCounts(storeId = null) {
    const categories = await this.findAll(storeId);

    // Actualizar contadores
    for (const category of categories.data) {
      const countResult = await query(
        'SELECT COUNT(*) FROM "Product" WHERE "categoryId" = $1',
        [category.id]
      );

      const count = parseInt(countResult.rows[0].count);

      await query(
        'UPDATE "ProductCategory" SET count = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
        [count, category.id]
      );
    }

    return {
      success: true,
      message: 'Contadores de categorías actualizados'
    };
  }

  async getStats(storeId = null) {
    let statsQuery = 'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE count > 0) as withProducts, COUNT(*) FILTER (WHERE count = 0) as withoutProducts FROM "ProductCategory"';
    const params = [];
    if (storeId) {
      statsQuery += ' WHERE "storeId" = $1';
      params.push(storeId);
    }

    const result = await query(statsQuery, params);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        total: parseInt(stats.total),
        withProducts: parseInt(stats.withproducts),
        withoutProducts: parseInt(stats.withoutproducts)
      }
    };
  }
}

module.exports = new CategoryService();
