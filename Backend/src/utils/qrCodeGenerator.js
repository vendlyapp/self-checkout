const QRCode = require('qrcode');

class QRCodeGenerator {
  async generateQRCode(productId, productName) {
    try {
      const qrData = productId;

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

  async generateQRCodeBuffer(productId, productName) {
    try {
      const qrData = productId;

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

