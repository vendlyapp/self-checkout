const { query } = require('../../lib/database');

class ProductService {

  async create(productData) {
    // Validaciones requeridas según el formulario
    if (!productData.name || !productData.name.trim()) {
      throw new Error('El nombre del producto es requerido');
    }

    if (!productData.description || !productData.description.trim()) {
      throw new Error('La descripción del producto es requerida');
    }

    if (!productData.price || isNaN(parseFloat(productData.price))) {
      throw new Error('El precio debe ser un número válido');
    }

    if (parseFloat(productData.price) < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (!productData.category || !productData.category.trim()) {
      throw new Error('La categoría es requerida');
    }

    if (!productData.sku || !productData.sku.trim()) {
      throw new Error('El SKU es requerido');
    }

    // Validar stock
    const stock = parseInt(productData.stock) || 0;
    if (stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    // Preparar datos para inserción
    const insertQuery = `
      INSERT INTO "Product" (
        "name", "description", "price", "originalPrice", "category", "categoryId",
        "stock", "initialStock", "barcode", "sku", "qrCode", "tags",
        "isNew", "isPopular", "isOnSale", "isActive", "rating", "reviews",
        "weight", "hasWeight", "dimensions", "discountPercentage", "image", "images",
        "currency", "promotionTitle", "promotionType", "promotionStartAt", "promotionEndAt",
        "promotionBadge", "promotionActionLabel", "promotionPriority", "supplier",
        "costPrice", "margin", "taxRate", "expiryDate", "location", "notes"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39
      ) RETURNING *
    `;

    const values = [
      productData.name.trim(),
      productData.description.trim(),
      parseFloat(productData.price),
      productData.promotionPrice ? parseFloat(productData.price) : null,
      productData.category.trim(),
      productData.categoryId || productData.category.toLowerCase().replace(/\s+/g, '_'),
      stock,
      productData.initialStock ? parseInt(productData.initialStock) : null,
      productData.barcode?.trim() || null,
      productData.sku.trim(),
      productData.qrCode?.trim() || null,
      productData.tags || [],
      Boolean(productData.isNew),
      Boolean(productData.isPopular),
      Boolean(productData.promotionPrice),
      productData.isActive !== undefined ? Boolean(productData.isActive) : true,
      productData.rating ? parseFloat(productData.rating) : null,
      productData.reviews ? parseInt(productData.reviews) : null,
      productData.weight ? parseFloat(productData.weight) : null,
      Boolean(productData.hasWeight),
      productData.dimensions || null,
      productData.promotionPrice ?
        Math.round(((parseFloat(productData.price) - parseFloat(productData.promotionPrice)) / parseFloat(productData.price)) * 100) : null,
      productData.image?.trim() || null,
      productData.images || [],
      'CHF',
      productData.promotionTitle?.trim() || null,
      productData.promotionType || null,
      productData.promotionStartAt ? new Date(productData.promotionStartAt) : null,
      productData.promotionEndAt ? new Date(productData.promotionEndAt) : null,
      productData.promotionBadge?.trim() || null,
      productData.promotionActionLabel?.trim() || null,
      productData.promotionPriority ? parseInt(productData.promotionPriority) : null,
      productData.supplier?.trim() || null,
      productData.costPrice ? parseFloat(productData.costPrice) : null,
      productData.margin ? parseFloat(productData.margin) : null,
      productData.taxRate ? parseFloat(productData.taxRate) : null,
      productData.expiryDate ? new Date(productData.expiryDate) : null,
      productData.location?.trim() || null,
      productData.notes?.trim() || null
    ];

    const result = await query(insertQuery, values);
    const product = result.rows[0];

    return {
      success: true,
      data: product,
      message: 'Producto creado exitosamente'
    };
  }

  async findAll(options = {}) {
    const {
      limit = 100,
      offset = 0,
      search = null,
      categoryId = null,
      sortBy = 'name',
      order = 'ASC'
    } = options;

    let whereClause = 'WHERE "isActive" = true';
    const params = [];
    let paramCount = 0;

    // Filtro por categoría
    if (categoryId && categoryId !== 'all') {
      paramCount++;
      whereClause += ` AND "categoryId" = $${paramCount}`;
      params.push(categoryId);
    }

    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereClause += ` AND (
        "name" ILIKE $${paramCount} OR
        "description" ILIKE $${paramCount} OR
        "sku" ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    // Ordenamiento
    let orderByClause = 'ORDER BY "name" ASC';
    if (sortBy === 'price') {
      orderByClause = 'ORDER BY "price" ASC';
    } else if (sortBy === 'rating') {
      orderByClause = 'ORDER BY "rating" DESC NULLS LAST';
    } else if (sortBy === 'newest') {
      orderByClause = 'ORDER BY "createdAt" DESC';
    }

    // Consulta principal
    const selectQuery = `
      SELECT * FROM "Product"
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    params.push(limit, offset);

    const result = await query(selectQuery, params);
    const products = result.rows;

    // Contar total
    const countQuery = `SELECT COUNT(*) FROM "Product" ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    return {
      success: true,
      data: products,
      count: products.length,
      total: total
    };
  }

  async findById(id) {
    const selectQuery = 'SELECT * FROM "Product" WHERE "id" = $1';
    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Producto no encontrado');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  async findBySku(sku) {
    const selectQuery = 'SELECT * FROM "Product" WHERE "sku" = $1';
    const result = await query(selectQuery, [sku]);

    if (result.rows.length === 0) {
      throw new Error('Producto no encontrado');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  async update(id, productData) {
    // Verificar que el producto existe
    const existingProduct = await this.findById(id);
    if (!existingProduct.success) {
      throw new Error('Producto no encontrado');
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const updatableFields = [
      'name', 'description', 'price', 'category', 'stock', 'sku', 'barcode',
      'supplier', 'costPrice', 'location', 'notes', 'isActive', 'rating',
      'weight', 'image', 'promotionTitle', 'promotionType', 'promotionStartAt',
      'promotionEndAt', 'promotionBadge', 'promotionActionLabel', 'promotionPriority',
      'margin', 'taxRate', 'expiryDate'
    ];

    for (const field of updatableFields) {
      if (productData[field] !== undefined) {
        paramCount++;
        updateFields.push(`"${field}" = $${paramCount}`);

        // Procesar valores según el tipo
        let value = productData[field];
        if (field === 'price' || field === 'costPrice' || field === 'rating' || field === 'weight' || field === 'margin' || field === 'taxRate') {
          value = parseFloat(value);
        } else if (field === 'stock' || field === 'promotionPriority') {
          value = parseInt(value);
        } else if (field === 'isActive') {
          value = Boolean(value);
        } else if (field === 'promotionStartAt' || field === 'promotionEndAt' || field === 'expiryDate') {
          value = value ? new Date(value) : null;
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
      UPDATE "Product"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const product = result.rows[0];

    return {
      success: true,
      data: product,
      message: 'Producto actualizado exitosamente'
    };
  }

  async delete(id) {
    // Verificar que el producto existe
    const existingProduct = await this.findById(id);
    if (!existingProduct.success) {
      throw new Error('Producto no encontrado');
    }

    const deleteQuery = 'DELETE FROM "Product" WHERE "id" = $1';
    await query(deleteQuery, [id]);

    return {
      success: true,
      message: 'Producto eliminado exitosamente'
    };
  }

  async getStats() {
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isActive" = true) as available,
        COUNT(*) FILTER (WHERE "stock" < 10 AND "stock" > 0) as lowStock,
        COUNT(*) FILTER (WHERE "stock" = 0) as outOfStock,
        COUNT(*) FILTER (WHERE "isActive" = false) as unavailable
      FROM "Product"
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        total: parseInt(stats.total),
        available: parseInt(stats.available),
        lowStock: parseInt(stats.lowstock),
        outOfStock: parseInt(stats.outofstock),
        unavailable: parseInt(stats.unavailable)
      }
    };
  }

  async search(searchTerm) {
    const searchQuery = `
      SELECT * FROM "Product"
      WHERE "isActive" = true AND (
        "name" ILIKE $1 OR
        "description" ILIKE $1 OR
        "sku" ILIKE $1 OR
        "category" ILIKE $1
      )
      ORDER BY "name" ASC
      LIMIT 50
    `;

    const result = await query(searchQuery, [`%${searchTerm}%`]);
    const products = result.rows;

    return {
      success: true,
      data: products,
      count: products.length
    };
  }

  // Métodos adicionales para compatibilidad
  async findAvailable() {
    return this.findAll({ where: { isActive: true } });
  }

  async findByCategory(categoryId) {
    return this.findAll({ categoryId });
  }

  async updateStock(id, stock) {
    // Verificar que el producto existe
    const existingProduct = await this.findById(id);
    if (!existingProduct.success) {
      throw new Error('Producto no encontrado');
    }

    // Validar stock
    const newStock = parseInt(stock);
    if (isNaN(newStock) || newStock < 0) {
      throw new Error('El stock debe ser un número entero no negativo');
    }

    const updateQuery = `
      UPDATE "Product"
      SET stock = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [newStock, id]);
    const product = result.rows[0];

    return {
      success: true,
      data: product,
      message: 'Stock actualizado exitosamente'
    };
  }
}

module.exports = new ProductService();
