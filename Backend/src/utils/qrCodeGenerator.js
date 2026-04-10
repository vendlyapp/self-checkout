const QRCode = require('qrcode');
const logger = require('./logger');

class QRCodeGenerator {
  /**
   * Generate a QR code for a product as a Data URL.
   * @param {string} productId - Product UUID
   * @param {string} productName - Product name (optional)
   * @param {string} url - Full URL to encode (falls back to productId)
   * @returns {Promise<string>} QR code data URL
   */
  async generateQRCode(productId, productName, url = null) {
    try {
      const qrData = url || productId;

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'L',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 256,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      return qrCodeDataURL;
    } catch (error) {
      logger.error('Failed to generate QR code', { error: error.message });
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate a QR code for a product as a Buffer.
   * @param {string} productId - Product UUID
   * @param {string} productName - Product name (optional)
   * @param {string} url - Full URL to encode (falls back to productId)
   * @returns {Promise<Buffer>} QR code PNG buffer
   */
  async generateQRCodeBuffer(productId, productName, url = null) {
    try {
      const qrData = url || productId;

      const buffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'L',
        type: 'png',
        quality: 0.92,
        margin: 1,
        width: 256,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to generate QR code buffer', { error: error.message });
      throw new Error('Failed to generate QR code');
    }
  }
}

module.exports = new QRCodeGenerator();
