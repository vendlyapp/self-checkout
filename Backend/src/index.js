// src/index.js - Punto de entrada principal para Service Layer Pattern

module.exports = {
  // Controllers
  userController: require('./controllers/UserController'),
  productController: require('./controllers/ProductController'),
  authController: require('./controllers/AuthController'),

  // Services
  userService: require('./services/UserService'),
  productService: require('./services/ProductService'),
  orderService: require('./services/OrderService'),
  authService: require('./services/AuthService'),

  // Middleware
  errorHandler: require('./middleware/errorHandler'),
  authMiddleware: require('./middleware/authMiddleware'),

  // Types
  types: require('./types')
};
