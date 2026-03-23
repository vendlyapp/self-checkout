const { SwissQRBill: SwissQRBillSVG, SwissQRCode } = require('swissqrbill/svg');
const { SwissQRBill: SwissQRBillPDF } = require('swissqrbill/pdf');
const { calculateQRReferenceChecksum, formatQRReference, isQRIBAN, isIBANValid } = require('swissqrbill/utils');
const PDFDocument = require('pdfkit');

/**
 * Generates a 27-digit QRR reference with the orderId embedded.
 * The orderId (numeric) is right-justified in 26 digits; digit 27 is Mod10 recursive check digit.
 *
 * @param {string|number} orderId  - The order's numeric ID (or any unique number ≤ 26 digits)
 * @returns {string} 27-digit QRR reference (no spaces)
 */
function generateQRReference(orderId) {
  const numericId = String(orderId).replace(/\D/g, '');
  if (!numericId || numericId.length > 26) {
    throw new Error(`orderId must be numeric and at most 26 digits. Got: "${orderId}"`);
  }
  const padded = numericId.padStart(26, '0'); // 26 digits
  const checkDigit = calculateQRReferenceChecksum(padded);
  return padded + checkDigit; // 27 digits total
}

/**
 * Extracts the original orderId from a QRR reference.
 * Strips leading zeros from the 26-digit body (excludes the last check digit).
 *
 * @param {string} qrrReference - 27-digit QRR reference (with or without spaces)
 * @returns {string} orderId as a string (without leading zeros)
 */
function extractOrderIdFromQRR(qrrReference) {
  const clean = qrrReference.replace(/\s/g, '');
  if (clean.length !== 27) {
    throw new Error(`QRR reference must be 27 digits. Got ${clean.length} digits.`);
  }
  const body = clean.slice(0, 26); // drop check digit
  return String(parseInt(body, 10)); // remove leading zeros
}

/**
 * Validates a QR-IBAN (IID must be in range 30000–31999).
 *
 * @param {string} qrIban
 * @returns {{ valid: boolean, error?: string }}
 */
function validateQRIBAN(qrIban) {
  const clean = qrIban.replace(/\s/g, '');
  if (!isIBANValid(clean)) {
    return { valid: false, error: 'IBAN format is invalid.' };
  }
  if (!isQRIBAN(clean)) {
    return { valid: false, error: 'This IBAN is not a QR-IBAN. The IID (digits 5–9) must be in range 30000–31999. Please request a QR-IBAN from your bank.' };
  }
  return { valid: true };
}

/**
 * Builds the swissqrbill data object from creditor config + invoice data.
 * @private
 */
function _buildQRData({ creditorConfig, amount, reference, additionalInfo, debtor }) {
  const { qrIban, creditorName, creditorStreet, creditorHouseNo, creditorZip, creditorCity, creditorCountry = 'CH' } = creditorConfig;

  const data = {
    amount: Math.round(amount * 100) / 100, // ensure 2 decimals
    currency: 'CHF',
    creditor: {
      account: qrIban.replace(/\s/g, ''),
      name: creditorName,
      address: creditorStreet,
      buildingNumber: creditorHouseNo,
      zip: String(creditorZip),
      city: creditorCity,
      country: creditorCountry,
    },
    reference,
  };

  if (additionalInfo) {
    data.additionalInformation = String(additionalInfo).slice(0, 140);
  }

  if (debtor?.name) {
    data.debtor = {
      name: debtor.name,
      address: debtor.address || '',
      buildingNumber: debtor.buildingNumber || '',
      zip: String(debtor.zip || ''),
      city: debtor.city || '',
      country: debtor.country || 'CH',
    };
  }

  return data;
}

/**
 * Generates just the QR code square as an SVG string (no full bill layout).
 * Used for kiosk screen display — large, clean, scannable.
 *
 * @param {object} params
 * @param {object} params.creditorConfig   - Store's payment method config
 * @param {number} params.amount           - Order total in CHF
 * @param {string} params.reference        - 27-digit QRR reference
 * @param {string} [params.additionalInfo] - e.g. "Bestellung #1234"
 * @param {object} [params.debtor]         - Customer data (optional)
 * @returns {string} SVG markup string (just the QR square)
 */
function generateQROnlySVG({ creditorConfig, amount, reference, additionalInfo, debtor }) {
  const data = _buildQRData({ creditorConfig, amount, reference, additionalInfo, debtor });
  const qr = new SwissQRCode(data);
  return qr.toString();
}

/**
 * Generates the full Swiss QR Bill as an SVG string (Receipt + Payment part).
 * Used for invoice print section.
 *
 * @param {object} params
 * @param {object} params.creditorConfig   - Store's payment method config (qrIban, creditorName, etc.)
 * @param {number} params.amount           - Order total in CHF
 * @param {string} params.reference        - 27-digit QRR reference
 * @param {string} [params.additionalInfo] - e.g. "Bestellung #1234" (max 140 chars)
 * @param {object} [params.debtor]         - Customer data (optional, auto-fills in banking app)
 * @param {string} [params.language]       - 'DE' | 'FR' | 'IT' | 'EN' (default: 'DE')
 * @returns {string} SVG markup string
 */
function generateQRCodeSVG({ creditorConfig, amount, reference, additionalInfo, debtor, language = 'DE' }) {
  const data = _buildQRData({ creditorConfig, amount, reference, additionalInfo, debtor });
  const qr = new SwissQRBillSVG(data, { language });
  return qr.toString();
}

/**
 * Generates the Swiss QR Bill section as a PDF Buffer.
 * Can be sent as a downloadable PDF or used for invoice attachment.
 *
 * @param {object} params
 * @param {object} params.creditorConfig   - Store's payment method config
 * @param {number} params.amount           - Order total in CHF
 * @param {string} params.reference        - 27-digit QRR reference
 * @param {string} [params.additionalInfo] - Additional info text
 * @param {object} [params.debtor]         - Customer data
 * @param {string} [params.language]       - 'DE' | 'FR' | 'IT' | 'EN' (default: 'DE')
 * @returns {Promise<Buffer>} PDF buffer
 */
function generateQRBillPDF({ creditorConfig, amount, reference, additionalInfo, debtor, language = 'DE' }) {
  return new Promise((resolve, reject) => {
    const data = _buildQRData({ creditorConfig, amount, reference, additionalInfo, debtor });

    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 0 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const qrBill = new SwissQRBillPDF(data, { language });
    qrBill.attachTo(doc);
    doc.end();
  });
}

module.exports = {
  generateQRReference,
  extractOrderIdFromQRR,
  validateQRIBAN,
  generateQROnlySVG,
  generateQRCodeSVG,
  generateQRBillPDF,
};
