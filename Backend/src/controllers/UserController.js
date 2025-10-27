const userService = require('../services/UserService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de usuarios
 * Maneja todas las operaciones CRUD relacionadas con usuarios del sistema
 * @class UserController
 */
class UserController {
  /**
   * Obtiene todos los usuarios del sistema
   * @route GET /api/users
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de usuarios a retornar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de usuarios
   * @throws {500} Si hay error en el servidor
   */
  async getAllUsers(req, res) {
    try {
      const { limit } = req.query;
      const options = limit ? { limit: parseInt(limit) } : {};

      const result = await userService.findAll(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene un usuario específico por su ID
   * @route GET /api/users/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos del usuario
   * @throws {404} Si el usuario no existe
   * @throws {500} Si hay error en el servidor
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.findById(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo usuario
   * @route POST /api/users
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos del usuario a crear
   * @param {string} req.body.email - Email del usuario
   * @param {string} req.body.password - Contraseña del usuario
   * @param {string} req.body.name - Nombre del usuario
   * @param {string} [req.body.role='customer'] - Rol del usuario (customer|admin)
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el usuario creado
   * @throws {400} Si el email ya está registrado
   * @throws {500} Si hay error en el servidor
   */
  async createUser(req, res) {
    try {
      const result = await userService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('ya está registrado')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo usuario con rol de administrador
   * @route POST /api/users/admin
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos del administrador a crear
   * @param {string} req.body.email - Email del administrador
   * @param {string} req.body.password - Contraseña del administrador
   * @param {string} req.body.name - Nombre del administrador
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el administrador creado
   * @throws {400} Si el email ya está registrado
   * @throws {500} Si hay error en el servidor
   */
  async createAdmin(req, res) {
    try {
      const result = await userService.createAdmin(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('ya está registrado')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza un usuario existente
   * @route PUT /api/users/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del usuario
   * @param {Object} req.body - Datos a actualizar
   * @param {string} [req.body.name] - Nombre del usuario
   * @param {string} [req.body.email] - Email del usuario
   * @param {string} [req.body.role] - Rol del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el usuario actualizado
   * @throws {404} Si el usuario no existe
   * @throws {500} Si hay error en el servidor
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.update(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina un usuario
   * @route DELETE /api/users/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del usuario a eliminar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la eliminación
   * @throws {404} Si el usuario no existe
   * @throws {500} Si hay error en el servidor
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * Retorna conteo total de usuarios, usuarios por rol, etc.
   * @route GET /api/users/stats
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con estadísticas de usuarios
   * @throws {500} Si hay error en el servidor
   */
  async getStats(req, res) {
    try {
      const result = await userService.getStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
