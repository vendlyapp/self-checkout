'use client';

import React from 'react';
import { Invoice, InvoiceItem } from '@/lib/services/invoiceService';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import { Download, Share2, Printer, Mail, Phone, MapPin, Building2, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceTemplateProps {
  invoice: Invoice;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  showActions?: boolean;
  isMobile?: boolean;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  onDownload,
  onShare,
  onPrint,
  showActions = true,
  isMobile = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleShare = async () => {
    if (onShare) {
      await onShare();
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: `Rechnung ${invoice.invoiceNumber}`,
          text: `Rechnung ${invoice.invoiceNumber} von ${invoice.storeName || 'Vendly'}`,
          url: window.location.href,
        });
        toast.success('Rechnung geteilt');
      } catch (error) {
        // Usuario canceló
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link zur Rechnung wurde in die Zwischenablage kopiert');
      } catch (err) {
        toast.error('Fehler beim Kopieren');
      }
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();
    } else {
      toast.info('PDF-Download wird in Kürze verfügbar sein');
    }
  };

  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusText = () => {
    switch (invoice.status) {
      case 'paid':
        return 'Bezahlt';
      case 'cancelled':
        return 'Storniert';
      default:
        return 'Ausgestellt';
    }
  };

  return (
    <div id="invoice-content" className="w-full invoice-print">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Ocultar elementos de navegación y UI */
          header,
          nav,
          footer,
          .no-print,
          [class*="HeaderNav"],
          [class*="ResponsiveHeader"],
          [class*="InvoiceActionsFooter"],
          [class*="ResponsiveFooterNav"],
          [class*="Sidebar"],
          button:not(.print-button),
          .print-hide,
          .fixed {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Mostrar el contenedor de la factura */
          .invoice-print-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          
          /* Asegurar que el contenido de la factura sea visible */
          .invoice-print-container,
          .invoice-print-container *,
          #invoice-content,
          #invoice-content * {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Mostrar elementos inline correctamente */
          .invoice-print-container span,
          .invoice-print-container p,
          .invoice-print-container div {
            display: block !important;
          }
          
          .invoice-print-container .flex {
            display: flex !important;
          }
          
          .invoice-print-container .inline,
          .invoice-print-container .inline-block {
            display: inline-block !important;
          }
          
          /* Ocultar elementos de navegación y UI */
          header,
          nav,
          footer,
          .no-print,
          [class*="HeaderNav"],
          [class*="ResponsiveHeader"],
          [class*="InvoiceActionsFooter"],
          [class*="ResponsiveFooterNav"],
          [class*="Sidebar"],
          button:not(.print-button),
          .print-hide,
          .fixed {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Estilos para el contenido de la factura */
          .invoice-print,
          #invoice-content {
            background: white !important;
            color: #000000 !important;
            padding: 20px !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          .invoice-print *,
          #invoice-content * {
            color: #000000 !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          .invoice-print .bg-gray-50,
          #invoice-content .bg-gray-50 {
            background: #f9fafb !important;
          }
          
          .invoice-print .bg-white,
          #invoice-content .bg-white {
            background: #ffffff !important;
          }
          
          .invoice-print .text-gray-900,
          .invoice-print .text-gray-700,
          .invoice-print .text-gray-600,
          #invoice-content .text-gray-900,
          #invoice-content .text-gray-700,
          #invoice-content .text-gray-600 {
            color: #1f2937 !important;
          }
          
          .invoice-print .text-\\[\\#25D076\\],
          #invoice-content .text-\\[\\#25D076\\] {
            color: #059669 !important;
          }
          
          .invoice-print .border-gray-200,
          .invoice-print .border-gray-100,
          #invoice-content .border-gray-200,
          #invoice-content .border-gray-100 {
            border-color: #e5e7eb !important;
          }
          
          /* Asegurar que las tablas se impriman correctamente */
          table {
            page-break-inside: avoid;
            width: 100% !important;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          /* Evitar saltos de página en elementos importantes */
          .invoice-print > div {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Actions Bar - Fixed Bottom for Mobile - Now handled in page component */}

      {/* Actions Bar - Top for Desktop */}
      {showActions && !isMobile && (
        <div className="no-print mb-4 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
            aria-label="Drucken"
          >
            <Printer className="w-4 h-4" />
            <span>Drucken</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
            aria-label="Teilen"
          >
            <Share2 className="w-4 h-4" />
            <span>Teilen</span>
          </button>
          {onDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#25D076] hover:bg-[#20B865] text-white rounded-xl transition-colors text-sm font-semibold shadow-lg shadow-[#25D076]/20"
              aria-label="PDF herunterladen"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          )}
        </div>
      )}

      {/* Invoice Container */}
      <div className={`bg-white ${isMobile ? 'mx-4 rounded-2xl shadow-sm border border-gray-200 p-6' : 'rounded-2xl shadow-lg p-6 sm:p-8 md:p-12'}`}>
        {/* Header */}
        <div className={`${isMobile ? 'mb-4 pb-3' : 'mb-6 pb-4'} border-b border-gray-200`}>
          <div className="flex flex-col gap-3">
            {/* Title and Number */}
            <div>
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'} font-bold text-gray-900 mb-1.5`}>
                Rechnung
              </h1>
              <div className="flex items-center gap-1.5 text-gray-600">
                <FileText className="w-3.5 h-3.5" />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{invoice.invoiceNumber}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 ${getStatusColor()} border px-2.5 py-1.5 rounded-lg w-fit`}>
              {getStatusIcon()}
              <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-semibold`}>{getStatusText()}</span>
            </div>

            {/* Store Info */}
            {invoice.storeName && (
              <div>
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900 mb-1.5`}>
                  {invoice.storeName}
                </h2>
                {invoice.storeAddress && (
                  <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{invoice.storeAddress}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2.5 mt-1.5">
                  {invoice.storePhone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{invoice.storePhone}</span>
                    </div>
                  )}
                  {invoice.storeEmail && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="break-all">{invoice.storeEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details Grid */}
        <div className={`${isMobile ? 'space-y-3 mb-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'}`}>
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              Rechnungsempfänger
            </h3>
            <div className="space-y-1.5">
              {invoice.customerName && (
                <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>
                  {invoice.customerName}
                </p>
              )}
              {invoice.customerAddress && (
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{invoice.customerAddress}</span>
                </div>
              )}
              {(invoice.customerCity || invoice.customerPostalCode) && (
                <p className="text-xs text-gray-600 ml-5">
                  {invoice.customerPostalCode} {invoice.customerCity}
                </p>
              )}
              {invoice.customerEmail && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="break-all">{invoice.customerEmail}</span>
                </div>
              )}
              {invoice.customerPhone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{invoice.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              Rechnungsdetails
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Ausstellungsdatum:</span>
                <span className="font-medium text-gray-900 ml-auto text-right">
                  {formatDate(invoice.issuedAt)}
                </span>
              </div>
              {invoice.orderDate && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Bestelldatum:</span>
                  <span className="font-medium text-gray-900 ml-auto text-right">
                    {formatDate(invoice.orderDate)}
                  </span>
                </div>
              )}
              {invoice.paymentMethod && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Zahlungsmethode:</span>
                  <span className="font-medium text-gray-900 ml-auto text-right">
                    {invoice.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 mb-2.5`}>
            Artikel
          </h3>
          {isMobile ? (
            // Mobile: Card-based layout
            <div className="space-y-2.5">
              {invoice.items.map((item: InvoiceItem, index: number) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">
                        {item.productName}
                      </p>
                      {item.productSku && (
                        <p className="text-[10px] text-gray-500">SKU: {item.productSku}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {formatSwissPriceWithCHF(item.subtotal)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                    <span className="text-xs text-gray-600">
                      {item.quantity}x {formatSwissPriceWithCHF(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Table layout
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Artikel</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Menge</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Einzelpreis</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: InvoiceItem, index: number) => (
                    <tr
                      key={`${item.productId}-${index}`}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          {item.productSku && (
                            <p className="text-xs text-gray-500 mt-1">SKU: {item.productSku}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="text-right py-4 px-4 text-gray-700">
                        {formatSwissPriceWithCHF(item.price)}
                      </td>
                      <td className="text-right py-4 px-4 font-semibold text-gray-900">
                        {formatSwissPriceWithCHF(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
          <div className={`${isMobile ? 'w-full' : 'ml-auto max-w-md'}`}>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Zwischensumme:</span>
                <span className="font-medium">{formatSwissPriceWithCHF(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Rabatt:</span>
                  <span className="font-medium">-{formatSwissPriceWithCHF(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500 italic">
                <span>MwSt. inklusive</span>
              </div>
              <div className={`border-t-2 border-gray-200 pt-2.5 mt-2.5 ${isMobile ? 'pt-3' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-gray-900`}>
                    Gesamtbetrag:
                  </span>
                  <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-[#25D076]`}>
                    {formatSwissPriceWithCHF(invoice.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t border-gray-200 ${isMobile ? 'pt-3 mt-4' : 'pt-4 mt-6'}`}>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 text-center leading-relaxed`}>
            Vielen Dank für Ihren Einkauf bei {invoice.storeName || 'Vendly'}!
          </p>
          {invoice.metadata?.saveCustomerData === true && (
            <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400 text-center mt-1.5`}>
              Ihre Daten wurden für zukünftige Bestellungen gespeichert.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
