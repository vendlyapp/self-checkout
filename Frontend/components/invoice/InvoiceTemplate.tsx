'use client';

import { useMemo, useRef } from 'react';
import {
  Download,
  Printer,
  Mail,
  Copy,
  Scissors,
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  formatCHF,
  formatDate,
  formatMwStRate,
  calculateMwStBreakdown,
  getStatusConfig,
  type Invoice as SwissInvoice,
  type MwStGroup,
  type InvoiceParty,
  type InvoiceLineItem,
  type InvoiceStatus,
} from '@/lib/invoice-utils';
import { Invoice as ServiceInvoice, InvoiceItem } from '@/lib/services/invoiceService';

// =============================================================================
// Swiss Invoice Template
// Design: Swiss International Style (Neue Grafik / Helvetica tradition)
// Compliance: Art. 26 MWSTG — all mandatory fields included
// =============================================================================

interface InvoiceTemplateProps {
  invoice: ServiceInvoice;
  showActions?: boolean;
  isMobile?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
}

// ─── Transform Service Invoice to Swiss Invoice Format ────────────────────────

function transformInvoice(serviceInvoice: ServiceInvoice): SwissInvoice {
  // Parse address strings to extract street, zip, city
  const parseAddress = (address?: string, postalCode?: string, city?: string) => {
    // If we have separate postalCode and city, use them
    if (postalCode && city) {
      return {
        street: address || undefined,
        zip: postalCode,
        city: city,
      };
    }
    
    if (!address) return { street: undefined, zip: undefined, city: undefined };
    
    // Try to match Swiss address format: "Street, ZIP City" or "Street ZIP City"
    const match = address.match(/^(.+?),\s*(\d{4})\s+(.+)$/) || address.match(/^(.+?)\s+(\d{4})\s+(.+)$/);
    if (match) {
      return {
        street: match[1].trim(),
        zip: match[2].trim(),
        city: match[3].trim(),
      };
    }
    
    // Fallback: try to extract ZIP and city
    const zipMatch = address.match(/(\d{4})\s+(.+)$/);
    if (zipMatch) {
      return {
        street: address.replace(/\d{4}\s+.+$/, '').trim() || undefined,
        zip: zipMatch[1],
        city: zipMatch[2],
      };
    }
    
    // If we have postalCode and city separately, use them
    if (postalCode) {
      return {
        street: address,
        zip: postalCode,
        city: city || undefined,
      };
    }
    
    return { street: address, zip: undefined, city: undefined };
  };

  // Parse store address with all available fields
  const storeAddress = parseAddress(
    serviceInvoice.storeAddress,
    undefined, // Store doesn't have separate postalCode field in invoice
    undefined  // Store doesn't have separate city field in invoice
  );

  // Parse customer address with all available fields
  const customerAddress = parseAddress(
    serviceInvoice.customerAddress,
    serviceInvoice.customerPostalCode,
    serviceInvoice.customerCity
  );

  // Build issuer (store) info - ensure all fields are properly structured
  const issuer: InvoiceParty = {
    name: serviceInvoice.storeName?.trim() || 'Vendly',
    street: storeAddress.street?.trim() || undefined,
    zip: storeAddress.zip?.trim() || undefined,
    city: storeAddress.city?.trim() || undefined,
    country: 'Schweiz',
    email: serviceInvoice.storeEmail?.trim() || undefined,
    phone: serviceInvoice.storePhone?.trim() || undefined,
  };

  // Build recipient (customer) info - ensure all fields are properly structured
  const recipient: InvoiceParty = {
    name: serviceInvoice.customerName?.trim() || 'Kunde',
    street: customerAddress.street?.trim() || undefined,
    zip: customerAddress.zip?.trim() || serviceInvoice.customerPostalCode?.trim() || undefined,
    city: customerAddress.city?.trim() || serviceInvoice.customerCity?.trim() || undefined,
    country: 'Schweiz',
    email: serviceInvoice.customerEmail?.trim() || undefined,
    phone: serviceInvoice.customerPhone?.trim() || undefined,
  };

  // Transform items - calculate MwSt using Swiss formula
  // In Switzerland, prices ALREADY include VAT (Brutto)
  // Formula: Netto = Brutto ÷ (1 + rate), MwSt = Brutto - Netto
  // NEVER do: Brutto × rate (that's incorrect in Switzerland)
  
  // Helper function to determine MwSt rate and code from item metadata or defaults
  const getMwStRateAndCode = (item: InvoiceItem, index: number): { rate: number; code: string } => {
    // Try to get taxRate from item metadata if available
    const itemWithMetadata = item as InvoiceItem & { metadata?: Record<string, unknown> };
    const itemMetadata = itemWithMetadata.metadata || {};
    const taxRate = itemMetadata.taxRate || itemMetadata.tax_rate;
    
    if (taxRate !== undefined && taxRate !== null) {
      const rate = typeof taxRate === 'number' 
        ? taxRate 
        : typeof taxRate === 'string' 
        ? parseFloat(taxRate) 
        : 0.081;
      // Map rate to code
      if (rate === 0.081 || rate === 0.077) return { rate: 0.081, code: 'A' }; // Normalsatz
      if (rate === 0.026) return { rate: 0.026, code: 'B' }; // Reduziert
      if (rate === 0.038) return { rate: 0.038, code: 'C' }; // Beherbergung
      if (rate === 0) return { rate: 0, code: 'D' }; // Befreit
      // Default to standard rate if unknown
      return { rate: 0.081, code: 'A' };
    }
    
    // Default: use standard Swiss VAT rate (8.1% Normalsatz)
    // This can be customized per product in the future
    return { rate: 0.081, code: 'A' };
  };
  
  const items: InvoiceLineItem[] = serviceInvoice.items.map((item: InvoiceItem, index: number) => {
    // Validate and ensure all product data is present
    const productName = item.productName?.trim() || `Produkt ${index + 1}`;
    const productSku = item.productSku?.trim() || undefined;
    const quantity = Math.max(1, item.quantity || 1); // Ensure quantity is at least 1
    const totalBrutto = item.subtotal || 0; // Already includes VAT
    
    // Get MwSt rate and code (variable per item if available in metadata)
    const { rate: mwstRate, code: mwstCode } = getMwStRateAndCode(item, index);
    
    // Calculate netto using Swiss formula: Netto = Brutto ÷ (1 + rate)
    // This extracts the VAT from the price, not adds it
    const netto = totalBrutto / (1 + mwstRate);
    
    // Calculate MwSt: MwSt = Brutto - Netto
    // This is the correct way in Switzerland
    const mwstAmount = totalBrutto - netto;
    
    // unitPrice should be the price per unit BRUTTO (including VAT)
    // If item.price is already BRUTTO, use it directly
    // Otherwise, calculate from subtotal: unitPrice = subtotal / quantity
    const unitPriceBrutto = item.price || (totalBrutto / quantity);
    
    // Build detail string with SKU if available
    const detail = productSku ? `SKU: ${productSku}` : undefined;
    
    return {
      id: item.productId || `product-${index}`,
      description: productName,
      detail: detail,
      quantity: quantity,
      unitPrice: Math.round(unitPriceBrutto * 100) / 100, // Round to 2 decimals
      totalBrutto: Math.round(totalBrutto * 100) / 100, // Round to 2 decimals
      mwstRate,
      mwstCode,
    };
  });

  // Map status
  const statusMap: Record<string, InvoiceStatus> = {
    'issued': 'open',
    'paid': 'paid',
    'cancelled': 'cancelled',
  };
  const status = statusMap[serviceInvoice.status] || 'open';

  // Ensure dates are correct and current
  // Use issuedAt if available, otherwise use current date
  const issuedDate = serviceInvoice.issuedAt 
    ? new Date(serviceInvoice.issuedAt)
    : new Date();
  
  // Validate date
  if (isNaN(issuedDate.getTime())) {
    // If invalid, use current date
    issuedDate.setTime(Date.now());
  }
  
  // Use orderDate for service date (Leistungsdatum), fallback to issuedDate
  const orderDate = serviceInvoice.orderDate 
    ? new Date(serviceInvoice.orderDate)
    : issuedDate;
  
  // Validate orderDate
  if (isNaN(orderDate.getTime())) {
    orderDate.setTime(issuedDate.getTime());
  }
  
  // Calculate due date (30 days from issue date by default)
  const dueDate = new Date(issuedDate);
  dueDate.setDate(dueDate.getDate() + 30);
  
  // Ensure due date is valid
  if (isNaN(dueDate.getTime())) {
    dueDate.setTime(issuedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  // Calculate totals using Swiss formula
  // totalBrutto is already the total including VAT
  const totalBrutto = serviceInvoice.total; // Already includes VAT
  
  // If taxAmount is provided, use it (it should be calculated correctly)
  // Otherwise, calculate from items breakdown (which uses variable rates per item)
  let totalMwst: number;
  let totalNetto: number;
  
  if (serviceInvoice.taxAmount && serviceInvoice.taxAmount > 0) {
    // Use provided taxAmount if available
    totalMwst = serviceInvoice.taxAmount;
    totalNetto = totalBrutto - totalMwst;
  } else {
    // Calculate from items (which may have different rates)
    // This will be recalculated correctly in the component using calculateMwStBreakdown
    // For now, use a default calculation as fallback
    const defaultRate = 0.081; // Default to standard rate if no items
    totalNetto = totalBrutto / (1 + defaultRate);
    totalMwst = totalBrutto - totalNetto;
  }

  return {
    id: serviceInvoice.id,
    nummer: serviceInvoice.invoiceNumber || `INV-${issuedDate.toISOString().split('T')[0].replace(/-/g, '')}`,
    datum: issuedDate.toISOString(), // Date of issue (current/actual date)
    leistungsDatum: orderDate.toISOString(), // Service date (order date)
    faelligkeitsDatum: dueDate.toISOString(), // Due date (30 days from issue)
    zahlungsfrist: 30,
    waehrung: 'CHF',
    referenz: serviceInvoice.invoiceNumber || serviceInvoice.id,
    status,
    issuer,
    recipient,
    items,
    notes: serviceInvoice.metadata?.notes as string | undefined,
    orderId: serviceInvoice.orderId,
    totalBrutto: Math.round(totalBrutto * 100) / 100, // Round to 2 decimals
    totalNetto: Math.round(totalNetto * 100) / 100, // Round to 2 decimals
    totalMwst: Math.round(totalMwst * 100) / 100, // Round to 2 decimals
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status as InvoiceStatus);
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        text-[10px] font-semibold tracking-[0.08em] uppercase
        ${config.bgColor} ${config.textColor} ring-1 ${config.ringColor}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

function MwStCodeBadge({ code, rate }: { code: string; rate: number }) {
  // Color scheme based on rate type
  const isReduced = rate <= 0.026;
  const isSpecial = rate === 0.038;
  const isExempt = rate === 0;

  const colorClass = isExempt
    ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
    : isReduced
    ? 'bg-sky-50 text-sky-600 ring-sky-200'
    : isSpecial
    ? 'bg-amber-50 text-amber-600 ring-amber-200'
    : 'bg-gray-100 text-gray-500 ring-gray-200';

  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-6 h-5 rounded text-[10px] font-bold tracking-wide
        ring-1 ${colorClass}
      `}
    >
      {code}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-gray-300 uppercase tracking-[0.15em] font-semibold mb-2 select-none">
      {children}
    </div>
  );
}

function QRCodePlaceholder() {
  return (
    <div className="w-[120px] h-[120px] md:w-[132px] md:h-[132px] bg-white border-2 border-[#25D076] p-1 relative flex-shrink-0">
      <div className="w-full h-full relative">
        {/* Green center marker */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-6 h-6 md:w-7 md:h-7 bg-[#25D076] rounded-sm flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="6" y="1" width="4" height="14" fill="white" />
              <rect x="1" y="6" width="14" height="4" fill="white" />
            </svg>
          </div>
        </div>
        {/* QR pattern */}
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-75">
          <rect x="2" y="2" width="22" height="22" fill="#111" />
          <rect x="5" y="5" width="16" height="16" fill="white" />
          <rect x="8" y="8" width="10" height="10" fill="#111" />
          <rect x="76" y="2" width="22" height="22" fill="#111" />
          <rect x="79" y="5" width="16" height="16" fill="white" />
          <rect x="82" y="8" width="10" height="10" fill="#111" />
          <rect x="2" y="76" width="22" height="22" fill="#111" />
          <rect x="5" y="79" width="16" height="16" fill="white" />
          <rect x="8" y="82" width="10" height="10" fill="#111" />
          {[
            [28,4],[32,8],[40,4],[48,12],[56,4],[60,8],[64,16],[68,4],
            [28,16],[36,12],[44,20],[52,8],[60,20],[68,12],
            [4,28],[12,32],[20,28],[28,36],[36,28],[44,32],[52,28],
            [60,36],[68,28],[76,32],[84,28],[92,36],
            [4,44],[16,48],[28,44],[36,52],[60,48],[68,44],[76,52],[88,44],
            [4,60],[12,56],[20,64],[28,56],[36,64],[60,56],[68,64],[76,56],[88,60],
            [4,68],[16,72],[28,68],[40,72],[52,68],[64,72],[76,68],[88,72],
            [28,80],[36,88],[48,80],[60,88],[72,80],[84,88],[92,80],
            [28,92],[40,92],[56,92],[68,92],[80,92],[92,92],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="4" height="4" fill="#111" />
          ))}
        </svg>
      </div>
    </div>
  );
}

function CutLine() {
  return (
    <div className="flex items-center gap-2 py-3 select-none print:hidden" aria-hidden="true">
      <Scissors className="w-3.5 h-3.5 text-gray-300 rotate-90" />
      <div className="flex-1 border-t-2 border-dashed border-gray-200" />
    </div>
  );
}

// ─── Action Buttons ──────────────────────────────────────────────────────────

function ActionBar({ 
  onPrint, 
  onDownload 
}: { 
  onPrint: () => void;
  onDownload?: () => void;
}) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rechnung',
          text: 'Rechnung teilen',
          url: window.location.href,
        });
        toast.success('Rechnung geteilt');
      } catch (error) {
        // Usuario canceló
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link zur Rechnung wurde in die Zwischenablage kopiert');
      } catch (err) {
        toast.error('Fehler beim Kopieren');
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link zur Rechnung wurde in die Zwischenablage kopiert');
    } catch (err) {
      toast.error('Fehler beim Kopieren');
    }
  };

  return (
    <div className="flex items-center gap-1.5 print:hidden">
      {[
        { icon: Printer, label: 'Drucken', onClick: onPrint },
        { icon: Download, label: 'PDF', onClick: handleDownload },
        { icon: Mail, label: 'Senden', onClick: handleShare },
        { icon: Copy, label: 'Kopieren', onClick: handleCopy },
      ].map(({ icon: Icon, label, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          title={label}
          className="
            group flex items-center gap-1.5
            px-3 py-2 rounded-lg
            text-xs font-medium text-gray-500
            bg-white border border-gray-200
            hover:border-gray-300 hover:text-gray-800 hover:shadow-sm
            active:scale-[0.97]
            transition-all duration-150
          "
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvoiceTemplate({
  invoice: serviceInvoice,
  showActions = true,
  isMobile = false,
  onDownload,
  onPrint,
}: InvoiceTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Transform service invoice to Swiss invoice format
  const invoice = useMemo(() => transformInvoice(serviceInvoice), [serviceInvoice]);

  // Compute VAT breakdown
  const { breakdown, totalBrutto, totalNetto, totalMwst } = useMemo(() => {
    if (!invoice.items?.length) {
      return {
        breakdown: [] as MwStGroup[],
        totalBrutto: invoice.totalBrutto || 0,
        totalNetto: invoice.totalNetto || 0,
        totalMwst: invoice.totalMwst || 0,
      };
    }
    const groups = calculateMwStBreakdown(invoice.items);
    const brutto = invoice.items.reduce((s, i) => s + i.totalBrutto, 0);
    const mwst = groups.reduce((s, g) => s + g.mwst, 0);
    return {
      breakdown: groups,
      totalBrutto: brutto,
      totalNetto: brutto - mwst,
      totalMwst: mwst,
    };
  }, [invoice.items, invoice.totalBrutto, invoice.totalNetto, invoice.totalMwst]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Ocultar elementos que no deben imprimirse
      const footer = document.querySelector('[class*="InvoiceActionsFooter"]');
      const headerNav = document.querySelector('[class*="HeaderNav"]');
      const responsiveHeader = document.querySelector('[class*="ResponsiveHeader"]');
      
      if (footer) (footer as HTMLElement).style.display = 'none';
      if (headerNav) (headerNav as HTMLElement).style.display = 'none';
      if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = 'none';
      
      window.print();
      
      // Restaurar después de imprimir
      setTimeout(() => {
        if (footer) (footer as HTMLElement).style.display = '';
        if (headerNav) (headerNav as HTMLElement).style.display = '';
        if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = '';
      }, 1000);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Función de descarga por defecto
    try {
      toast.loading('PDF wird erstellt...', { id: 'pdf-download' });
      
      if (!printRef.current) {
        toast.error('Rechnung nicht gefunden', { id: 'pdf-download' });
        return;
      }

      // Ocultar elementos que no deben aparecer en el PDF
      const footer = document.querySelector('[class*="InvoiceActionsFooter"]');
      const headerNav = document.querySelector('[class*="HeaderNav"]');
      const responsiveHeader = document.querySelector('[class*="ResponsiveHeader"]');
      
      const originalFooterDisplay = footer ? (footer as HTMLElement).style.display : '';
      const originalHeaderNavDisplay = headerNav ? (headerNav as HTMLElement).style.display : '';
      const originalResponsiveHeaderDisplay = responsiveHeader ? (responsiveHeader as HTMLElement).style.display : '';
      
      if (footer) (footer as HTMLElement).style.display = 'none';
      if (headerNav) (headerNav as HTMLElement).style.display = 'none';
      if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = 'none';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capturar el contenido
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: printRef.current.scrollWidth,
        windowHeight: printRef.current.scrollHeight,
        ignoreElements: (element) => {
          return element.classList?.contains('print:hidden') || 
                 element.classList?.contains('no-print') || 
                 element.classList?.contains('fixed') ||
                 element.tagName === 'BUTTON';
        },
      });
      
      // Restaurar elementos
      if (footer) (footer as HTMLElement).style.display = originalFooterDisplay;
      if (headerNav) (headerNav as HTMLElement).style.display = originalHeaderNavDisplay;
      if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = originalResponsiveHeaderDisplay;
      
      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight); // Margen de 10mm
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      const yOffset = 10; // Margen superior
      
      // Si la imagen es más alta que una página, dividirla
      if (imgScaledHeight > pdfHeight - 20) {
        let heightLeft = imgScaledHeight;
        let position = yOffset;
        
        pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight);
        heightLeft -= (pdfHeight - 20);
        
        while (heightLeft > 0) {
          position = heightLeft - imgScaledHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight);
          heightLeft -= (pdfHeight - 20);
        }
      } else {
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      }
      
      const fileName = `Rechnung_${serviceInvoice.invoiceNumber || serviceInvoice.id}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF erfolgreich heruntergeladen', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Fehler beim Erstellen des PDFs', { id: 'pdf-download' });
    }
  };

  const issuer = invoice.issuer;
  const recipient = invoice.recipient;

  // Responsive padding - adjusted for better visual
  const px = isMobile ? 'px-4' : 'px-8 lg:px-12';

  return (
    <div className="w-full">
      {/* ── Toolbar ── */}
      {showActions && (
        <div className={`flex items-center justify-between mb-4 print:hidden ${isMobile ? 'px-4' : ''}`}>
          <StatusBadge status={invoice.status} />
          <ActionBar onPrint={handlePrint} onDownload={handleDownload} />
        </div>
      )}

      {/* ── Invoice Paper ── */}
      <div
        ref={printRef}
        id="invoice-content"
        className={`
          bg-white
          ${isMobile ? 'rounded-xl shadow-sm' : 'rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)]'}
          overflow-hidden
          print:shadow-none print:rounded-none
        `}
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {/* Green accent stripe */}
        <div className="h-[3px] bg-[#25D076]" />

        {/* ═══ HEADER ═══ */}
        <div className={`${px} pt-6 pb-5 md:pt-8 md:pb-6`}>
          <div className="flex justify-between items-start gap-4">
            {/* Issuer info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                {/* Logo mark */}
                <div className="w-9 h-9 bg-[#25D076] rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm leading-none">
                    {issuer.name?.charAt(0) || 'R'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 tracking-wide truncate">
                    {issuer.name}
                  </div>
                  {issuer.mwstNummer && (
                    <div className="text-[10px] text-gray-400 font-mono tracking-wider">
                      {issuer.mwstNummer}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed">
                {issuer.street && <div>{issuer.street}</div>}
                <div>
                  {issuer.zip} {issuer.city}
                </div>
                {issuer.country && <div>{issuer.country}</div>}
              </div>
            </div>

            {/* Title + meta */}
            <div className="text-right flex-shrink-0">
              <h1
                className="text-2xl md:text-[32px] font-extralight text-gray-900 leading-none"
                style={{ letterSpacing: '-0.03em' }}
              >
                Rechnung
              </h1>
              <div className="mt-3 space-y-0.5">
                {([
                  { label: 'Nr.', value: invoice.nummer, bold: false },
                  { label: 'Datum', value: formatDate(invoice.datum), bold: false },
                  invoice.leistungsDatum && {
                    label: 'Leistung',
                    value: formatDate(invoice.leistungsDatum),
                    bold: false,
                  },
                  {
                    label: 'Fällig',
                    value: formatDate(invoice.faelligkeitsDatum),
                    bold: true,
                  },
                ] as Array<{ label: string; value: string; bold: boolean } | false>)
                  .filter((item): item is { label: string; value: string; bold: boolean } => Boolean(item))
                  .map((meta) => (
                    <div key={meta.label} className="text-[11px] text-gray-400 flex items-baseline justify-end gap-2">
                      <span className="w-16 text-right">{meta.label}</span>
                      <span
                        className={`${
                          meta.bold
                            ? 'text-gray-900 font-bold'
                            : 'text-gray-600 font-medium'
                        }`}
                      >
                        {meta.value}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Mobile-only status badge */}
              {isMobile && !showActions && (
                <div className="mt-3">
                  <StatusBadge status={invoice.status} />
                </div>
              )}
            </div>
          </div>

          {/* Recipient */}
          <div className="mt-6 md:mt-8">
            <SectionLabel>Rechnungsempfänger</SectionLabel>
            <div className="text-[13px] text-gray-800 leading-relaxed">
              <div className="font-semibold">{recipient.name}</div>
              {recipient.street && (
                <div className="text-gray-500">{recipient.street}</div>
              )}
              <div className="text-gray-500">
                {recipient.zip} {recipient.city}
              </div>
              {recipient.uid && (
                <div className="text-[11px] text-gray-400 font-mono mt-1">
                  {recipient.uid}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ LINE ITEMS ═══ */}
        <div className={px}>
          {/* Table header */}
          <div
            className={`
              grid gap-2 py-2.5
              border-y-2 border-[#25D076]
              text-[9px] md:text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold
              select-none
              ${isMobile ? 'grid-cols-12' : 'grid-cols-12'}
            `}
          >
            <div className="col-span-1 hidden md:block">Pos</div>
            <div className={isMobile ? 'col-span-7' : 'col-span-5'}>Beschreibung</div>
            {!isMobile && <div className="col-span-1 text-right">Menge</div>}
            {!isMobile && <div className="col-span-2 text-right">Einzelpreis</div>}
            <div className={`${isMobile ? 'col-span-2' : 'col-span-1'} text-center`}>MwSt</div>
            <div className={`${isMobile ? 'col-span-3' : 'col-span-2'} text-right`}>Betrag</div>
          </div>

          {/* Table rows */}
          {invoice.items?.map((item, index) => (
            <div
              key={item.id}
              className={`
                grid gap-2 py-3 md:py-3.5
                ${index < (invoice.items?.length ?? 0) - 1 ? 'border-b border-gray-100' : ''}
                ${isMobile ? 'grid-cols-12' : 'grid-cols-12'}
              `}
            >
              {/* Position number — desktop only */}
              {!isMobile && (
                <div className="col-span-1 text-[11px] text-gray-300 font-mono pt-0.5">
                  {String(index + 1).padStart(2, '0')}
                </div>
              )}

              {/* Description */}
              <div className={isMobile ? 'col-span-7' : 'col-span-5'}>
                <div className="text-[12px] md:text-[13px] text-gray-800 font-medium leading-snug">
                  {item.description}
                </div>
                {item.detail && (
                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    {item.detail}
                  </div>
                )}
                {/* Mobile quantity info */}
                {isMobile && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {item.quantity} × {formatCHF(item.unitPrice)}
                  </div>
                )}
              </div>

              {/* Quantity — desktop only */}
              {!isMobile && (
                <div className="col-span-1 text-right text-[13px] text-gray-500 pt-0.5 tabular-nums">
                  {item.quantity}
                </div>
              )}

              {/* Unit price — desktop only */}
              {!isMobile && (
                <div className="col-span-2 text-right text-[13px] text-gray-500 pt-0.5 tabular-nums">
                  {formatCHF(item.unitPrice)}
                </div>
              )}

              {/* MwSt code */}
              <div className={`${isMobile ? 'col-span-2' : 'col-span-1'} flex justify-center pt-0.5`}>
                <MwStCodeBadge code={item.mwstCode} rate={item.mwstRate} />
              </div>

              {/* Total */}
              <div
                className={`${isMobile ? 'col-span-3' : 'col-span-2'} text-right text-[12px] md:text-[13px] text-gray-900 font-semibold pt-0.5 tabular-nums`}
              >
                {formatCHF(item.totalBrutto)}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ TOTALS ═══ */}
        <div className={`${px} mt-4 mb-5 md:mb-6`}>
          <div className={`flex ${isMobile ? 'justify-end' : 'justify-end'}`}>
            <div className={isMobile ? 'w-full' : 'w-72'}>
              {/* Subtotal netto */}
              <div className="flex justify-between py-1.5 text-[12px]">
                <span className="text-gray-400">Zwischensumme netto</span>
                <span className="text-gray-600 font-medium tabular-nums">
                  {formatCHF(totalNetto)}
                </span>
              </div>

              {/* MwSt lines */}
              {breakdown.map((g) => (
                <div key={g.code} className="flex justify-between items-center py-1 text-[12px]">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <MwStCodeBadge code={g.code} rate={g.rate} />
                    <span>MwSt {formatMwStRate(g.rate)}</span>
                  </span>
                  <span className="text-gray-500 tabular-nums">{formatCHF(g.mwst)}</span>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t-2 border-[#25D076] my-2.5" />

              {/* Grand total */}
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-semibold">
                  Gesamtbetrag {invoice.waehrung || 'CHF'}
                </span>
                <span
                  className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {formatCHF(totalBrutto)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MWST SUMMARY TABLE ═══ */}
        {breakdown.length > 0 && (
          <div className={`${px} pb-4`}>
            <div className="bg-gray-50 rounded-lg p-4 md:p-5">
              <SectionLabel>MwSt-Zusammenfassung</SectionLabel>
              <div className="grid grid-cols-5 gap-3 text-[9px] md:text-[10px] text-gray-400 font-semibold uppercase tracking-[0.1em] pb-2 border-b border-gray-200">
                <div>Code</div>
                <div>Satz</div>
                <div className="text-right">Brutto</div>
                <div className="text-right">Netto</div>
                <div className="text-right">MwSt</div>
              </div>
              {breakdown.map((g) => (
                <div
                  key={g.code}
                  className="grid grid-cols-5 gap-3 text-[11px] md:text-[12px] py-1.5"
                >
                  <div>
                    <MwStCodeBadge code={g.code} rate={g.rate} />
                  </div>
                  <div className="text-gray-500 tabular-nums">{formatMwStRate(g.rate)}</div>
                  <div className="text-right text-gray-500 tabular-nums">{formatCHF(g.brutto)}</div>
                  <div className="text-right text-gray-500 tabular-nums">{formatCHF(g.netto)}</div>
                  <div className="text-right text-gray-800 font-semibold tabular-nums">
                    {formatCHF(g.mwst)}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-3 text-[11px] md:text-[12px] pt-2 border-t border-gray-200 font-semibold text-gray-800">
                <div className="col-span-2">Total</div>
                <div className="text-right tabular-nums">{formatCHF(totalBrutto)}</div>
                <div className="text-right tabular-nums">{formatCHF(totalNetto)}</div>
                <div className="text-right tabular-nums">{formatCHF(totalMwst)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ NOTES ═══ */}
        {invoice.notes && (
          <div className={`${px} pb-4`}>
            <p className="text-[11px] text-gray-400 leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* ═══ QR-RECHNUNG (PAYMENT SLIP) ═══ */}
        {issuer.iban && (
          <>
            <div className={`${px}`}>
              <CutLine />
            </div>

            <div className={`${px} pb-8`}>
              <div className="border-2 border-[#25D076] rounded-sm overflow-hidden">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} ${isMobile ? '' : 'divide-x-2'} divide-[#25D076]`}>
                  {/* Left: Zahlteil (Payment section) */}
                  <div className="p-4 md:p-5">
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 text-gray-900">
                      Zahlteil
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col' : ''} gap-4`}>
                      <QRCodePlaceholder />
                      <div className="text-[10px] md:text-[11px] space-y-2.5 flex-1 min-w-0">
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                            Konto / Zahlbar an
                          </div>
                          <div className="text-gray-800 leading-relaxed font-mono text-[10px]">
                            {issuer.iban}
                          </div>
                          <div className="text-gray-700 leading-relaxed">
                            {issuer.name}
                            <br />
                            {issuer.street && <>{issuer.street}<br /></>}
                            {issuer.zip} {issuer.city}
                          </div>
                        </div>
                        {invoice.referenz && (
                          <div>
                            <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                              Referenz
                            </div>
                            <div className="text-gray-800 font-mono text-[10px]">
                              {invoice.referenz}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                            Zahlbar durch
                          </div>
                          <div className="text-gray-700 leading-relaxed">
                            {recipient.name}
                            <br />
                            {recipient.street && <>{recipient.street}<br /></>}
                            {recipient.zip} {recipient.city}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-4 mt-4 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                          Währung
                        </div>
                        <div className="text-[12px] font-bold text-gray-900">
                          {invoice.waehrung || 'CHF'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                          Betrag
                        </div>
                        <div className="text-[12px] font-bold text-gray-900 tabular-nums">
                          {formatCHF(totalBrutto)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Empfangsschein (Receipt) */}
                  <div className={`p-4 md:p-5 ${isMobile ? 'border-t-2 border-[#25D076]' : ''}`}>
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3 text-gray-900">
                      Empfangsschein
                    </div>
                    <div className="text-[10px] space-y-2.5">
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                          Konto / Zahlbar an
                        </div>
                        <div className="text-gray-800 font-mono text-[10px] leading-relaxed">
                          {issuer.iban}
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {issuer.name}
                          <br />
                          {issuer.zip} {issuer.city}
                        </div>
                      </div>
                      {invoice.referenz && (
                        <div>
                          <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                            Referenz
                          </div>
                          <div className="text-gray-800 font-mono text-[10px]">
                            {invoice.referenz}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-400 text-[9px] font-semibold uppercase tracking-[0.1em] mb-0.5">
                          Zahlbar durch
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {recipient.name}
                          <br />
                          {recipient.zip} {recipient.city}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-4 pt-2 border-t border-gray-200">
                        <div>
                          <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                            Währung
                          </div>
                          <div className="text-[11px] font-bold text-gray-900">
                            {invoice.waehrung || 'CHF'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                            Betrag
                          </div>
                          <div className="text-[11px] font-bold text-gray-900 tabular-nums">
                            {formatCHF(totalBrutto)}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <div className="text-gray-400 text-[9px] uppercase tracking-[0.1em] font-semibold">
                          Annahmestelle
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ FOOTER ═══ */}
        <div className={`${px} py-4 border-t border-gray-100`}>
          <div className={`flex ${isMobile ? 'flex-col gap-1' : 'justify-between'} text-[10px] text-gray-300`}>
            <div>
              {issuer.name}
              {issuer.mwstNummer && <> · {issuer.mwstNummer}</>}
            </div>
            <div>
              {issuer.bank && <>{issuer.bank} · </>}
              {issuer.iban}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
