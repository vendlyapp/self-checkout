/**
 * InvoicePDFService — genera un PDF de factura suiza con pdfkit
 *
 * Estructura según estándar Galaxus/SIX:
 *   - SIEMPRE 2 páginas A4:
 *     Página 1: Detalle de pedido (tabla artículos + totales MwSt)
 *     Página 2: Información de pago según método:
 *       · QR-Rechnung → datos bancarios + QR Bill anclado al fondo (estándar SIX 105mm)
 *       · Banküberweisung / IBAN → datos bancarios
 *       · Bargeld (efectivo) → recibo de caja personalizado
 *       · TWINT / Debit/Credit / otros → confirmación de pago + referencia
 *
 * TODO el layout se ajusta AQUÍ, no en el frontend.
 */

const PDFDocument = require('pdfkit');
const { SwissQRBill: SwissQRBillPDF } = require('swissqrbill/pdf');
const { normalizeSwissMwStRate } = require('../utils/swissMwSt');

// ─── Constantes de layout ────────────────────────────────────────────────────

const MM = 2.8346;           // 1mm en puntos PDF
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 14 * MM;
const CONTENT_W = A4_W - MARGIN * 2;

// El QR Bill suizo siempre ocupa exactamente 105mm de alto × 210mm de ancho (estándar SIX)
const QR_BILL_H = 105 * MM;
// Posición Y donde empieza el QR Bill: fondo de página menos su altura
const QR_BILL_Y = A4_H - QR_BILL_H;

// Colores
const C_TEXT   = '#000000';
const C_LABEL  = '#333333';
const C_MUTED  = '#555555';
const C_ACCENT = '#25D076';   // verde Vendly

// ─── Helpers de formato ──────────────────────────────────────────────────────

