const bwipjs = require('bwip-js');

class BarcodeGenerator {
  /**
   * Genera un código de barras en formato PNG como Data URL
   * @param {string} productId - ID del producto
   * @param {string} productName - Nombre del producto (opcional)
   * @returns {Promise<string>} Data URL del código de barras
   */
  async generateBarcode(productId, productName) {
    try {
      const barcodeData = productId;

      // Generar código de barras usando toBuffer de bwip-js
      const buffer = await bwipjs.toBuffer({
        bcid: 'code128',        // Tipo de código de barras
        text: barcodeData,      // Datos a codificar
        scale: 3,               // Escala
        height: 30,             // Altura
        includetext: true,      // Incluir texto
        textxalign: 'center',   // Alineación del texto
        width: 150              // Ancho
      });

      // Convertir buffer a base64 data URL
      const barcodeDataURL = `data:image/png;base64,${buffer.toString('base64')}`;

      return barcodeDataURL;
    } catch (error) {
      console.error('Error generando código de barras:', error);
      throw new Error('Error al generar código de barras');
    }
  }

  /**
   * Genera un código de barras como Buffer
   * @param {string} productId - ID del producto
   * @param {string} productName - Nombre del producto (opcional)
   * @returns {Promise<Buffer>} Buffer del código de barras
   */
  async generateBarcodeBuffer(productId, productName) {
    try {
      const barcodeData = productId;

      const buffer = await bwipjs.toBuffer({
        bcid: 'code128',        // Tipo de código de barras
        text: barcodeData,       // Datos a codificar
        scale: 3,                // Escala
        height: 30,              // Altura
        includetext: true,       // Incluir texto
        textxalign: 'center',    // Alineación del texto
        width: 150               // Ancho
      });

      return buffer;
    } catch (error) {
      console.error('Error generando código de barras buffer:', error);
      throw new Error('Error al generar código de barras');
    }
  }
}

module.exports = new BarcodeGenerator();
