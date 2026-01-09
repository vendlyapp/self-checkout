const { query } = require('../../lib/database');
const qrCodeGenerator = require('../utils/qrCodeGenerator');
const barcodeGenerator = require('../utils/barcodeGenerator');
const storeService = require('./StoreService');

class ProductService {

  async create(productData, ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID es requerido');
    }

    if (!productData.name || !productData.name.trim()) {
      throw new Error('El nombre del producto es requerido');
    }

    // Descripción es opcional, usar string vacío si no se proporciona
    const description = productData.description && productData.description.trim() 
      ? productData.description.trim() 
      : '';

    const price = parseFloat(productData.price);
    if (isNaN(price) || price < 0) {
      throw new Error('El precio debe ser un número válido y positivo');
    }

    if (!productData.category || !productData.category.trim()) {
      throw new Error('La categoría es requerida');
    }

    const stock = productData.stock !== undefined ? parseInt(productData.stock) : 999;
    if (stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    const insertQuery = `
      INSERT INTO "Product" (
        "ownerId", "name", "description", "price", "originalPrice", "category", "categoryId",
        "stock", "initialStock", "barcode", "sku", "qrCode", "tags",
        "isNew", "isPopular", "isOnSale", "isActive", "rating", "reviews",
        "weight", "hasWeight", "dimensions", "discountPercentage", "image", "images",
        "currency", "promotionTitle", "promotionType", "promotionStartAt", "promotionEndAt",
        "promotionBadge", "promotionActionLabel", "promotionPriority", "supplier",
        "costPrice", "margin", "taxRate", "expiryDate", "location", "notes", "parentId"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22::jsonb, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
      ) RETURNING *
    `;

    // Calcular precios correctamente
    // El frontend envía: price (precio final/promocional) y originalPrice (precio original si hay promoción)
    const finalPrice = parseFloat(productData.price);
    const originalPriceValue = productData.originalPrice ? parseFloat(productData.originalPrice) : null;
    
    // Si hay originalPrice y es diferente de price, entonces hay una promoción
    // originalPrice debe ser mayor que price para que sea una promoción válida
    const hasPromotion = originalPriceValue && originalPriceValue > finalPrice;
    const originalPrice = hasPromotion ? originalPriceValue : null;
    
    // Calcular descuento si hay promoción
    const discountPercentage = hasPromotion && originalPriceValue > 0 ?
      Math.round(((originalPriceValue - finalPrice) / originalPriceValue) * 100) : 
      (productData.discountPercentage ? parseInt(productData.discountPercentage) : null);

    // Preparar arrays y objetos para PostgreSQL
    // tags es text[] - pasar como array de JavaScript (pg maneja arrays nativamente)
    const tagsArray = Array.isArray(productData.tags) 
      ? productData.tags.filter(tag => tag && typeof tag === 'string').map(tag => tag.trim())
      : (productData.tags && typeof productData.tags === 'string' ? [productData.tags.trim()] : []);
    
    // images es text[] - pasar como array de JavaScript (pg maneja arrays nativamente)
    const imagesArray = Array.isArray(productData.images)
      ? productData.images.filter(img => img && typeof img === 'string').map(img => img.trim())
      : (productData.images && typeof productData.images === 'string' ? [productData.images.trim()] : []);
    
    // dimensions es jsonb - convertir a JSON string
    const dimensionsObj = productData.dimensions && typeof productData.dimensions === 'object' ? productData.dimensions : null;

    const values = [
      ownerId, // $1
      productData.name.trim(), // $2
      description, // $3
      finalPrice, // $4 - precio final (promocional si existe, sino base)
      originalPrice, // $5 - precio original (base si hay promoción, sino null)
      productData.category.trim(), // $6
      productData.categoryId || productData.category.toLowerCase().replace(/\s+/g, '_'), // $7
      stock, // $8
      productData.initialStock ? parseInt(productData.initialStock) : stock, // $9
      productData.barcode?.trim() || null, // $10
      productData.sku?.trim() || `SKU-${Date.now()}`, // $11
      productData.qrCode?.trim() || null, // $12
      tagsArray, // $13 - text[] - pasar array directamente (pg lo maneja)
      Boolean(productData.isNew), // $14
      Boolean(productData.isPopular), // $15
      Boolean(hasPromotion || productData.isOnSale), // $16 - isOnSale si hay promoción o está marcado como en oferta
      productData.isActive !== undefined ? Boolean(productData.isActive) : true, // $17
      productData.rating ? parseFloat(productData.rating) : null, // $18
      productData.reviews ? parseInt(productData.reviews) : null, // $19
      productData.weight ? parseFloat(productData.weight) : null, // $20
      Boolean(productData.hasWeight), // $21
      dimensionsObj ? JSON.stringify(dimensionsObj) : null, // $22 - jsonb - convertir objeto a JSON
      discountPercentage, // $23
      productData.image?.trim() || null, // $24
      imagesArray, // $25 - text[] - pasar array directamente (pg lo maneja)
      productData.currency || 'CHF', // $26
      productData.promotionTitle?.trim() || null, // $27
      productData.promotionType || null, // $28
      productData.promotionStartAt ? new Date(productData.promotionStartAt).toISOString() : null, // $29
      productData.promotionEndAt ? new Date(productData.promotionEndAt).toISOString() : null, // $30
      productData.promotionBadge?.trim() || null, // $31
      productData.promotionActionLabel?.trim() || null, // $32
      productData.promotionPriority ? parseInt(productData.promotionPriority) : null, // $33
      productData.supplier?.trim() || null, // $34
      productData.costPrice ? parseFloat(productData.costPrice) : null, // $35
      productData.margin ? parseFloat(productData.margin) : null, // $36
      productData.taxRate ? parseFloat(productData.taxRate) : null, // $37
      productData.expiryDate ? new Date(productData.expiryDate).toISOString() : null, // $38
      productData.location?.trim() || null, // $39
      productData.notes?.trim() || null, // $40
      productData.parentId?.trim() || null // $41 - ID del producto padre (para variantes)
    ];

    const result = await query(insertQuery, values);
    const product = result.rows[0];

    // Obtener la tienda para generar URL completa del QR
    const store = await storeService.getByOwnerId(ownerId);
    // Usar URL de producción por defecto para que los QR codes funcionen en producción
    // En desarrollo local, configurar FRONTEND_URL en .env
    const frontendUrl = process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app';
    
    // Generar URL completa para el producto
    // La URL será: /product/[productId] que manejará agregar al carrito y redirigir
    const productUrl = `${frontendUrl}/product/${product.id}`;

    // Generar QR code con URL completa y código de barras
    const [qrCode, barcodeImage] = await Promise.all([
      qrCodeGenerator.generateQRCode(product.id, product.name, productUrl),
      barcodeGenerator.generateBarcode(product.id, product.name)
    ]);
    
    const updateCodesQuery = 'UPDATE "Product" SET "qrCode" = $1, "barcodeImage" = $2 WHERE "id" = $3 RETURNING *';
    const updatedResult = await query(updateCodesQuery, [qrCode, barcodeImage, product.id]);
    const productWithCodes = updatedResult.rows[0];

    return {
      success: true,
      data: productWithCodes,
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
      order = 'ASC',
      ownerId = null // NUEVO: Filtrar por dueño
    } = options;

    let whereClause = 'WHERE "isActive" = true';
    const params = [];
    let paramCount = 0;

    // NUEVO: Filtrar por ownerId si se proporciona
    if (ownerId) {
      paramCount++;
      whereClause += ` AND "ownerId" = $${paramCount}`;
      params.push(ownerId);
    }

    if (categoryId && categoryId !== 'all') {
      paramCount++;
      whereClause += ` AND "categoryId" = $${paramCount}`;
      params.push(categoryId);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (
        "name" ILIKE $${paramCount} OR
        "description" ILIKE $${paramCount} OR
        "sku" ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    const orderByMap = {
      'price': 'ORDER BY "price" ASC',
      'rating': 'ORDER BY "rating" DESC NULLS LAST',
      'newest': 'ORDER BY "createdAt" DESC',
      'default': 'ORDER BY "name" ASC'
    };
    const orderByClause = orderByMap[sortBy] || orderByMap.default;
    const selectQuery = `
      SELECT * FROM "Product"
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    params.push(limit, offset);

    const [productsResult, countResult] = await Promise.all([
      query(selectQuery, params),
      query(`SELECT COUNT(*) FROM "Product" ${whereClause}`, params.slice(0, -2))
    ]);

    return {
      success: true,
      data: productsResult.rows,
      count: productsResult.rows.length,
      total: parseInt(countResult.rows[0].count)
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

  /**
   * Busca un producto por ID e incluye información de la tienda
   * @param {string} id - ID del producto (UUID)
   * @returns {Promise<Object>} Producto con información de la tienda
   */
  async findByIdWithStore(id) {
    const selectQuery = `
      SELECT 
        p.*,
        s.id as "storeId",
        s.name as "storeName",
        s.slug as "storeSlug",
        s.logo as "storeLogo",
        s."isOpen" as "storeIsOpen"
      FROM "Product" p
      INNER JOIN "Store" s ON p."ownerId" = s."ownerId"
      WHERE p.id = $1 AND p."isActive" = true AND s."isActive" = true
    `;
    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Producto no encontrado o no disponible');
    }

    const product = result.rows[0];
    
    // Formatear la respuesta para incluir información de la tienda
    return {
      success: true,
      data: {
        ...product,
        store: {
          id: product.storeId,
          name: product.storeName,
          slug: product.storeSlug,
          logo: product.storeLogo,
          isOpen: product.storeIsOpen
        }
      }
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
    const existingProduct = await this.findById(id);
    if (!existingProduct.success) {
      throw new Error('Producto no encontrado');
    }

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const updatableFields = [
      'name', 'description', 'price', 'category', 'stock', 'sku', 'barcode',
      'supplier', 'costPrice', 'location', 'notes', 'isActive', 'rating',
      'weight', 'image', 'promotionTitle', 'promotionType', 'promotionStartAt',
      'promotionEndAt', 'promotionBadge', 'promotionActionLabel', 'promotionPriority',
      'margin', 'taxRate', 'expiryDate'
    ];

    const numericFields = ['price', 'costPrice', 'rating', 'weight', 'margin', 'taxRate'];
    const integerFields = ['stock', 'promotionPriority'];
    const dateFields = ['promotionStartAt', 'promotionEndAt', 'expiryDate'];

    for (const field of updatableFields) {
      if (productData[field] !== undefined) {
        paramCount++;
        updateFields.push(`"${field}" = $${paramCount}`);

        let value = productData[field];
        if (numericFields.includes(field)) {
          value = parseFloat(value);
        } else if (integerFields.includes(field)) {
          value = parseInt(value);
        } else if (field === 'isActive') {
          value = Boolean(value);
        } else if (dateFields.includes(field)) {
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
    const existingProduct = await this.findById(id);
    if (!existingProduct.success) {
      throw new Error('Producto no encontrado');
    }

    await query('DELETE FROM "Product" WHERE "id" = $1', [id]);

    return {
      success: true,
      message: 'Producto eliminado exitosamente'
    };
  }

  async getStats(ownerId = null) {
    let whereClause = '';
    const params = [];

    // Filtrar por ownerId si se proporciona (para obtener estadísticas de una tienda específica)
    if (ownerId) {
      whereClause = 'WHERE "ownerId" = $1';
      params.push(ownerId);
    }

    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isActive" = true) as available,
        COUNT(*) FILTER (WHERE "stock" < 10 AND "stock" > 0) as lowStock,
        COUNT(*) FILTER (WHERE "stock" = 0) as outOfStock,
        COUNT(*) FILTER (WHERE "isActive" = false) as unavailable
      FROM "Product"
      ${whereClause}
    `;

    const result = await query(statsQuery, params);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        total: parseInt(stats.total) || 0,
        available: parseInt(stats.available) || 0,
        lowStock: parseInt(stats.lowstock) || 0,
        outOfStock: parseInt(stats.outofstock) || 0,
        unavailable: parseInt(stats.unavailable) || 0
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
    return this.findAll({ isActive: true });
  }

  async findByCategory(categoryId) {
    return this.findAll({ categoryId });
  }

  async updateStock(id, stock) {
    const existingProduct = await this.findById(id);
    if (!existingProduct.success) {
      throw new Error('Producto no encontrado');
    }

    const newStock = parseInt(stock);
    if (isNaN(newStock) || newStock < 0) {
      throw new Error('El stock debe ser un número entero no negativo');
    }

    const result = await query(
      'UPDATE "Product" SET stock = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStock, id]
    );

    return {
      success: true,
      data: result.rows[0],
      message: 'Stock actualizado exitosamente'
    };
  }
}

module.exports = new ProductService();
