// src/index.js - Punto de entrada principal para Service Layer Pattern

module.exports = {
  // Controllers
  userController: require('./controllers/UserController'),
  productController: require('./controllers/ProductController'),

  // Services
  userService: require('./services/UserService'),
  productService: require('./services/ProductService'),
  orderService: require('./services/OrderService'),

  // Middleware
  errorHandler: require('./middleware/errorHandler'),

  // Types
  types: require('./types')
};
