"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  X,
  Plus,
  AlertCircle,
  Package,
  Percent,
  FolderOpen,
  CheckCircle,
  QrCode,
  ScanLine,
  Download,
} from "lucide-react";
import { SharedFormProps } from "./types";

export default function DesktopForm(props: SharedFormProps) {
  const {
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    productPrice,
    setProductPrice,
    productCategory,
    setProductCategory,
    productImages,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setProductImages, // Not used directly (handled by handleImageUpload)
    handleImageUpload,
    handleRemoveImage,
    isActive,
    setIsActive,
    hasPromotion,
    setHasPromotion,
    promotionPrice,
    setPromotionPrice,
    promotionDuration,
    setPromotionDuration,
    customEndDate,
    setCustomEndDate,
    hasVariants,
    variants,
    vatRate,
    setVatRate,
    errors,
    showSuccessModal,
    createdProduct,
    handleModalClose,
    handleSave,
    validateField,
    addVariant,
    removeVariant,
    updateVariant,
    handleToggleVariants,
    categories,
    vatRates,
  } = props;
  // Renderizar modales fuera del contenedor usando Portal
  // Auto-cerrar modal después de 4 segundos
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showSuccessModal) {
      // Limpiar timeout anterior si existe
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      
      // Configurar auto-cierre después de 4 segundos
      autoCloseTimeoutRef.current = setTimeout(() => {
        handleModalClose();
      }, 4000);

      return () => {
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
      };
    }
  }, [showSuccessModal, handleModalClose]);

  const successModalContent = showSuccessModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop con blur moderno - cubre toda la pantalla */}
      <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-md"></div>
      
      {/* Modal moderno con animación */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300" style={{ pointerEvents: 'auto' }}>
            {/* Gradiente superior */}
            <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-10 text-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                ¡Éxito!
              </h3>
            </div>

            {/* Contenido del modal */}
            <div className="p-8">
              <p className="text-gray-700 mb-8 text-center text-lg">
                {props.isEditMode ? (
                  <>El producto <span className="font-semibold text-gray-900">&quot;{createdProduct?.name}&quot;</span> ha sido actualizado exitosamente</>
                ) : (
                  <>Su producto <span className="font-semibold text-gray-900">&quot;{createdProduct?.name}&quot;</span> ha sido creado exitosamente</>
                )}
              </p>
              <p className="text-gray-500 text-sm text-center mb-6">
                Redirigiendo automáticamente en 4 segundos...
              </p>

              {/* Tarjeta de información */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-600">ID del Producto:</span>
                  <span className="text-base text-gray-900 font-mono font-semibold bg-white/70 px-4 py-2 rounded-lg">
                    {createdProduct?.id}
                  </span>
                </div>
              </div>

              {/* Botón principal */}
              <button
                onClick={handleModalClose}
                className="w-full bg-gradient-to-r from-[#25D076] to-[#20BA68] text-white py-5 px-8 rounded-2xl font-semibold hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-ios text-lg flex items-center justify-center gap-2 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <CheckCircle className="w-6 h-6" />
                {props.isEditMode ? 'Volver a la Lista' : 'Ir al Catálogo'}
              </button>
            </div>
          </div>
        </div>
      );


  // Obtener contenedor de modales global o usar body como fallback
  const getModalContainer = () => {
    if (typeof window === 'undefined') return null;
    const globalContainer = document.getElementById('global-modals-container');
    return globalContainer || document.body;
  };

  const modalContainer = getModalContainer();

  return (
    <>
      {/* Renderizar modales fuera del contenedor usando Portal en el contenedor global */}
      {modalContainer && showSuccessModal && createPortal(successModalContent, modalContainer)}

      <div className="max-w-6xl mx-auto p-8">
        {/* Form Content - Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images and Basic Info */}
        <div className="space-y-6">
          {/* Produktbilder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Produktbilder</h3>
              <div className="text-gray-500 text-sm font-medium">
                {productImages.length}/3
              </div>
            </div>

            {/* Área de preview de imágenes */}
            {productImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div
                      className="w-full h-32 rounded-lg border border-gray-200 bg-white overflow-hidden"
                      style={{ aspectRatio: "1/1" }}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${image ? 'hidden' : ''}`}>
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                        Haupt
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {productImages.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <div className="space-y-3">
                  <label className="w-full bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 py-3 cursor-pointer hover:bg-brand-600">
                    <Camera className="w-4 h-4" />
                    <span>Foto aufnehmen</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="w-full bg-white text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 py-3 border border-gray-300 cursor-pointer hover:bg-gray-50">
                    <FolderOpen className="w-4 h-4" />
                    <span>Aus Galerie wählen</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  {productImages.length === 0
                    ? "Erstes Bild wird als Hauptbild verwendet"
                    : `Noch ${3 - productImages.length} Bild${3 - productImages.length > 1 ? 'er' : ''} möglich`}
                </div>
              </div>
            )}
          </div>

          {/* Grunddaten */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grunddaten</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Produktname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    validateField("productName", e.target.value);
                  }}
                  placeholder="Äpfel Gala Suisse"
                  maxLength={50}
                  className={`w-full h-12 p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-medium transition-colors bg-white ${
                    errors.productName ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.productName && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-500 text-sm">{errors.productName}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Beschreibung <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Bsp: Original Edition"
                  rows={3}
                  maxLength={100}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-base bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => {
                    setProductCategory(e.target.value);
                    // validateField ya se llama dentro de handleCategoryChange
                  }}
                  className={`w-full h-12 p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base transition-colors bg-white ${
                    errors.productCategory ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={categories.length === 0}
                >
                  <option value="">
                    {categories.length === 0 ? "Keine Kategorien verfügbar" : "Kategorie wählen..."}
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Pricing and Settings */}
        <div className="space-y-6">
          {/* Preis */}
          {!hasVariants && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preis</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preis <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={productPrice}
                    onChange={(e) => {
                      setProductPrice(e.target.value);
                      validateField("productPrice", e.target.value);
                    }}
                    placeholder="8.50"
                    className={`w-full h-12 p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base font-medium transition-colors bg-white ${
                      errors.productPrice ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    CHF
                  </div>
                </div>
                {errors.productPrice && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-500 text-sm">{errors.productPrice}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aktion Toggle */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Percent className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="text-base font-semibold text-gray-800">Aktion</div>
                  <div className="text-sm text-gray-500">Reduzierter Preis anbieten</div>
                </div>
              </div>
              <button
                onClick={() => setHasPromotion(!hasPromotion)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  hasPromotion ? "bg-brand-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    hasPromotion ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {hasPromotion && (
              <div className="space-y-4">
                <select
                  value={promotionDuration}
                  onChange={(e) => setPromotionDuration(e.target.value)}
                  className="w-full h-12 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base bg-white"
                >
                  <option value="">Aktionsdauer...</option>
                  <option value="1_day">1 Tag</option>
                  <option value="3_days">3 Tage</option>
                  <option value="1_week">1 Woche</option>
                  <option value="2_weeks">2 Wochen</option>
                  <option value="1_month">1 Monat</option>
                  <option value="custom">Enddatum wählen</option>
                </select>

                {promotionDuration === "custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enddatum
                    </label>
                    <input
                      type="datetime-local"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full h-12 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base bg-white"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                {!hasVariants && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Aktionspreis <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        value={promotionPrice}
                        onChange={(e) => {
                          setPromotionPrice(e.target.value);
                          validateField("promotionPrice", e.target.value);
                        }}
                        placeholder="6.50"
                        className={`w-full h-12 p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base text-[#FD3F37] font-medium transition-colors bg-white ${
                          errors.promotionPrice ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        CHF
                      </div>
                    </div>
                    {errors.promotionPrice && (
                      <div className="flex items-center space-x-1 mt-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-red-500 text-sm">{errors.promotionPrice}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Varianten Toggle */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="text-base font-semibold text-gray-800">Varianten</div>
                  <div className="text-sm text-gray-500">Produktausprägungen anbieten</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleVariants(!hasVariants)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  hasVariants ? "bg-brand-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    hasVariants ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {hasVariants && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 justify-between">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) =>
                            updateVariant(index, "name", e.target.value)
                          }
                          placeholder="Bsp: Gross (1Kg)"
                          className="flex-1 p-3 w-full h-12 border border-gray-200 rounded-lg text-base bg-white"
                        />
                        {variants.length > 1 && (
                          <button
                            onClick={async () => {
                              await removeVariant(index);
                            }}
                            className="w-10 h-10 bg-[#FD3F37] text-white rounded-full flex items-center justify-center hover:bg-[#FD3F37]/80 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-black font-semibold mb-2">
                            Preis <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.05"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(index, "price", e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full p-3 pl-12 h-12 border border-gray-200 rounded-lg text-base text-left font-medium bg-white"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                              CHF
                            </div>
                          </div>
                        </div>

                        {hasPromotion && (
                          <div>
                            <label className="block text-sm text-black font-semibold mb-2">
                              Aktionspreis <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.05"
                                value={variant.promotionPrice}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "promotionPrice",
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                                className="w-full p-3 pl-12 h-12 border border-gray-200 rounded-lg text-base text-left font-medium bg-white text-[#FD3F37]"
                              />
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                CHF
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={addVariant}
                    className="bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors flex items-center justify-center space-x-2 px-4 py-3"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Neue Variante</span>
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Status and VAT */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isActive ? "bg-[#25D076]" : "bg-gray-400"
                    }`}
                  />
                  <div>
                    <div className="text-base font-semibold text-gray-800">
                      {isActive ? "Aktiv im Shop" : "Inaktiv im Shop"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isActive ? "Für Kunden sichtbar" : "Für Kunden unsichtbar"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isActive ? "bg-brand-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      isActive ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* MwSt Einstellung */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Mehrwertsteuer
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full h-12 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base bg-white"
                >
                  {vatRates.map((rate) => (
                    <option
                      key={rate.value}
                      value={rate.value}
                      className={rate.color}
                    >
                      {rate.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button - Desktop */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <button
              onClick={handleSave}
              disabled={false}
              className="w-full bg-gradient-to-r from-[#25D076] to-[#20BA68] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-ios text-base flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{props.isEditMode ? 'Änderungen speichern' : 'Produkt speichern'}</span>
            </button>
          </div>

          {/* Información adicional del producto (QR, Barcode, etc.) - Solo en modo edición */}
          {props.isEditMode && props.existingProduct && (
            <ProductAdditionalInfo product={props.existingProduct} />
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// Componente para mostrar información adicional del producto
function ProductAdditionalInfo({ product }: { product: { 
  id?: string;
  name?: string;
  qrCode?: string;
  barcodeImage?: string;
  barcode?: string;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
} }) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadQR = () => {
    if (!product?.qrCode) return;
    const link = document.createElement('a');
    link.href = product.qrCode;
    link.download = `QR_${product.name?.replace(/\s+/g, '_')}_${product.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBarcode = () => {
    if (!product?.barcodeImage) return;
    const link = document.createElement('a');
    link.href = product.barcodeImage;
    link.download = `Barcode_${product.name?.replace(/\s+/g, '_')}_${product.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* QR Code */}
      {product.qrCode && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-brand-500" />
              <h3 className="text-lg font-semibold text-gray-900">Código QR</h3>
            </div>
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
          <div className="flex justify-center bg-gray-50 rounded-xl p-6">
            <div className="text-center">
              <img 
                src={product.qrCode} 
                alt={`QR Code para ${product.name}`}
                className="w-64 h-64 mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-4">
                Escanea este código para identificar el producto
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barcode */}
      {product.barcodeImage && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-brand-500" />
              <h3 className="text-lg font-semibold text-gray-900">Código de Barras</h3>
            </div>
            <button
              onClick={handleDownloadBarcode}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
          <div className="flex justify-center bg-gray-50 rounded-xl p-6">
            <div className="text-center">
              <img 
                src={product.barcodeImage} 
                alt={`Código de barras para ${product.name}`}
                className="max-w-full h-auto mx-auto rounded-lg bg-white p-4"
              />
              <p className="text-sm text-gray-600 mt-4">
                Escanea este código de barras para identificar el producto
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Producto</h3>
        <div className="space-y-3">
          {product.sku && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">SKU</span>
              <span className="text-gray-900 font-mono text-sm">{product.sku}</span>
            </div>
          )}
          {product.barcode && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Código de Barras</span>
              <span className="text-gray-900 font-mono text-sm">{product.barcode}</span>
            </div>
          )}
          {product.createdAt && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Creado el</span>
              <span className="text-gray-900 font-medium text-sm">{formatDate(product.createdAt)}</span>
            </div>
          )}
          {product.updatedAt && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600">Última actualización</span>
              <span className="text-gray-900 font-medium text-sm">{formatDate(product.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
