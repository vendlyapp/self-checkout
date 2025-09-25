const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);

    if (response.status === expectedStatus) {
      log(`✅ ${method} ${endpoint} - Status: ${response.status}`, 'green');
      return { success: true, data: response.data };
    } else {
      log(`⚠️  ${method} ${endpoint} - Expected: ${expectedStatus}, Got: ${response.status}`, 'yellow');
      return { success: false, data: response.data };
    }
  } catch (error) {
    if (error.response) {
      log(`❌ ${method} ${endpoint} - Status: ${error.response.status} - ${error.response.data?.error || error.message}`, 'red');
      return { success: false, error: error.response.data };
    } else {
      log(`❌ ${method} ${endpoint} - Network Error: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

async function runAllTests() {
  log('🧪 Iniciando pruebas completas de la API Vendly Checkout v2.0.0', 'blue');
  log('=' * 60, 'blue');

  let passedTests = 0;
  let totalTests = 0;

  // 1. Health Check
  log('\n📊 1. Health Check', 'yellow');
  totalTests++;
  const healthResult = await testEndpoint('GET', '/health');
  if (healthResult.success) passedTests++;

  // 2. API Info
  log('\n📋 2. API Information', 'yellow');
  totalTests++;
  const apiResult = await testEndpoint('GET', '/');
  if (apiResult.success) passedTests++;

  // 3. Categories
  log('\n📁 3. Categories', 'yellow');

  // List categories
  totalTests++;
  const categoriesResult = await testEndpoint('GET', '/api/categories');
  if (categoriesResult.success) passedTests++;

  // Create category
  totalTests++;
  const newCategory = {
    name: 'Test Category',
    icon: '🧪',
    color: '#FF6B6B'
  };
  const createCategoryResult = await testEndpoint('POST', '/api/categories', newCategory, 201);
  if (createCategoryResult.success) passedTests++;

  let categoryId = null;
  if (createCategoryResult.success && createCategoryResult.data?.data?.id) {
    categoryId = createCategoryResult.data.data.id;

    // Get category by ID
    totalTests++;
    const getCategoryResult = await testEndpoint('GET', `/api/categories/${categoryId}`);
    if (getCategoryResult.success) passedTests++;

    // Update category
    totalTests++;
    const updateCategoryData = { name: 'Updated Test Category', color: '#4ECDC4' };
    const updateCategoryResult = await testEndpoint('PUT', `/api/categories/${categoryId}`, updateCategoryData);
    if (updateCategoryResult.success) passedTests++;

    // Delete category
    totalTests++;
    const deleteCategoryResult = await testEndpoint('DELETE', `/api/categories/${categoryId}`);
    if (deleteCategoryResult.success) passedTests++;
  }

  // Category stats
  totalTests++;
  const categoryStatsResult = await testEndpoint('GET', '/api/categories/stats');
  if (categoryStatsResult.success) passedTests++;

  // 4. Products
  log('\n🛍️  4. Products', 'yellow');

  // List products
  totalTests++;
  const productsResult = await testEndpoint('GET', '/api/products');
  if (productsResult.success) passedTests++;

  // Create product
  totalTests++;
  const newProduct = {
    name: 'Test Product',
    description: 'Producto de prueba para testing',
    price: 15.99,
    category: 'Test',
    stock: 50,
    sku: 'TEST-PROD-001',
    supplier: 'Test Supplier',
    location: 'Test Location'
  };
  const createProductResult = await testEndpoint('POST', '/api/products', newProduct, 201);
  if (createProductResult.success) passedTests++;

  let productId = null;
  if (createProductResult.success && createProductResult.data?.data?.id) {
    productId = createProductResult.data.data.id;

    // Get product by ID
    totalTests++;
    const getProductResult = await testEndpoint('GET', `/api/products/${productId}`);
    if (getProductResult.success) passedTests++;

    // Update product
    totalTests++;
    const updateProductData = { name: 'Updated Test Product', price: 19.99 };
    const updateProductResult = await testEndpoint('PUT', `/api/products/${productId}`, updateProductData);
    if (updateProductResult.success) passedTests++;

    // Update stock
    totalTests++;
    const updateStockData = { stock: 75 };
    const updateStockResult = await testEndpoint('PATCH', `/api/products/${productId}/stock`, updateStockData);
    if (updateStockResult.success) passedTests++;

    // Delete product
    totalTests++;
    const deleteProductResult = await testEndpoint('DELETE', `/api/products/${productId}`);
    if (deleteProductResult.success) passedTests++;
  }

  // Available products
  totalTests++;
  const availableProductsResult = await testEndpoint('GET', '/api/products/available');
  if (availableProductsResult.success) passedTests++;

  // Product stats
  totalTests++;
  const productStatsResult = await testEndpoint('GET', '/api/products/stats');
  if (productStatsResult.success) passedTests++;

  // Search products
  totalTests++;
  const searchProductsResult = await testEndpoint('GET', '/api/products?search=test');
  if (searchProductsResult.success) passedTests++;

  // 5. Users
  log('\n👥 5. Users', 'yellow');

  // List users
  totalTests++;
  const usersResult = await testEndpoint('GET', '/api/users');
  if (usersResult.success) passedTests++;

  // Create user
  totalTests++;
  const newUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };
  const createUserResult = await testEndpoint('POST', '/api/users', newUser, 201);
  if (createUserResult.success) passedTests++;

  let userId = null;
  if (createUserResult.success && createUserResult.data?.data?.id) {
    userId = createUserResult.data.data.id;

    // Get user by ID
    totalTests++;
    const getUserResult = await testEndpoint('GET', `/api/users/${userId}`);
    if (getUserResult.success) passedTests++;

    // Update user
    totalTests++;
    const updateUserData = { name: 'Updated Test User' };
    const updateUserResult = await testEndpoint('PUT', `/api/users/${userId}`, updateUserData);
    if (updateUserResult.success) passedTests++;

    // Delete user
    totalTests++;
    const deleteUserResult = await testEndpoint('DELETE', `/api/users/${userId}`);
    if (deleteUserResult.success) passedTests++;
  }

  // Create admin
  totalTests++;
  const newAdmin = {
    email: 'admin@example.com',
    password: 'adminpassword123',
    name: 'Test Admin'
  };
  const createAdminResult = await testEndpoint('POST', '/api/users/admin', newAdmin, 201);
  if (createAdminResult.success) passedTests++;

  // Delete admin if created
  if (createAdminResult.success && createAdminResult.data?.data?.id) {
    totalTests++;
    const deleteAdminResult = await testEndpoint('DELETE', `/api/users/${createAdminResult.data.data.id}`);
    if (deleteAdminResult.success) passedTests++;
  }

  // User stats
  totalTests++;
  const userStatsResult = await testEndpoint('GET', '/api/users/stats');
  if (userStatsResult.success) passedTests++;

  // 6. Orders
  log('\n📦 6. Orders', 'yellow');

  // List orders
  totalTests++;
  const ordersResult = await testEndpoint('GET', '/api/orders');
  if (ordersResult.success) passedTests++;

  // Order stats
  totalTests++;
  const orderStatsResult = await testEndpoint('GET', '/api/orders/stats');
  if (orderStatsResult.success) passedTests++;

  // Recent orders
  totalTests++;
  const recentOrdersResult = await testEndpoint('GET', '/api/orders/recent');
  if (recentOrdersResult.success) passedTests++;

  // 7. Swagger Documentation
  log('\n📚 7. Documentation', 'yellow');
  totalTests++;
  const docsResult = await testEndpoint('GET', '/api-docs');
  if (docsResult.success) passedTests++;

  // Resumen final
  log('\n' + '=' * 60, 'blue');
  log(`📊 Resumen de Pruebas: ${passedTests}/${totalTests} exitosas`, 'blue');

  if (passedTests === totalTests) {
    log('🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.', 'green');
  } else {
    log(`⚠️  ${totalTests - passedTests} pruebas fallaron. Revisar los errores arriba.`, 'yellow');
  }

  log('\n🔗 Endpoints disponibles:', 'blue');
  log('  • Health: http://localhost:3000/health', 'blue');
  log('  • API Info: http://localhost:3000/', 'blue');
  log('  • Swagger Docs: http://localhost:3000/api-docs', 'blue');
  log('  • Products: http://localhost:3000/api/products', 'blue');
  log('  • Categories: http://localhost:3000/api/categories', 'blue');
  log('  • Users: http://localhost:3000/api/users', 'blue');
  log('  • Orders: http://localhost:3000/api/orders', 'blue');
}

// Ejecutar pruebas
runAllTests().catch(error => {
  log(`❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
