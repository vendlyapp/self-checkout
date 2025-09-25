const { prisma } = require('../../lib/prisma_new');

class ProductServiceNew {

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

    // Preparar datos para creación según el formulario
    const dataToCreate = {
      // Campos obligatorios del formulario
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),
      category: productData.category.trim(),
      categoryId: productData.categoryId || productData.category.toLowerCase().replace(/\s+/g, '_'),
      stock: stock,
      sku: productData.sku.trim(),

      // Campos opcionales del formulario
      barcode: productData.barcode?.trim() || null,
      supplier: productData.supplier?.trim() || null,
      costPrice: productData.costPrice ? parseFloat(productData.costPrice) : null,
      expiryDate: productData.expiryDate ? new Date(productData.expiryDate) : null,
      location: productData.location?.trim() || null,
      notes: productData.notes?.trim() || null,

      // Campos con valores por defecto
      isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
      currency: 'CHF',

      // Campos de promociones (si se proporcionan)
      originalPrice: productData.promotionPrice ? parseFloat(productData.price) : null,
      discountPercentage: productData.promotionPrice ?
        Math.round(((parseFloat(productData.price) - parseFloat(productData.promotionPrice)) / parseFloat(productData.price)) * 100) : null,
      isOnSale: Boolean(productData.promotionPrice),

      // Campos adicionales opcionales
      tags: productData.tags || [],
      image: productData.image?.trim() || null,
      images: productData.images || [],
      qrCode: productData.qrCode?.trim() || null,
      rating: productData.rating ? parseFloat(productData.rating) : null,
      reviews: productData.reviews ? parseInt(productData.reviews) : null,
      weight: productData.weight ? parseFloat(productData.weight) : null,
      hasWeight: Boolean(productData.hasWeight),
      dimensions: productData.dimensions || null,
      isNew: Boolean(productData.isNew),
      isPopular: Boolean(productData.isPopular),

      // Campos de promociones avanzadas
      promotionTitle: productData.promotionTitle?.trim() || null,
      promotionType: productData.promotionType || null,
      promotionStartAt: productData.promotionStartAt ? new Date(productData.promotionStartAt) : null,
      promotionEndAt: productData.promotionEndAt ? new Date(productData.promotionEndAt) : null,
      promotionBadge: productData.promotionBadge?.trim() || null,
      promotionActionLabel: productData.promotionActionLabel?.trim() || null,
      promotionPriority: productData.promotionPriority ? parseInt(productData.promotionPriority) : null,

      // Campos adicionales de gestión
      margin: productData.margin ? parseFloat(productData.margin) : null,
      taxRate: productData.taxRate ? parseFloat(productData.taxRate) : null,
      initialStock: productData.initialStock ? parseInt(productData.initialStock) : null
    };

    // Crear producto
    const product = await prisma.product.create({
      data: dataToCreate
    });

    return {
      success: true,
      data: product,
      message: 'Producto creado exitosamente'
    };
  }

  async findAll(options = {}) {
    const {
      limit = 100,
      orderBy = { createdAt: 'desc' },
      where = { isActive: true },
      search = null,
      categoryId = null,
      sortBy = 'name'
    } = options;

    // Agregar filtros
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    // Ordenamiento
    let orderByClause = orderBy;
    if (sortBy === 'price') {
      orderByClause = { price: 'asc' };
    } else if (sortBy === 'rating') {
      orderByClause = { rating: 'desc' };
    } else if (sortBy === 'newest') {
      orderByClause = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: orderByClause,
      take: limit
    });

    return {
      success: true,
      data: products,
      count: products.length
    };
  }

  async findById(id) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return {
      success: true,
      data: product
    };
  }

  async update(id, productData) {
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      throw new Error('Producto no encontrado');
    }

    // Preparar datos para actualización
    const dataToUpdate = {};

    // Campos básicos
    if (productData.name !== undefined) dataToUpdate.name = productData.name.trim();
    if (productData.description !== undefined) dataToUpdate.description = productData.description?.trim() || null;
    if (productData.price !== undefined) dataToUpdate.price = parseFloat(productData.price);
    if (productData.category !== undefined) dataToUpdate.category = productData.category.trim();
    if (productData.stock !== undefined) dataToUpdate.stock = parseInt(productData.stock);
    if (productData.sku !== undefined) dataToUpdate.sku = productData.sku.trim();

    // Campos opcionales
    if (productData.barcode !== undefined) dataToUpdate.barcode = productData.barcode?.trim() || null;
    if (productData.supplier !== undefined) dataToUpdate.supplier = productData.supplier?.trim() || null;
    if (productData.costPrice !== undefined) dataToUpdate.costPrice = productData.costPrice ? parseFloat(productData.costPrice) : null;
    if (productData.location !== undefined) dataToUpdate.location = productData.location?.trim() || null;
    if (productData.notes !== undefined) dataToUpdate.notes = productData.notes?.trim() || null;
    if (productData.isActive !== undefined) dataToUpdate.isActive = Boolean(productData.isActive);

    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    return {
      success: true,
      data: product,
      message: 'Producto actualizado exitosamente'
    };
  }

  async delete(id) {
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      throw new Error('Producto no encontrado');
    }

    await prisma.product.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Producto eliminado exitosamente'
    };
  }

  async getStats() {
    const [total, available, lowStock, outOfStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lt: 10, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } })
    ]);

    return {
      success: true,
      data: {
        total,
        available,
        lowStock,
        outOfStock,
        unavailable: total - available
      }
    };
  }
}

module.exports = new ProductServiceNew();
