const { query } = require('../../lib/database');

/**
 * Servicio para gestionar configuraciones globales de métodos de pago
 * Permite inhabilitar métodos de pago a nivel de plataforma
 */
class GlobalPaymentMethodConfigService {
  /**
   * Obtiene todas las configuraciones globales
   * @returns {Promise<Object>} Lista de configuraciones
   */
  async findAll() {
    try {
      const result = await query(
        'SELECT * FROM "GlobalPaymentMethodConfig" ORDER BY "code" ASC'
      );

      return {
        success: true,
        data: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      console.error('[GlobalPaymentMethodConfigService.findAll] Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene una configuración global por código
   * @param {string} code - Código del método de pago
   * @returns {Promise<Object>} Configuración global
   */
  async findByCode(code) {
    if (!code || !code.trim()) {
      throw new Error('Code der Zahlungsmethode ist erforderlich');
    }

    try {
      const result = await query(
        'SELECT * FROM "GlobalPaymentMethodConfig" WHERE "code" = $1',
        [code.trim()]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          data: null,
          message: 'Globale Konfiguration nicht gefunden'
        };
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('[GlobalPaymentMethodConfigService.findByCode] Error:', error);
      throw error;
    }
  }

  /**
   * Crea o actualiza una configuración global
   * @param {Object} configData - Datos de la configuración
   * @param {string} configData.code - Código del método de pago
   * @param {boolean} configData.disabledGlobally - Si es true, el método está inhabilitado globalmente
   * @param {string} [configData.reason] - Motivo de la inhabilitación (opcional)
   * @returns {Promise<Object>} Configuración creada/actualizada
   */
  async upsert(configData) {
    const { code, disabledGlobally, reason } = configData;

    if (!code || !code.trim()) {
      throw new Error('Code der Zahlungsmethode ist erforderlich');
    }

    if (typeof disabledGlobally !== 'boolean') {
      throw new Error('disabledGlobally muss ein Boolean sein');
    }

    // Bargeld no puede ser deshabilitado globalmente
    if (code.toLowerCase().trim() === 'bargeld' && disabledGlobally) {
      throw new Error('Bargeld (Bargeld) kann nicht global deaktiviert werden');
    }

    try {
      const upsertQuery = `
        INSERT INTO "GlobalPaymentMethodConfig" ("code", "disabledGlobally", "reason", "updatedAt")
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT ("code")
        DO UPDATE SET
          "disabledGlobally" = EXCLUDED."disabledGlobally",
          "reason" = EXCLUDED."reason",
          "updatedAt" = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await query(upsertQuery, [
        code.trim(),
        disabledGlobally,
        reason || null
      ]);

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('[GlobalPaymentMethodConfigService.upsert] Error:', error);
      throw error;
    }
  }

  /**
   * Verifica si un método de pago está deshabilitado globalmente
   * @param {string} code - Código del método de pago
   * @returns {Promise<boolean>} True si está deshabilitado globalmente
   */
  async isGloballyDisabled(code) {
    if (!code || !code.trim()) {
      return false;
    }

    try {
      const result = await query(
        'SELECT "disabledGlobally" FROM "GlobalPaymentMethodConfig" WHERE "code" = $1',
        [code.trim()]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].disabledGlobally === true;
    } catch (error) {
      console.error('[GlobalPaymentMethodConfigService.isGloballyDisabled] Error:', error);
      // En caso de error, asumimos que no está deshabilitado (fail-safe)
      return false;
    }
  }

  /**
   * Obtiene todos los códigos de métodos de pago deshabilitados globalmente
   * @returns {Promise<string[]>} Lista de códigos deshabilitados
   */
  async getDisabledCodes() {
    try {
      const result = await query(
        'SELECT "code" FROM "GlobalPaymentMethodConfig" WHERE "disabledGlobally" = true'
      );

      // Retornar códigos en minúsculas para comparación consistente
      return result.rows.map(row => row.code?.toLowerCase() || '').filter(code => code);
    } catch (error) {
      console.error('[GlobalPaymentMethodConfigService.getDisabledCodes] Error:', error);
      return [];
    }
  }
}

module.exports = new GlobalPaymentMethodConfigService();