function fmtCHF(n) {
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtRate(r) {
  const rate = normalizeSwissMwStRate(r);
  if (rate === 0) return '0%';
  if (rate >= 0.0795 && rate <= 0.0815) return '8.1%';
  if (Math.abs(rate - 0.026) < 0.0005) return '2.6%';
  return (rate * 100).toFixed(1) + '%';
}

function calcMwStBreakdown(items) {
  const groups = {};
  for (const item of items) {
    const rate = normalizeSwissMwStRate(item.mwstRate);
    const key = `r_${rate.toFixed(4)}`;
    if (!groups[key]) groups[key] = { rate, brutto: 0 };
    groups[key].brutto += item.totalBrutto;
  }
  return Object.values(groups)
    .map((g) => {
      const netto = g.rate === 0 ? g.brutto : g.brutto / (1 + g.rate);
      return { ...g, netto, mwst: g.brutto - netto };
    })
    .sort((a, b) => b.rate - a.rate);
}

// ─── Componentes de página ───────────────────────────────────────────────────

function drawLetterMark(doc, name, x, y) {
  const letter = (name || 'V').charAt(0).toUpperCase();
  const s = 11 * MM;
  doc.save()
    .rect(x, y, s, s).fillColor(C_ACCENT).fill()
    .font('Helvetica-Bold').fontSize(13).fillColor('#ffffff')
    .text(letter, x, y + 2.5 * MM, { width: s, align: 'center' })
    .restore();
}

/**
 * Cabecera: logo (izq) | datos empresa (der) | línea separadora
 * Retorna la Y donde termina la cabecera.
 */
function drawPageHeader(doc, invoice, yStart) {
  const { issuer } = invoice;
  const logoColW = 36 * MM;
  const gap = 4 * MM;
  const rightBlockX = MARGIN + logoColW + gap;
  const rightBlockW = CONTENT_W - logoColW - gap;
  const logoH = 18 * MM;

  if (invoice.storeLogo) {
    try {
      doc.image(invoice.storeLogo, MARGIN, yStart, { fit: [logoColW - 2 * MM, logoH] });
    } catch (_) {
      drawLetterMark(doc, issuer.name, MARGIN, yStart);
    }
  } else {
    drawLetterMark(doc, issuer.name, MARGIN, yStart);
  }

  let ty = yStart;
  if (issuer.website) {
    doc.font('Helvetica').fontSize(8).fillColor(C_TEXT)
      .text(issuer.website, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(issuer.website, { width: rightBlockW, fontSize: 8 }) + 1;
  }
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C_TEXT)
    .text(issuer.name || '', rightBlockX, ty, { width: rightBlockW, align: 'right' });
  ty += doc.heightOfString(issuer.name || ' ', { width: rightBlockW, fontSize: 10 }) + 1;

  doc.font('Helvetica').fontSize(9).fillColor(C_TEXT);
  if (issuer.street) {
    doc.text(issuer.street, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(issuer.street, { width: rightBlockW, fontSize: 9 }) + 1;
  }
  if (issuer.zip || issuer.city) {
    const line = `${issuer.zip || ''} ${issuer.city || ''}`.trim();
    doc.text(line, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(line, { width: rightBlockW, fontSize: 9 }) + 1;
  }
  if (issuer.phone || issuer.email) {
    const contact = [issuer.phone ? `Tel. ${issuer.phone}` : null, issuer.email]
      .filter(Boolean).join(' · ');
    doc.text(contact, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(contact, { width: rightBlockW, fontSize: 9 }) + 1;
  }

  const headerBottom = Math.max(yStart + logoH + 2 * MM, ty) + 3 * MM;
  doc.moveTo(MARGIN, headerBottom)
    .lineTo(MARGIN + CONTENT_W, headerBottom)
    .strokeColor('#cccccc').lineWidth(0.5).stroke();

  return headerBottom + 4 * MM;
}

/** Pie de página: línea + datos empresa condensados */
function drawPageFooter(doc, invoice) {
  const { issuer } = invoice;
  const y = A4_H - MARGIN - 10;
  doc.moveTo(MARGIN, y - 4)
    .lineTo(MARGIN + CONTENT_W, y - 4)
    .strokeColor('#cccccc').lineWidth(0.5).stroke();
  const parts = [
    issuer.name,
    issuer.street || null,
    (issuer.zip || issuer.city) ? `${issuer.zip || ''} ${issuer.city || ''}`.trim() : null,
    issuer.mwstNummer || null,
    issuer.phone ? `Tel. ${issuer.phone}` : null,
    issuer.email || null,
  ].filter(Boolean);
  doc.font('Helvetica').fontSize(7).fillColor(C_MUTED)
    .text(parts.join(' · '), MARGIN, y, { width: CONTENT_W, align: 'left' });
}

/** Columnas de la tabla de artículos */
function tableColumnXs() {
  const right = MARGIN + CONTENT_W;
  const wInkl = 24 * MM;
  const wExkl = 24 * MM;
  const wMwst = 20 * MM;
  const wQty  = 16 * MM;
  const colInkl = right - wInkl;
  const colExkl = colInkl - wExkl;
  const colMwst = colExkl - wMwst;
  const colQty  = colMwst - wQty;
  const colDesc = MARGIN;
  return {
    colDesc, colQty, colMwst, colExkl, colInkl,
    wQty, wMwst, wExkl, wInkl,
    descW: Math.max(80, colQty - colDesc - 6),
  };
}

// ─── Página 1: Detalle del pedido ────────────────────────────────────────────

function drawPage1(doc, invoice, breakdown, totalBrutto, totalNetto, discountAmount) {
  const { issuer, recipient, items } = invoice;
  const docType = invoice.documentType || 'Rechnung';
  const cols = tableColumnXs();

  let y = MARGIN;
  y = drawPageHeader(doc, invoice, y);

  // ── Bloque destinatario (izq) + Título/meta (der) ──
  const leftW  = CONTENT_W * 0.42;
  const rightX = MARGIN + leftW + 8 * MM;
  const rightW = MARGIN + CONTENT_W - rightX;

  // Título grande estilo Galaxus
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C_TEXT)
    .text(`${docType} ${invoice.nummer}`, MARGIN, y, { width: CONTENT_W });
  y += doc.heightOfString(`${docType} ${invoice.nummer}`, { width: CONTENT_W, fontSize: 22 }) + 6 * MM;

  // Meta izquierda (labels en columna 1, valores en columna 2)
  const metaRows = [
    ['Rechnungsdatum', fmtDate(invoice.datum)],
    invoice.isDeferredPayment && invoice.faelligkeitsDatum
      ? ['Fälligkeitsdatum', fmtDate(invoice.faelligkeitsDatum)] : null,
    invoice.leistungsDatum && fmtDate(invoice.leistungsDatum) !== fmtDate(invoice.datum)
      ? ['Leistungsdatum', fmtDate(invoice.leistungsDatum)] : null,
    invoice.orderId ? ['Auftrag', String(invoice.orderId).slice(0, 8).toUpperCase()] : null,
    issuer.mwstNummer ? ['MwSt-Nr./USt-ID', issuer.mwstNummer] : null,
    invoice.zahlungsfrist ? ['Zahlungsbedingungen', `${invoice.zahlungsfrist} Tage netto`] : null,
    ['Währung', invoice.waehrung || 'CHF'],
    invoice.paymentMethodDisplay && invoice.paymentMethodDisplay !== '—'
      ? ['Zahlungsart', invoice.paymentMethodDisplay] : null,
  ].filter(Boolean);

  const metaLabelW = 56 * MM;
  const metaValW   = leftW - metaLabelW;
  const metaStartY = y;
  let metaY = metaStartY;

  for (const [label, value] of metaRows) {
    doc.font('Helvetica').fontSize(8.5).fillColor(C_LABEL)
      .text(label, MARGIN, metaY, { width: metaLabelW });
    doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
      .text(String(value), MARGIN + metaLabelW, metaY, { width: metaValW });
    metaY += 12;
  }

  // Destinatario derecha (alineado al inicio del bloque meta)
  let recY = metaStartY;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C_TEXT)
    .text(recipient.name || '', rightX, recY, { width: rightW });
  recY += doc.heightOfString(recipient.name || ' ', { width: rightW, fontSize: 10 }) + 2;

  doc.font('Helvetica').fontSize(9.5).fillColor(C_TEXT);
  if (recipient.street) {
    doc.text(recipient.street, rightX, recY, { width: rightW });
    recY += 13;
  }
  if (recipient.zip || recipient.city) {
    doc.text(`${recipient.zip || ''} ${recipient.city || ''}`.trim(), rightX, recY, { width: rightW });
    recY += 13;
  }
  if (recipient.country) {
    doc.text(recipient.country, rightX, recY, { width: rightW });
    recY += 13;
  }

  y = Math.max(metaY, recY) + 7 * MM;

  // ── Tabla artículos ──
  // Cabecera de tabla
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
  y += 4;
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C_LABEL);
  doc.text('Beschreibung', cols.colDesc, y, { width: cols.descW });
  doc.text('Menge',       cols.colQty,  y, { width: cols.wQty,  align: 'right' });
  doc.text('MwSt.',       cols.colMwst, y, { width: cols.wMwst, align: 'right' });
  doc.text('Preis exkl.', cols.colExkl, y, { width: cols.wExkl, align: 'right' });
  doc.text('Preis inkl.', cols.colInkl, y, { width: cols.wInkl, align: 'right' });
  y += 10;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
  y += 5;

  // Filas — el footer ocupa ~15mm, reservamos espacio
  const PAGE_BOTTOM = A4_H - MARGIN - 15 * MM;

  for (const item of items || []) {
    const r = normalizeSwissMwStRate(item.mwstRate);
    const nettoUnit  = r === 0 ? (item.unitPrice || 0) : (item.unitPrice || 0) / (1 + r);
    const nettoTotal = nettoUnit * (item.quantity || 1);

    const nameH   = doc.heightOfString(item.description || '', { width: cols.descW, fontSize: 8.5 });
    const detailH = item.detail
      ? doc.heightOfString(item.detail, { width: cols.descW, fontSize: 7 }) + 2
      : 0;
    const rowH = Math.max(nameH + detailH + 4, 16);

    // Si no cabe, nueva página (caso con muchos artículos)
    if (y + rowH > PAGE_BOTTOM) {
      drawPageFooter(doc, invoice);
      doc.addPage();
      y = MARGIN;
      y = drawPageHeader(doc, invoice, y);
      // Re-dibujar cabecera de tabla
      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
      y += 4;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C_LABEL);
      doc.text('Beschreibung', cols.colDesc, y, { width: cols.descW });
      doc.text('Menge',       cols.colQty,  y, { width: cols.wQty,  align: 'right' });
      doc.text('MwSt.',       cols.colMwst, y, { width: cols.wMwst, align: 'right' });
      doc.text('Preis exkl.', cols.colExkl, y, { width: cols.wExkl, align: 'right' });
      doc.text('Preis inkl.', cols.colInkl, y, { width: cols.wInkl, align: 'right' });
      y += 10;
      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
      y += 5;
    }

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
      .text(item.description || '', cols.colDesc, y + 2, { width: cols.descW });
    if (item.detail) {
      doc.font('Helvetica').fontSize(7).fillColor(C_MUTED)
        .text(item.detail, cols.colDesc, y + 2 + nameH, { width: cols.descW });
    }
    doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
      .text(String(item.quantity || 1), cols.colQty,  y + 2, { width: cols.wQty,  align: 'right' });
    doc.text(fmtRate(item.mwstRate),      cols.colMwst, y + 2, { width: cols.wMwst, align: 'right' });
    doc.text(fmtCHF(nettoTotal),          cols.colExkl, y + 2, { width: cols.wExkl, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
      .text(fmtCHF(item.totalBrutto || 0), cols.colInkl, y + 2, { width: cols.wInkl, align: 'right' });

    y += rowH;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#eeeeee').lineWidth(0.3).stroke();
    y += 2;
  }

  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
  y += 5 * MM;

  // ── Bloque de totales (derecha) ──
  const totW  = 125 * MM;
  const totX  = MARGIN + CONTENT_W - totW;
  const col1W = totW - 52 * MM;

  // Cabecera columnas
  doc.font('Helvetica-Bold').fontSize(7).fillColor(C_LABEL);
  doc.text('Betrag exkl.', totX + col1W,          y, { width: 24 * MM, align: 'right' });
  doc.text('Betrag inkl.', totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
  y += 9;
  doc.moveTo(totX, y).lineTo(totX + totW, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
  y += 4;

  // Fila Gesamtbetrag
  doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
    .text('Gesamtbetrag', totX, y, { width: col1W });
  doc.text(fmtCHF(totalNetto),   totX + col1W,          y, { width: 24 * MM, align: 'right' });
  doc.text(fmtCHF(totalBrutto),  totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
  y += 11;

  // Desglose MwSt por tasa
  doc.font('Helvetica').fontSize(7.5).fillColor(C_LABEL)
    .text('Gesamtbetrag enthält folgende Mehrwertsteuer:', totX, y, { width: totW });
  y += 10;
  for (const g of breakdown) {
    doc.font('Helvetica').fontSize(8).fillColor(C_TEXT)
      .text(`MwSt. ${fmtRate(g.rate)}`, totX, y, { width: col1W });
    doc.text(fmtCHF(g.mwst), totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
    y += 10;
  }

  if (discountAmount > 0) {
    doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
      .text('Rabatt', totX, y, { width: col1W });
    doc.text(`− ${fmtCHF(discountAmount)}`, totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
    y += 11;
  }

  // Línea y total final
  y += 2;
  doc.moveTo(totX, y).lineTo(totX + totW, y).strokeColor(C_TEXT).lineWidth(0.75).stroke();
  y += 5;
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
    .text(`Total aller Lieferungen und Leistungen ${invoice.waehrung || 'CHF'}`, totX, y, { width: col1W });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C_TEXT)
    .text(fmtCHF(totalBrutto), totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
  y += 13;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C_TEXT)
    .text('Rechnungsbetrag', totX, y, { width: col1W });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C_TEXT)
    .text(fmtCHF(totalBrutto), totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
  y += 12 * MM;

  // Notas opcionales
  if (invoice.notes) {
    doc.font('Helvetica').fontSize(8).fillColor(C_MUTED)
      .text(invoice.notes, MARGIN, y, { width: CONTENT_W });
    y += doc.heightOfString(invoice.notes, { width: CONTENT_W, fontSize: 8 }) + 5 * MM;
  }

  drawPageFooter(doc, invoice);
}

// ─── Página 2: Información de pago según método ──────────────────────────────

/**
 * Dibuja el bloque de información bancaria en la página 2.
 * Retorna la Y después del bloque.
 */
function drawBankInfo(doc, invoice, issuer, docType, y, labelW = 85) {
  const bankRows = [
    ['Zugunsten von', [
      issuer.name,
      issuer.street,
      (issuer.zip || issuer.city) ? `CH-${issuer.zip || ''} ${issuer.city || ''}`.trim() : null,
    ].filter(Boolean).join(', ')],
    issuer.iban ? ['IBAN', issuer.iban] : null,
    invoice.referenz ? ['Verwendungszweck', `${docType} ${invoice.nummer}`] : null,
    [`Betrag offen`, `${invoice.waehrung || 'CHF'} ${fmtCHF(invoice.totalBrutto || 0)}`],
  ].filter(Boolean);

  for (const [label, value] of bankRows) {
    doc.font('Helvetica').fontSize(8.5).fillColor(C_LABEL)
      .text(label, MARGIN, y, { width: labelW });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
      .text(value, MARGIN + labelW + 4, y, { width: CONTENT_W - labelW - 4 });
    y += 13;
  }
  return y;
}

/**
 * Página 2 para QR-Rechnung:
 * - Header
 * - "Verwenden Sie die Zahlungsinformationen unten."
 * - Subtítulo + instrucción
 * - Filas bancarias
 * - QR Bill anclado al fondo (estándar SIX: Y = A4_H - 105mm)
 */
function drawPage2_QRRechnung(doc, invoice, qrCreditorConfig) {
  const { issuer } = invoice;
  const docType = invoice.documentType || 'Rechnung';

  doc.addPage();
  let y = MARGIN;
  y = drawPageHeader(doc, invoice, y);

  // Frase introductoria (igual que Galaxus)
  doc.font('Helvetica').fontSize(9).fillColor(C_TEXT)
    .text('Verwenden Sie die Zahlungsinformationen unten.', MARGIN, y, { width: CONTENT_W });
  y += doc.heightOfString('Verwenden Sie die Zahlungsinformationen unten.', { width: CONTENT_W, fontSize: 9 }) + 10 * MM;

  // Subtítulo
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C_TEXT)
    .text('QR-Rechnung', MARGIN, y, { width: CONTENT_W });
  y += 16;

  // Instrucción
  const instrText = 'Sie können diese Informationen verwenden, um die Zahlung über Online-Banking oder einer Schweizer Banking-App (UBS, ZKB, Raiffeisen, PostFinance) zu tätigen. Vergessen Sie nicht, die Referenz anzugeben.';
  doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
    .text(instrText, MARGIN, y, { width: CONTENT_W });
  y += doc.heightOfString(instrText, { width: CONTENT_W, fontSize: 8.5 }) + 8;

  // Filas bancarias
  y = drawBankInfo(doc, invoice, issuer, docType, y);

  // ── QR Bill anclado al fondo de la página (estándar SIX) ──
  const amount       = Math.round((invoice.totalBrutto || 0) * 100) / 100;
  const reference    = invoice.referenz || '';
  const additionalInfo = `${docType} ${invoice.nummer}`.slice(0, 140);

  const qrData = {
    amount,
    currency: 'CHF',
    creditor: {
      account:         (qrCreditorConfig.qrIban || '').replace(/\s/g, ''),
      name:            qrCreditorConfig.creditorName,
      address:         qrCreditorConfig.creditorStreet,
      buildingNumber:  qrCreditorConfig.creditorHouseNo,
      zip:             String(qrCreditorConfig.creditorZip),
      city:            qrCreditorConfig.creditorCity,
      country:         qrCreditorConfig.creditorCountry || 'CH',
    },
    reference,
    additionalInformation: additionalInfo,
  };

  if (invoice.recipient?.name) {
    qrData.debtor = {
      name:           invoice.recipient.name,
      address:        invoice.recipient.street || '',
      buildingNumber: '',
      zip:            String(invoice.recipient.zip || ''),
      city:           invoice.recipient.city || '',
      country:        'CH',
    };
  }

  // swissqrbill hereda fillColor/strokeColor del doc — forzar negro
  doc.fillColor('black').strokeColor('black').opacity(1);

  const qrBill = new SwissQRBillPDF(qrData, { language: 'DE', outlines: true, scissors: true });
  // attachTo(doc, x, y): y = A4_H - 105mm para anclar al fondo
  qrBill.attachTo(doc, 0, QR_BILL_Y);
}

/**
 * Página 2 para Bargeld (efectivo):
 * - Header
 * - "Verwenden Sie die Zahlungsinformationen unten."
 * - Caja grande "KASSENBON" con fecha, número, importe
 * - Sello/firma opcional
 */
function drawPage2_Bargeld(doc, invoice) {
  const { issuer, recipient } = invoice;
  const docType = invoice.documentType || 'Rechnung';

  doc.addPage();
  let y = MARGIN;
  y = drawPageHeader(doc, invoice, y);

  doc.font('Helvetica').fontSize(9).fillColor(C_TEXT)
    .text('Verwenden Sie die Zahlungsinformationen unten.', MARGIN, y, { width: CONTENT_W });
  y += 14 + 10 * MM;

  // Caja de recibo de efectivo
  const boxX = MARGIN + CONTENT_W / 2 - 60 * MM;
  const boxW = 120 * MM;
  const boxY = y;

  doc.font('Helvetica-Bold').fontSize(14).fillColor(C_TEXT)
    .text('KASSENBON', boxX, y, { width: boxW, align: 'center' });
  y += 20;

  doc.font('Helvetica').fontSize(9).fillColor(C_MUTED)
    .text(`${docType} ${invoice.nummer}`, boxX, y, { width: boxW, align: 'center' });
  y += 14;

  doc.font('Helvetica').fontSize(9).fillColor(C_TEXT)
    .text(`Datum: ${fmtDate(invoice.datum)}`, boxX, y, { width: boxW, align: 'center' });
  y += 14;

  if (recipient.name) {
    doc.font('Helvetica').fontSize(9).fillColor(C_TEXT)
      .text(`Kunde: ${recipient.name}`, boxX, y, { width: boxW, align: 'center' });
    y += 14;
  }

  y += 8;
  doc.moveTo(boxX, y).lineTo(boxX + boxW, y).strokeColor('#999999').lineWidth(0.5).stroke();
  y += 8;

  // Importe total
  doc.font('Helvetica-Bold').fontSize(18).fillColor(C_TEXT)
    .text(`CHF ${fmtCHF(invoice.totalBrutto || 0)}`, boxX, y, { width: boxW, align: 'center' });
  y += 26;

  doc.font('Helvetica').fontSize(8).fillColor(C_MUTED)
    .text('Bezahlt in bar. Kein offener Betrag.', boxX, y, { width: boxW, align: 'center' });
  y += 20;

  // Marco visual
  doc.rect(boxX - 8, boxY - 8, boxW + 16, y - boxY + 16)
    .strokeColor('#cccccc').lineWidth(0.75).stroke();

  // Línea de firma
  y += 20 * MM;
  doc.moveTo(MARGIN + 10 * MM, y).lineTo(MARGIN + 65 * MM, y).strokeColor('#999999').lineWidth(0.5).stroke();
  doc.font('Helvetica').fontSize(7.5).fillColor(C_MUTED)
    .text('Unterschrift / Stempel', MARGIN + 10 * MM, y + 3, { width: 55 * MM });

  doc.moveTo(MARGIN + CONTENT_W - 65 * MM, y).lineTo(MARGIN + CONTENT_W - 10 * MM, y).strokeColor('#999999').lineWidth(0.5).stroke();
  doc.font('Helvetica').fontSize(7.5).fillColor(C_MUTED)
    .text('Empfangsbestätigung', MARGIN + CONTENT_W - 65 * MM, y + 3, { width: 55 * MM, align: 'right' });

  // Texto de cierre
  y += 25 * MM;
  doc.font('Helvetica').fontSize(8).fillColor(C_MUTED)
    .text(`${issuer.name} · ${issuer.street || ''} · ${issuer.zip || ''} ${issuer.city || ''} · ${issuer.email || ''}`, MARGIN, y, { width: CONTENT_W, align: 'center' });

  drawPageFooter(doc, invoice);
}

/**
 * Página 2 para métodos digitales (TWINT, tarjeta, otros):
 * - Header
 * - "Verwenden Sie die Zahlungsinformationen unten."
 * - Confirmación de pago + datos de referencia
 */
function drawPage2_Digital(doc, invoice) {
  const { issuer, recipient } = invoice;
  const docType = invoice.documentType || 'Rechnung';
  const method  = invoice.paymentMethodDisplay || 'Digital';

  doc.addPage();
  let y = MARGIN;
  y = drawPageHeader(doc, invoice, y);

  doc.font('Helvetica').fontSize(9).fillColor(C_TEXT)
    .text('Verwenden Sie die Zahlungsinformationen unten.', MARGIN, y, { width: CONTENT_W });
  y += 14 + 10 * MM;

  // Subtítulo con método
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C_TEXT)
    .text(`Zahlung via ${method}`, MARGIN, y, { width: CONTENT_W });
  y += 16;

  // Bloque de confirmación
  doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
    .text('Die Zahlung wurde erfolgreich verarbeitet. Bitte bewahren Sie dieses Dokument als Nachweis auf.', MARGIN, y, { width: CONTENT_W });
  y += doc.heightOfString('Die Zahlung wurde erfolgreich verarbeitet.', { width: CONTENT_W, fontSize: 8.5 }) + 10;

  // Filas de referencia
  const refRows = [
    [`${docType}-Nummer`, invoice.nummer],
    ['Datum', fmtDate(invoice.datum)],
    ['Betrag', `${invoice.waehrung || 'CHF'} ${fmtCHF(invoice.totalBrutto || 0)}`],
    ['Zahlungsart', method],
    recipient.name ? ['Kunde', recipient.name] : null,
  ].filter(Boolean);

  const labelW = 85;
  for (const [label, value] of refRows) {
    doc.font('Helvetica').fontSize(8.5).fillColor(C_LABEL)
      .text(label, MARGIN, y, { width: labelW });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
      .text(String(value), MARGIN + labelW + 4, y, { width: CONTENT_W - labelW - 4 });
    y += 13;
  }

  y += 8;
  doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#eeeeee').lineWidth(0.5).stroke();
  y += 10;

  // Nota de agradecimiento
  doc.font('Helvetica').fontSize(8).fillColor(C_MUTED)
    .text(`Vielen Dank für Ihren Einkauf bei ${issuer.name || 'uns'}. Dieses Dokument dient als Zahlungsbeleg.`, MARGIN, y, { width: CONTENT_W });

  drawPageFooter(doc, invoice);
}

// ─── Generador principal ─────────────────────────────────────────────────────

async function generateInvoicePDF(invoice, qrCreditorConfig = null) {
  return new Promise((resolve, reject) => {
    try {
      const { items } = invoice;
      const breakdown      = calcMwStBreakdown(items || []);
      const totalBrutto    = invoice.totalBrutto || 0;
      const totalNetto     = breakdown.reduce((s, g) => s + g.netto, 0);
      const discountAmount = invoice.discountAmount || 0;
      const showQRSection  = invoice.showQRSection && !!qrCreditorConfig;

      // Detectar método de pago para elegir la página 2
      const methodCode = (invoice.paymentMethodCode || '').toLowerCase();
      const isBargeld  = methodCode === 'bargeld' || methodCode === 'cash';
      const isQR       = showQRSection;

      const chunks = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title:   `${invoice.documentType || 'Rechnung'} ${invoice.nummer}`,
          Author:  invoice.issuer?.name || 'Vendly',
          Subject: `${invoice.documentType || 'Rechnung'} ${invoice.nummer}`,
          Creator: 'Vendly Checkout',
        },
      });

      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Página 1: detalle del pedido ──
      drawPage1(doc, invoice, breakdown, totalBrutto, totalNetto, discountAmount);

      // ── Página 2: según método de pago ──
      if (isQR) {
        drawPage2_QRRechnung(doc, invoice, qrCreditorConfig);
      } else if (isBargeld) {
        drawPage2_Bargeld(doc, invoice);
      } else {
        drawPage2_Digital(doc, invoice);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoicePDF };
