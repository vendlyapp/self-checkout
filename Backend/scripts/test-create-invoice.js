/**
 * Script de test para crear facturas de prueba
 * Ejecutar: node scripts/test-create-invoice.js
 * 
 * Este script crea una factura de prueba con información del cliente y orden
 */

const invoiceService = require('../src/services/InvoiceService');
const orderService = require('../src/services/OrderService');
const { query } = require('../lib/database');

async function testCreateInvoice() {
  try {
    console.log('🧪 Iniciando test de creación de factura...\n');

    // 1. Buscar una orden existente para usar como referencia
    console.log('📋 Buscando una orden existente...');
    const ordersResult = await query(`
      SELECT id, "userId", total, "paymentMethod", "storeId", metadata
      FROM "Order"
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);

    if (ordersResult.rows.length === 0) {
      console.log('⚠️  No se encontraron órdenes. Creando una orden de prueba primero...');
      
      // Buscar un usuario existente
      const usersResult = await query(`
        SELECT id FROM "User" LIMIT 1
      `);
      
      if (usersResult.rows.length === 0) {
        throw new Error('No hay usuarios en la base de datos. Por favor, crea un usuario primero.');
      }

      const userId = usersResult.rows[0].id;

      // Buscar productos existentes
      const productsResult = await query(`
        SELECT id, price FROM "Product" WHERE stock > 0 LIMIT 2
      `);

      if (productsResult.rows.length === 0) {
        throw new Error('No hay productos con stock disponible. Por favor, crea productos primero.');
      }

      // Crear una orden de prueba
      const testOrder = await orderService.create(userId, {
        items: productsResult.rows.slice(0, 2).map(p => ({
          productId: p.id,
          quantity: 1,
        })),
        paymentMethod: 'test',
        metadata: {
          testOrder: true,
          customer: {
            name: 'Cliente de Prueba',
            email: 'test@example.com',
            address: 'Calle de Prueba 123',
            phone: '+41 79 123 45 67',
          },
          storeName: 'Tienda de Prueba',
        },
      });

      if (!testOrder.success || !testOrder.data) {
        throw new Error('Error al crear orden de prueba');
      }

      console.log('✅ Orden de prueba creada:', testOrder.data.id);
      console.log('   Factura creada automáticamente:', testOrder.data.invoiceId || 'No creada');
      
      // Si la factura se creó automáticamente, mostrarla
      if (testOrder.data.invoiceId) {
        const invoiceResult = await invoiceService.findById(testOrder.data.invoiceId);
        if (invoiceResult.success && invoiceResult.data) {
          console.log('\n📄 Factura creada automáticamente:');
          console.log('   ID:', invoiceResult.data.id);
          console.log('   Número:', invoiceResult.data.invoiceNumber);
          console.log('   Cliente:', invoiceResult.data.customerName || 'N/A');
          console.log('   Email:', invoiceResult.data.customerEmail || 'N/A');
          console.log('   Total:', `CHF ${invoiceResult.data.total}`);
          console.log('   Items:', invoiceResult.data.items?.length || 0);
        }
      }

      return;
    }

    const order = ordersResult.rows[0];
    console.log('✅ Orden encontrada:', order.id);
    console.log('   Total:', `CHF ${order.total}`);
    console.log('   Método de pago:', order.paymentMethod || 'N/A');

    // 2. Verificar si ya existe una factura para esta orden
    console.log('\n🔍 Verificando si ya existe una factura para esta orden...');
    const existingInvoiceResult = await invoiceService.findByOrderId(order.id);
    
    if (existingInvoiceResult.success && existingInvoiceResult.data && existingInvoiceResult.data.length > 0) {
      console.log('✅ Ya existe una factura para esta orden:');
      const existingInvoice = existingInvoiceResult.data[0];
      console.log('   ID:', existingInvoice.id);
      console.log('   Número:', existingInvoice.invoiceNumber);
      console.log('   Cliente:', existingInvoice.customerName || 'N/A');
      console.log('   Total:', `CHF ${existingInvoice.total}`);
      
      // Mostrar detalles completos
      console.log('\n📄 Detalles completos de la factura:');
      console.log(JSON.stringify(existingInvoice, null, 2));
      return;
    }

    // 3. Obtener items de la orden
    console.log('\n📦 Obteniendo items de la orden...');
    const orderItemsResult = await query(`
      SELECT oi.*, p.name as "productName", p.sku
      FROM "OrderItem" oi
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = $1
    `, [order.id]);

    if (orderItemsResult.rows.length === 0) {
      throw new Error('La orden no tiene items');
    }

    console.log(`✅ ${orderItemsResult.rows.length} items encontrados`);

    // 4. Obtener datos de la tienda si existe
    let storeInfo = null;
    if (order.storeId) {
      const storeResult = await query(`
        SELECT id, name, address, phone, email
        FROM "Store"
        WHERE id = $1
      `, [order.storeId]);
      
      if (storeResult.rows.length > 0) {
        storeInfo = storeResult.rows[0];
        console.log('🏪 Tienda encontrada:', storeInfo.name);
      }
    }

    // 5. Parsear metadata
    let metadata = {};
    try {
      if (order.metadata && typeof order.metadata === 'string') {
        metadata = JSON.parse(order.metadata);
      } else if (order.metadata && typeof order.metadata === 'object') {
        metadata = order.metadata;
      }
    } catch (parseError) {
      console.warn('⚠️  Error al parsear metadata:', parseError.message);
    }

    // 6. Preparar datos de la factura
    const customerData = metadata.customer || metadata.customerData || {};
    
    const invoiceItems = orderItemsResult.rows.map(item => ({
      productId: item.productId,
      productName: item.productName || 'Producto',
      productSku: item.sku || '',
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.price) * item.quantity,
    }));

    const subtotal = metadata.totalBeforeVAT || order.total;
    const discountAmount = metadata.discountAmount || 0;
    const taxAmount = metadata.totalWithVAT ? (metadata.totalWithVAT - subtotal + discountAmount) : 0;
    const invoiceTotal = metadata.totalWithVAT || order.total;

    const invoiceData = {
      orderId: order.id,
      customerName: customerData.name || 'Cliente de Prueba',
      customerEmail: customerData.email || 'test@example.com',
      customerAddress: customerData.address || 'Dirección de Prueba 123',
      customerCity: 'Zürich',
      customerPostalCode: '8000',
      customerPhone: customerData.phone || '+41 79 123 45 67',
      storeId: order.storeId || null,
      storeName: storeInfo?.name || metadata.storeName || 'Tienda de Prueba',
      storeAddress: storeInfo?.address || null,
      storePhone: storeInfo?.phone || null,
      storeEmail: storeInfo?.email || null,
      items: invoiceItems,
      subtotal: Number(subtotal),
      discountAmount: Number(discountAmount),
      taxAmount: Number(taxAmount),
      total: Number(invoiceTotal),
      paymentMethod: order.paymentMethod || null,
      metadata: {
        ...metadata,
        testInvoice: true,
        createdAt: new Date().toISOString(),
      },
    };

    // 7. Crear la factura
    console.log('\n📝 Creando factura de prueba...');
    console.log('   Cliente:', invoiceData.customerName);
    console.log('   Email:', invoiceData.customerEmail);
    console.log('   Items:', invoiceItems.length);
    console.log('   Total:', `CHF ${invoiceData.total}`);

    const result = await invoiceService.create(invoiceData);

    if (result.success && result.data) {
      console.log('\n✅ Factura creada exitosamente!');
      console.log('   ID:', result.data.id);
      console.log('   Número:', result.data.invoiceNumber);
      console.log('   Cliente:', result.data.customerName);
      console.log('   Email:', result.data.customerEmail);
      console.log('   Total:', `CHF ${result.data.total}`);
      console.log('   Estado:', result.data.status);
      console.log('   Fecha:', result.data.issuedAt);
      
      console.log('\n📄 Detalles completos:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('❌ Error al crear factura:', result.error || 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error en el test:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testCreateInvoice()
    .then(() => {
      console.log('\n✅ Test completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { testCreateInvoice };

