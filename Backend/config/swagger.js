// config/swagger.js - Configuración de Swagger/OpenAPI
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vendly Checkout API',
      version: '2.0.0',
      description: 'API para el sistema de checkout de Vendly - Gestión de productos, usuarios y órdenes con SQL directo para máximo rendimiento',
      contact: {
        name: 'Vendly Team',
        email: 'support@vendly.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.vendly.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['email'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del producto'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto'
            },
            description: {
              type: 'string',
              description: 'Descripción del producto'
            },
            image: {
              type: 'string',
              description: 'URL de la imagen del producto'
            },
            qrCode: {
              type: 'string',
              description: 'Código QR del producto'
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
              default: 0
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del producto',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la orden'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario'
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total de la orden'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        ProductCategory: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la categoría'
            },
            name: {
              type: 'string',
              description: 'Nombre de la categoría'
            },
            count: {
              type: 'integer',
              description: 'Número de productos en la categoría',
              default: 0
            },
            color: {
              type: 'string',
              description: 'Color de la categoría'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            },
            message: {
              type: 'string',
              description: 'Mensaje de respuesta'
            },
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            count: {
              type: 'integer',
              description: 'Cantidad de elementos (para listas)'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Mensaje de error'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'General',
        description: 'Endpoints generales de la API'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios'
      },
      {
        name: 'Products',
        description: 'Gestión de productos'
      },
      {
        name: 'Orders',
        description: 'Gestión de órdenes'
      },
      {
        name: 'Categories',
        description: 'Gestión de categorías de productos'
      },
      {
        name: 'Health',
        description: 'Monitoreo de salud del sistema'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './src/routes/*.js',
    './app.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
