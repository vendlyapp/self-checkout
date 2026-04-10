const bwipjs = require('bwip-js');
const logger = require('./logger');

class BarcodeGenerator {
  /**
   * Generate a barcode as a PNG Data URL.
   * @param {string} productId - Product ID to encode
   * @param {string} productName - Product name (optional, unused)
   * @returns {Promise<string>} Barcode data URL
   */
  async generateBarcode(productId, productName) {
    try {
      const buffer = await bwipjs.toBuffer({
        bcid: 'code128',
        text: productId,
        scale: 3,
        height: 30,
        includetext: true,
        textxalign: 'center',
        width: 150,
      });

      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (error) {
      logger.error('Failed to generate barcode', { error: error.message });
      throw new Error('Failed to generate barcode');
    }
  }

  /**
   * Generate a barcode as a Buffer.
   * @param {string} productId - Product ID to encode
   * @param {string} productName - Product name (optional, unused)
   * @returns {Promise<Buffer>} Barcode PNG buffer
   */
  async generateBarcodeBuffer(productId, productName) {
    try {
      const buffer = await bwipjs.toBuffer({
        bcid: 'code128',
        text: productId,
        scale: 3,
        height: 30,
        includetext: true,
        textxalign: 'center',
        width: 150,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to generate barcode buffer', { error: error.message });
      throw new Error('Failed to generate barcode');
    }
  }
}

module.exports = new BarcodeGenerator();
