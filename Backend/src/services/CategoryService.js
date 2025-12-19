const { query } = require('../../lib/database');

class CategoryService {

  async findAll() {
    const selectQuery = `
      SELECT * FROM "ProductCategory"
      ORDER BY name ASC
    `;

    const result = await query(selectQuery);
    const categories = result.rows;

    return {
      success: true,
      data: categories,
      count: categories.length
    };
  }

  async findById(id) {
    const selectQuery = 'SELECT * FROM "ProductCategory" WHERE id = $1';
    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Categoría no encontrada');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  async create(categoryData) {
    // Validaciones
    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }

    // Verificar nombre único
    const existingCategory = await query(
      'SELECT id FROM "ProductCategory" WHERE name = $1',
      [categoryData.name.trim()]
    );

    if (existingCategory.rows.length > 0) {
      throw new Error('Ya existe una categoría con ese nombre');
    }

    const insertQuery = `
      INSERT INTO "ProductCategory" (name, count, color, icon, "isActive")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(insertQuery, [
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

  async update(id, categoryData) {
    // Verificar que la categoría existe
    const existingCategory = await this.findById(id);
    if (!existingCategory.success) {
      throw new Error('Categoría no encontrada');
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
      UPDATE "ProductCategory"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const category = result.rows[0];

    return {
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    };
  }

  async delete(id) {
    // Verificar que la categoría existe
    const existingCategory = await this.findById(id);
    if (!existingCategory.success) {
      throw new Error('Categoría no encontrada');
    }

    // Verificar si hay productos usando esta categoría
    const productsCount = await query(
      'SELECT COUNT(*) FROM "Product" WHERE "categoryId" = $1',
      [id]
    );

    const count = parseInt(productsCount.rows[0].count);
    if (count > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${count} productos asociados`);
    }

    const deleteQuery = 'DELETE FROM "ProductCategory" WHERE id = $1';
    await query(deleteQuery, [id]);

    return {
      success: true,
      message: 'Categoría eliminada exitosamente'
    };
  }

  async updateCounts() {
    // Obtener todas las categorías
    const categories = await this.findAll();

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

  async getStats() {
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE count > 0) as withProducts,
        COUNT(*) FILTER (WHERE count = 0) as withoutProducts
      FROM "ProductCategory"
    `;

    const result = await query(statsQuery);
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
