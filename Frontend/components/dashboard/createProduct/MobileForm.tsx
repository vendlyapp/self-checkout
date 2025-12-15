"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  X,
  Plus,
  AlertCircle,
  Loader2,
  Package,
  Percent,
  FolderOpen,
  CheckCircle,
  QrCode,
  ScanLine,
  Download,
} from "lucide-react";
import { SharedFormProps } from "./types";

export default function MobileForm(props: SharedFormProps) {
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
    saveProgress,
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

  // Renderizar modales fuera del contenedor usando Portal
  const successModalContent = showSuccessModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop con blur moderno - cubre toda la pantalla */}
      <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-md"></div>
      
      {/* Modal moderno con animación */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300" style={{ pointerEvents: 'auto' }}>
            {/* Gradiente superior */}
            <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ¡Éxito!
              </h3>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-gray-700 mb-4 text-center text-base">
                {props.isEditMode ? (
                  <>El producto <span className="font-semibold text-gray-900">&quot;{createdProduct?.name}&quot;</span> ha sido actualizado exitosamente</>
                ) : (
                  <>Su producto <span className="font-semibold text-gray-900">&quot;{createdProduct?.name}&quot;</span> ha sido creado exitosamente</>
                )}
              </p>
              <p className="text-gray-500 text-xs text-center mb-4">
                Redirigiendo automáticamente en 4 segundos...
              </p>

              {/* Tarjeta de información */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">ID del Producto:</span>
                  <span className="text-sm text-gray-900 font-mono font-semibold bg-white/70 px-3 py-1 rounded-lg">
                    {createdProduct?.id}
                  </span>
                </div>
              </div>

              {/* Botón principal */}
              <button
                onClick={handleModalClose}
                className="w-full bg-gradient-to-r from-[#25D076] to-[#20BA68] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base flex items-center justify-center gap-2 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <CheckCircle className="w-5 h-5" />
                {props.isEditMode ? 'Volver a la Lista' : 'Ir al Catálogo'}
              </button>
            </div>
          </div>
        </div>
      );

  const loadingModalContent = saveProgress > 0 && (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop con blur moderno */}
      <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-md"></div>
      
      {/* Modal de carga moderno */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300" style={{ pointerEvents: 'auto' }}>
            {/* Gradiente superior */}
            <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {props.isEditMode ? 'Guardando Cambios...' : 'Guardando Producto...'}
              </h3>
              <p className="text-white/90 text-xs">
                {props.isEditMode ? 'Por favor espera' : 'Por favor espera'}
              </p>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Progreso</span>
                  <span className="text-xs font-semibold text-brand-500">{Math.round(saveProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#25D076] to-[#20BA68] h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${saveProgress}%` }}
                  />
                </div>
              </div>

              {/* Mensaje de estado */}
              <div className="text-center">
                <p className="text-gray-600 text-xs">
                  {saveProgress < 25 && 'Validando datos...'}
                  {saveProgress >= 25 && saveProgress < 50 && 'Subiendo imágenes...'}
                  {saveProgress >= 50 && saveProgress < 75 && 'Generando códigos...'}
                  {saveProgress >= 75 && saveProgress < 100 && 'Finalizando...'}
                  {saveProgress >= 100 && '¡Completado!'}
                </p>
              </div>
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
      {modalContainer && saveProgress > 0 && createPortal(loadingModalContent, modalContainer)}

      <div className="block mx-auto lg:m-10 ml-5 mr-5 bg-background-cream min-h-screen pt-4 pb-24">
        {/* Content */}
        <div className="pl-1 pr-1 space-y-5">
        {/* Produktbilder */}
        <div>
          <div className="relative mb-2">
            <div className="top-2 right-2 z-10 flex justify-between pb-4">
              <p className="text-black px-2 text-sm font-medium">
                Produktbilder
              </p>
              <div className="text-gray-500 px-3 py-1 text-sm font-medium">
                {productImages.length}/3
              </div>
            </div>

            {/* Área de preview de imágenes */}
            {productImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {productImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div
                      className="w-[120px] h-[120px] rounded-lg border border-gray-200 bg-white overflow-hidden"
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
                        <Camera className="w-10 h-10 text-gray-400" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                        Haupt
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Area */}
          {productImages.length < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-background-cream">
              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="space-y-2 flex flex-col items-center">
                <label className="w-[283px] h-[46px] bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer hover:bg-brand-600">
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
                <label className="w-[283px] h-[46px] bg-white text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer border border-gray-300 hover:bg-gray-50">
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
              <div className="text-xs text-gray-500 mt-2">
                {productImages.length === 0
                  ? "Erstes Bild wird als Hauptbild verwendet"
                  : `Noch ${3 - productImages.length} Bild${3 - productImages.length > 1 ? 'er' : ''} möglich`}
              </div>
            </div>
          )}
        </div>

        {/* Grunddaten */}
        <div className="space-y-4">
          <div>
            <label className="block text-[16px] font-semibold text-gray-700 mb-2">
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
              className={`w-full h-[46px] p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] font-medium transition-colors bg-white ${
                errors.productName ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.productName && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="text-red-500 text-xs">{errors.productName}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[16px] font-semibold text-gray-700 mb-2">
              Beschreibung <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Bsp: Original Edition"
              rows={2}
              maxLength={100}
              className="w-full h-[60px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-[16px] bg-white"
            />
          </div>

          <div>
            <label className="block text-[16px] font-semibold text-gray-700 mb-2">
              Kategorie <span className="text-red-500">*</span>
            </label>
            <select
              value={productCategory}
              onChange={(e) => {
                setProductCategory(e.target.value);
                // validateField ya se llama dentro de handleCategoryChange
              }}
              className={`w-full h-[46px] p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] transition-colors bg-white ${
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

          {/* Preis ohne Varianten */}
          {!hasVariants && (
            <div>
              <label className="block text-[16px] font-semibold text-gray-700 mb-2">
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
                  className={`w-full h-[46px] p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] font-medium transition-colors bg-white ${
                    errors.productPrice ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  CHF
                </div>
              </div>
              {errors.productPrice && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <p className="text-red-500 text-xs">
                    {errors.productPrice}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aktion Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Percent className="w-[30px] h-[30px]" />
              <div>
                <div className="text-sm font-semibold text-[16px] text-gray-800">
                  Aktion
                </div>
                <div className="text-[14px] text-gray-500">
                  Reduzierter Preis anbieten
                </div>
              </div>
            </div>
            <button
              onClick={() => setHasPromotion(!hasPromotion)}
              className={`relative w-[56px] h-[28px] rounded-full transition-colors ${
                hasPromotion ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full transition-transform ${
                  hasPromotion ? "translate-x-[31px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </div>

          {hasPromotion && (
            <div className="space-y-3">
              <select
                value={promotionDuration}
                onChange={(e) => setPromotionDuration(e.target.value)}
                className="w-full h-[46px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] bg-white"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Enddatum
                  </label>
                  <input
                    type="datetime-local"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full h-[46px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] bg-white"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}

              {/* Campo de precio de promoción */}
              {!hasVariants && (
                <div>
                  <label className="block text-[16px] font-semibold text-gray-700 mb-2">
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
                      className={`w-full h-[46px] p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] text-[#FD3F37] font-medium transition-colors bg-white ${
                        errors.promotionPrice
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      CHF
                    </div>
                  </div>
                  {errors.promotionPrice && (
                    <div className="flex items-center space-x-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">
                        {errors.promotionPrice}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Varianten Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-[30px] h-[30px]" />
              <div>
                <div className="text-sm font-semibold text-[16px] text-gray-800">
                  Varianten
                </div>
                <div className="text-[14px] text-gray-500">
                  Produktausprägungen anbieten
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggleVariants(!hasVariants)}
              className={`relative w-[56px] h-[28px] rounded-full transition-colors ${
                hasVariants ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full transition-transform ${
                  hasVariants ? "translate-x-[31px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </div>

          {hasVariants && (
            <div className="space-y-3">
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-3 bg-background-cream rounded-lg border-2 border-white"
                  >
                    <div className="flex items-center space-x-2 justify-between w-full">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(index, "name", e.target.value)
                        }
                        placeholder="Bsp: Gross (1Kg)"
                        className="flex-1 p-2 w-full h-[46px] border border-gray-200 rounded-sm text-sm bg-white"
                      />
                      {variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(index)}
                          className="w-8 h-8 bg-[#FD3F37] text-white rounded-full flex items-center justify-center hover:bg-[#FD3F37]/80 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[14px] text-black font-semibold mb-1">
                          Preis <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex justify-center h-[46px] w-full">
                          <input
                            type="number"
                            step="0.05"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(index, "price", e.target.value)
                            }
                            placeholder="0.00"
                            className="w-full p-2 pl-12 h-[46px] border border-gray-200 rounded-sm text-[16px] text-left font-medium bg-white"
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            CHF
                          </div>
                        </div>
                      </div>

                      {hasPromotion && (
                        <div>
                          <label className="block text-[14px] text-black font-semibold mb-1">
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
                              className="w-full p-2 pl-12 h-[46px] border border-gray-200 rounded-sm text-[16px] text-left font-medium bg-white text-[#FD3F37]"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
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
                  className="w-[155px] h-[36px] bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Neue Variante</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-[#25D076]" : "bg-gray-400"
                }`}
              />
              <div>
                <div className="text-sm font-semibold text-[16px] text-gray-800">
                  {isActive ? "Aktiv im Shop" : "Inaktiv im Shop"}
                </div>
                <div className="text-xs text-gray-500">
                  {isActive ? "Für Kunden sichtbar" : "Für Kunden unsichtbar"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative w-[56px] h-[28px] rounded-full transition-colors ${
                isActive ? "bg-brand-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-[3px] w-[22px] h-[22px] bg-white rounded-full transition-transform ${
                  isActive ? "translate-x-[31px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* MwSt Einstellung */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-black mb-2">
            Mehrwertsteuer
          </label>
          <select
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            className="w-full h-[46px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
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

        {/* Save Button - Mobile (solo en modo edición) */}
        {props.isEditMode && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mt-5">
            <button
              onClick={handleSave}
              disabled={saveProgress > 0}
              className="w-full bg-gradient-to-r from-[#25D076] to-[#20BA68] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saveProgress > 0 ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Speichert Änderungen...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Änderungen speichern</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Información adicional del producto (QR, Barcode, etc.) - Solo en modo edición */}
        {props.isEditMode && props.existingProduct && (
          <ProductAdditionalInfoMobile product={props.existingProduct} />
        )}

        </div>
      </div>
    </>
  );
}

// Componente para mostrar información adicional del producto en móvil
function ProductAdditionalInfoMobile({ product }: { product: { 
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
    <div className="space-y-5 mt-5">
      {/* QR Code */}
      {product.qrCode && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Código QR</h3>
            </div>
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
            <img 
              src={product.qrCode} 
              alt={`QR Code para ${product.name}`}
              className="w-48 h-48 rounded-lg shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-3 text-center">
              Escanea este código para ver el producto
            </p>
          </div>
        </div>
      )}

      {/* Barcode */}
      {product.barcodeImage && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Código de Barras</h3>
            </div>
            <button
              onClick={handleDownloadBarcode}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
            <img 
              src={product.barcodeImage} 
              alt={`Código de barras para ${product.name}`}
              className="w-full max-w-md h-auto rounded-lg shadow-sm bg-white p-4"
            />
            <p className="text-xs text-gray-500 mt-3 text-center">
              Escanea este código de barras para identificar el producto
            </p>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200">
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
