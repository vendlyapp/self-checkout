/**
 * InvoicePDFService — genera un PDF de factura suiza con pdfkit
 * Diseño: estilo Digitec/Galaxus (2 páginas para QR-Rechnung, 1 para el resto)
 *
 * Estilos: TODO el layout y tipografía de la factura PDF se ajustan AQUÍ
 * (no en el frontend). El QR-Bill usa swissqrbill/pdf; antes de attachTo
 * hay que resetear fillColor a negro para que no herede grises del doc.
 */

const PDFDocument = require('pdfkit');
const { SwissQRBill: SwissQRBillPDF } = require('swissqrbill/pdf');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MM = 2.8346; // 1mm in PDF points
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 14 * MM;
const CONTENT_W = A4_W - MARGIN * 2;

/** Texto principal: negro puro para impresión/PDF */
const C_TEXT = '#000000';
const C_LABEL = '#333333';
const C_MUTED = '#555555';

/** Format CHF amount: 1234.5 → "1'234.50" */
function fmtCHF(n) {
  return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

/** Format date string to dd.MM.yyyy */
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Format MwSt rate: 0.081 → "8.1%" */
function fmtRate(r) {
  if (r >= 0.0795 && r <= 0.0815) return '8.1%';
  return (r * 100).toFixed(1) + '%';
}

/** Group items by MwSt rate and compute netto/mwst per group */
function calcMwStBreakdown(items) {
  const groups = {};
  for (const item of items) {
    const key = item.mwstCode || item.mwstRate?.toString() || 'A';
    if (!groups[key]) groups[key] = { code: key, rate: item.mwstRate || 0.026, brutto: 0, netto: 0, mwst: 0 };
    groups[key].brutto += item.totalBrutto;
  }
  return Object.values(groups).map(g => {
    const netto = g.brutto / (1 + g.rate);
    return { ...g, netto, mwst: g.brutto - netto };
  });
}

// ─── Page header: Logo links oben | Geschäftsdaten rechtsbündig oben rechts ──

function drawPageHeader(doc, invoice, yStart) {
  const { issuer } = invoice;
  const logoColW = 36 * MM;
  const gap = 4 * MM;
  /** Bereich für rechtsbündigen Text: beginnt rechts neben dem Logo */
  const rightBlockX = MARGIN + logoColW + gap;
  const rightBlockW = CONTENT_W - logoColW - gap;

  const logoH = 18 * MM;
  const logoInnerW = logoColW - 2 * MM;

  if (invoice.storeLogo) {
    try {
      doc.image(invoice.storeLogo, MARGIN, yStart, { fit: [logoInnerW, logoH] });
    } catch (_) {
      drawLetterMark(doc, issuer.name, MARGIN, yStart);
    }
  } else {
    drawLetterMark(doc, issuer.name, MARGIN, yStart);
  }

  let ty = yStart;
  // Alles rechtsbündig im oberen Bereich (gegenüber Logo)
  if (issuer.website) {
    doc.font('Helvetica').fontSize(8).fillColor(C_TEXT)
      .text(issuer.website, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(issuer.website, { width: rightBlockW, fontSize: 8, align: 'right' }) + 1;
  }

  doc.font('Helvetica-Bold').fontSize(10).fillColor(C_TEXT);
  const nameStr = issuer.name || '';
  doc.text(nameStr, rightBlockX, ty, { width: rightBlockW, align: 'right' });
  ty += doc.heightOfString(nameStr || ' ', { width: rightBlockW, fontSize: 10, align: 'right' }) + 1;

  doc.font('Helvetica').fontSize(9).fillColor(C_TEXT);
  if (issuer.street) {
    doc.text(issuer.street, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(issuer.street, { width: rightBlockW, fontSize: 9, align: 'right' }) + 1;
  }
  if (issuer.zip || issuer.city) {
    const line = `${issuer.zip || ''} ${issuer.city || ''}`.trim();
    doc.text(line, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(line, { width: rightBlockW, fontSize: 9, align: 'right' }) + 1;
  }
  if (issuer.phone || issuer.email) {
    const contact = [issuer.phone ? `Tel. ${issuer.phone}` : null, issuer.email].filter(Boolean).join(' · ');
    doc.text(contact, rightBlockX, ty, { width: rightBlockW, align: 'right' });
    ty += doc.heightOfString(contact, { width: rightBlockW, fontSize: 9, align: 'right' }) + 1;
  }

  const headerBottom = Math.max(yStart + logoH + 2 * MM, ty) + 3 * MM;
  doc.moveTo(MARGIN, headerBottom).lineTo(MARGIN + CONTENT_W, headerBottom)
    .strokeColor('#cccccc').lineWidth(0.5).stroke();

  return headerBottom + 4 * MM;
}

function drawLetterMark(doc, name, x, y) {
  const letter = (name || 'V').charAt(0).toUpperCase();
  const s = 11 * MM;
  doc.save()
    .rect(x, y, s, s).fillColor('#25D076').fill()
    .font('Helvetica-Bold').fontSize(13).fillColor('#ffffff')
    .text(letter, x, y + 2.5 * MM, { width: s, align: 'center' })
    .restore();
}

// ─── Page footer ─────────────────────────────────────────────────────────────

function drawPageFooter(doc, invoice) {
  const { issuer } = invoice;
  const y = A4_H - MARGIN - 10;
  doc.moveTo(MARGIN, y - 4).lineTo(MARGIN + CONTENT_W, y - 4).strokeColor('#cccccc').lineWidth(0.5).stroke();
  const parts = [
    issuer.name,
    issuer.street ? `${issuer.street}` : null,
    (issuer.zip || issuer.city) ? `${issuer.zip || ''} ${issuer.city || ''}`.trim() : null,
    issuer.mwstNummer,
    issuer.phone ? `Tel. ${issuer.phone}` : null,
    issuer.email,
  ].filter(Boolean);
  doc.font('Helvetica').fontSize(7).fillColor(C_MUTED)
    .text(parts.join(' · '), MARGIN, y, { width: CONTENT_W, align: 'left' });
}

/**
 * Columnas de la tabla de posiciones: de derecha a izquierda (sin solapamiento)
 */
function tableColumnXs() {
  const right = MARGIN + CONTENT_W;
  const wInkl = 24 * MM;
  const wExkl = 24 * MM;
  const wMwst = 20 * MM;
  const wQty = 16 * MM;
  const colInkl = right - wInkl;
  const colExkl = colInkl - wExkl;
  const colMwst = colExkl - wMwst;
  const colQty = colMwst - wQty;
  const colDesc = MARGIN;
  return { colDesc, colQty, colMwst, colExkl, colInkl, wQty, wMwst, wExkl, wInkl, descW: Math.max(80, colQty - colDesc - 6) };
}

// ─── Main generator ──────────────────────────────────────────────────────────

async function generateInvoicePDF(invoice, qrCreditorConfig = null) {
  return new Promise((resolve, reject) => {
    try {
      const { issuer, recipient, items } = invoice;
      const breakdown = calcMwStBreakdown(items || []);
      const totalBrutto = invoice.totalBrutto || 0;
      const totalNetto = breakdown.reduce((s, g) => s + g.netto, 0);
      const discountAmount = invoice.discountAmount || 0;
      const showQRSection = invoice.showQRSection && !!qrCreditorConfig;

      const chunks = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `${invoice.documentType || 'Rechnung'} ${invoice.nummer}`,
          Author: issuer.name || 'Vendly',
          Subject: `${invoice.documentType || 'Rechnung'} ${invoice.nummer}`,
          Creator: 'Vendly Checkout',
        },
      });

      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const docType = invoice.documentType || 'Rechnung';
      const cols = tableColumnXs();

      // ── PAGE 1 ────────────────────────────────────────────────────────────
      let y = MARGIN;
      y = drawPageHeader(doc, invoice, y);

      const docBlockY = y;
      const leftW = CONTENT_W * 0.42;
      const rightX = MARGIN + leftW + 8 * MM;
      const rightW = MARGIN + CONTENT_W - rightX;

      // Destinatario (izquierda)
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C_TEXT)
        .text(recipient.name || '', MARGIN, docBlockY, { width: leftW });
      let recY = docBlockY + 13;
      doc.font('Helvetica').fontSize(9).fillColor(C_TEXT);
      if (recipient.street) { doc.text(recipient.street, MARGIN, recY, { width: leftW }); recY += 11; }
      if (recipient.zip || recipient.city) {
        doc.text(`${recipient.zip || ''} ${recipient.city || ''}`.trim(), MARGIN, recY, { width: leftW });
        recY += 11;
      }
      if (recipient.country) { doc.text(recipient.country, MARGIN, recY, { width: leftW }); recY += 11; }

      // Título + meta (derecha) — evitar solapamiento título / filas
      doc.font('Helvetica').fontSize(15).fillColor(C_TEXT);
      const titleStr = `${docType} ${invoice.nummer}`;
      const titleH = doc.heightOfString(titleStr, { width: rightW, align: 'right' });
      doc.text(titleStr, rightX, docBlockY, { width: rightW, align: 'right' });

      const metaRows = [
        ['Rechnungsdatum', fmtDate(invoice.datum)],
        invoice.isDeferredPayment && invoice.faelligkeitsDatum
          ? ['Fälligkeitsdatum', fmtDate(invoice.faelligkeitsDatum)]
          : null,
        invoice.leistungsDatum && fmtDate(invoice.leistungsDatum) !== fmtDate(invoice.datum)
          ? ['Leistungsdatum', fmtDate(invoice.leistungsDatum)]
          : null,
        invoice.orderId ? ['Auftrag', String(invoice.orderId)] : null,
        recipient.name ? ['Ihre Referenz', recipient.name] : null,
        issuer.mwstNummer ? ['MwSt-Nr.', issuer.mwstNummer] : null,
        invoice.zahlungsfrist ? ['Zahlungsbedingungen', `${invoice.zahlungsfrist} Tage netto`] : null,
        ['Währung', invoice.waehrung || 'CHF'],
        invoice.paymentMethodDisplay && invoice.paymentMethodDisplay !== '—'
          ? ['Zahlungsart', invoice.paymentMethodDisplay]
          : null,
      ].filter(Boolean);

      const labelW = rightW * 0.42;
      const valW = rightW * 0.54;
      const valX = rightX + rightW - valW;
      const labX = rightX;
      let metaY = docBlockY + titleH + 6;

      for (const [label, value] of metaRows) {
        const vStr = String(value);
        doc.font('Helvetica').fontSize(8).fillColor(C_LABEL);
        const hLabel = doc.heightOfString(label, { width: labelW, align: 'right' });
        doc.font('Helvetica').fontSize(8).fillColor(C_TEXT);
        const hVal = doc.heightOfString(vStr, { width: valW, align: 'left' });
        const rowH = Math.max(hLabel, hVal, 10);

        doc.font('Helvetica').fontSize(8).fillColor(C_LABEL)
          .text(label, labX, metaY, { width: labelW, align: 'right' });
        doc.font('Helvetica').fontSize(8).fillColor(C_TEXT)
          .text(vStr, valX, metaY, { width: valW, align: 'left' });
        metaY += rowH + 3;
      }

      y = Math.max(recY, metaY) + 6 * MM;

      // ── Tabla artículos ──
      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
      y += 4;
      doc.font('Helvetica-Bold').fontSize(7).fillColor(C_LABEL);
      doc.text('Beschreibung', cols.colDesc, y, { width: cols.descW });
      doc.text('Menge', cols.colQty, y, { width: cols.wQty, align: 'right' });
      doc.text('MwSt.', cols.colMwst, y, { width: cols.wMwst, align: 'right' });
      doc.text('Preis exkl.', cols.colExkl, y, { width: cols.wExkl, align: 'right' });
      doc.text('Preis inkl.', cols.colInkl, y, { width: cols.wInkl, align: 'right' });
      y += 10;
      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
      y += 5;

      for (const item of items || []) {
        const nettoUnit = (item.unitPrice || 0) / (1 + (item.mwstRate || 0.026));
        const nettoTotal = nettoUnit * (item.quantity || 1);

        const nameH = doc.heightOfString(item.description || '', { width: cols.descW, fontSize: 8.5 });
        const detailH = item.detail ? doc.heightOfString(item.detail, { width: cols.descW, fontSize: 7 }) + 2 : 0;
        const rowH = Math.max(nameH + detailH + 4, 16);

        if (y + rowH > A4_H - MARGIN - 22 * MM) {
          drawPageFooter(doc, invoice);
          doc.addPage();
          y = MARGIN;
          y = drawPageHeader(doc, invoice, y);
        }

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
          .text(item.description || '', cols.colDesc, y + 2, { width: cols.descW });
        if (item.detail) {
          doc.font('Helvetica').fontSize(7).fillColor(C_MUTED)
            .text(item.detail, cols.colDesc, y + 2 + nameH, { width: cols.descW });
        }
        doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
          .text(String(item.quantity || 1), cols.colQty, y + 2, { width: cols.wQty, align: 'right' });
        doc.text(fmtRate(item.mwstRate || 0.026), cols.colMwst, y + 2, { width: cols.wMwst, align: 'right' });
        doc.text(fmtCHF(nettoTotal), cols.colExkl, y + 2, { width: cols.wExkl, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_TEXT)
          .text(fmtCHF(item.totalBrutto || 0), cols.colInkl, y + 2, { width: cols.wInkl, align: 'right' });

        y += rowH;
        doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#eeeeee').lineWidth(0.3).stroke();
        y += 2;
      }

      doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
      y += 5 * MM;

      // ── Totales ──
      const totW = 125 * MM;
      const totX = MARGIN + CONTENT_W - totW;
      const col1W = totW - 52 * MM;

      doc.font('Helvetica-Bold').fontSize(7).fillColor(C_LABEL);
      doc.text('Betrag exkl.', totX + col1W, y, { width: 24 * MM, align: 'right' });
      doc.text('Betrag inkl.', totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
      y += 9;
      doc.moveTo(totX, y).lineTo(totX + totW, y).strokeColor('#bbbbbb').lineWidth(0.5).stroke();
      y += 4;

      doc.font('Helvetica').fontSize(8.5).fillColor(C_TEXT)
        .text('Gesamtbetrag', totX, y, { width: col1W });
      doc.text(fmtCHF(totalNetto), totX + col1W, y, { width: 24 * MM, align: 'right' });
      doc.text(fmtCHF(totalBrutto), totX + col1W + 24 * MM, y, { width: 24 * MM, align: 'right' });
      y += 11;

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

      if (invoice.notes) {
        doc.font('Helvetica').fontSize(8).fillColor(C_MUTED)
          .text(invoice.notes, MARGIN, y, { width: CONTENT_W });
        y += doc.heightOfString(invoice.notes, { width: CONTENT_W, fontSize: 8 }) + 5 * MM;
      }

      drawPageFooter(doc, invoice);

      // ── PAGE 2 — QR-Rechnung ───────────────────────────────────────────────
      if (showQRSection && qrCreditorConfig) {
        doc.addPage();
        let y2 = MARGIN;
        y2 = drawPageHeader(doc, invoice, y2);

        doc.font('Helvetica-Bold').fontSize(9).fillColor(C_TEXT)
          .text('Verwenden Sie die Zahlungsinformationen unten.', MARGIN, y2, { width: CONTENT_W });
        y2 += 14;

        doc.font('Helvetica-Bold').fontSize(10).fillColor(C_TEXT)
          .text('QR-Rechnung', MARGIN, y2, { width: CONTENT_W });
        y2 += 13;

        doc.font('Helvetica').fontSize(8).fillColor(C_TEXT)
          .text(
            'Scannen Sie den QR-Code mit Ihrer Schweizer Banking-App (UBS, ZKB, Raiffeisen, PostFinance) oder verwenden Sie die untenstehenden Daten für eine manuelle Zahlung. Vergessen Sie nicht, die Referenz anzugeben.',
            MARGIN, y2, { width: CONTENT_W }
          );
        y2 += doc.heightOfString(
          'Scannen Sie den QR-Code mit Ihrer Schweizer Banking-App (UBS, ZKB, Raiffeisen, PostFinance) oder verwenden Sie die untenstehenden Daten für eine manuelle Zahlung. Vergessen Sie nicht, die Referenz anzugeben.',
          { width: CONTENT_W, fontSize: 8 }
        ) + 8;

        const bankRows = [
          ['Zugunsten von', [issuer.name, issuer.street, (issuer.zip || issuer.city) ? `CH-${issuer.zip || ''} ${issuer.city || ''}`.trim() : null].filter(Boolean).join(', ')],
          issuer.iban ? ['IBAN', issuer.iban] : null,
          invoice.referenz ? ['Verwendungszweck', `${docType} ${invoice.nummer}`] : null,
          ['Betrag offen', `${invoice.waehrung || 'CHF'} ${fmtCHF(totalBrutto)}`],
        ].filter(Boolean);

        const bankLabelW = 85;
        for (const [label, value] of bankRows) {
          doc.font('Helvetica').fontSize(8).fillColor(C_LABEL)
            .text(label, MARGIN, y2, { width: bankLabelW });
          doc.font('Helvetica-Bold').fontSize(8).fillColor(C_TEXT)
            .text(value, MARGIN + bankLabelW + 4, y2, { width: CONTENT_W - bankLabelW - 4 });
          y2 += 12;
        }

        y2 += 6 * MM;
        doc.moveTo(MARGIN, y2).lineTo(MARGIN + CONTENT_W, y2).strokeColor('#aaaaaa').lineWidth(0.5).dash(3, { space: 2 }).stroke();
        doc.undash();
        doc.font('Helvetica').fontSize(9).fillColor(C_MUTED).text('✂', MARGIN, y2 - 5, { width: 12 });
        y2 += 5 * MM;

        const amount = Number(invoice.totalBrutto || 0);
        const reference = invoice.referenz || '';
        const additionalInfo = `${docType} ${invoice.nummer}`;

        const qrData = {
          amount: Math.round(amount * 100) / 100,
          currency: 'CHF',
          creditor: {
            account: (qrCreditorConfig.qrIban || '').replace(/\s/g, ''),
            name: qrCreditorConfig.creditorName,
            address: qrCreditorConfig.creditorStreet,
            buildingNumber: qrCreditorConfig.creditorHouseNo,
            zip: String(qrCreditorConfig.creditorZip),
            city: qrCreditorConfig.creditorCity,
            country: qrCreditorConfig.creditorCountry || 'CH',
          },
          reference,
          additionalInformation: additionalInfo.slice(0, 140),
        };

        if (invoice.recipient?.name) {
          qrData.debtor = {
            name: invoice.recipient.name,
            address: invoice.recipient.street || '',
            buildingNumber: '',
            zip: String(invoice.recipient.zip || ''),
            city: invoice.recipient.city || '',
            country: 'CH',
          };
        }

        // swissqrbill hereda fillColor/strokeColor del PDFKit — forzar negro
        doc.fillColor('black');
        doc.strokeColor('black');
        doc.opacity(1);

        const qrBill = new SwissQRBillPDF(qrData, { language: 'DE', outlines: true, scissors: true });
        qrBill.attachTo(doc, MARGIN, y2);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoicePDF };
