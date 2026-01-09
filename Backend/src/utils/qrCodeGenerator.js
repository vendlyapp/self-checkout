const QRCode = require('qrcode');

class QRCodeGenerator {
  /**
   * Genera un QR code para un producto con URL completa
   * @param {string} productId - ID del producto (UUID)
   * @param {string} productName - Nombre del producto (opcional)
   * @param {string} url - URL completa que debe contener el QR (opcional, si no se proporciona usa solo el ID)
   * @returns {Promise<string>} Data URL del QR code
   */
  async generateQRCode(productId, productName, url = null) {
    try {
      // Si se proporciona una URL, usarla. Si no, usar solo el productId (compatibilidad hacia atrás)
      const qrData = url || productId;

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'L',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 256,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generando código QR:', error);
      throw new Error('Error al generar código QR');
    }
  }

  /**
   * Genera un QR code buffer para un producto con URL completa
   * @param {string} productId - ID del producto (UUID)
   * @param {string} productName - Nombre del producto (opcional)
   * @param {string} url - URL completa que debe contener el QR (opcional, si no se proporciona usa solo el ID)
   * @returns {Promise<Buffer>} Buffer del QR code
   */
  async generateQRCodeBuffer(productId, productName, url = null) {
    try {
      // Si se proporciona una URL, usarla. Si no, usar solo el productId (compatibilidad hacia atrás)
      const qrData = url || productId;

      const buffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'L',
        type: 'png',
        quality: 0.92,
        margin: 1,
        width: 256
      });

      return buffer;
    } catch (error) {
      console.error('Error generando código QR buffer:', error);
      throw new Error('Error al generar código QR');
    }
  }
}

module.exports = new QRCodeGenerator();

