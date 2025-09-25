"use client";

import React from "react";
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
    setProductImages,
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
    validateField,
    addVariant,
    removeVariant,
    updateVariant,
    handleToggleVariants,
    categories,
    vatRates,
  } = props;
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 bg-[#25D076] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Produkt erfolgreich erstellt!
            </h3>

            <p className="text-gray-600 mb-8 text-lg">
              Ihr Produkt &quot;{createdProduct?.name}&quot; wurde erfolgreich zum Katalog hinzugefügt.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium text-gray-700">Produkt-ID:</span>
                <span className="text-base text-gray-900 font-mono">{createdProduct?.id}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium text-gray-700">SKU:</span>
                <span className="text-base text-gray-900 font-mono">{createdProduct?.sku}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700">Barcode:</span>
                <span className="text-base text-gray-900 font-mono">{createdProduct?.barcode}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleModalClose}
                className="flex-1 bg-[#25D076] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#25D076]/90 transition-colors text-lg"
              >
                Zum Produktkatalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {saveProgress > 0 && (
        <div className="bg-white border-b border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#25D076]" />
            <span className="text-base text-gray-700">Speichert Produkt...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#25D076] h-3 rounded-full transition-all duration-300"
              style={{ width: `${saveProgress}%` }}
            />
          </div>
        </div>
      )}

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
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 bg-white flex items-center justify-center"
                      style={{ aspectRatio: "1/1" }}
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <button
                      onClick={() =>
                        setProductImages(
                          productImages.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
                  <button
                    onClick={() =>
                      setProductImages([...productImages, `photo_${Date.now()}`])
                    }
                    className="w-full bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 py-3"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Foto aufnehmen</span>
                  </button>
                  <button
                    onClick={() =>
                      setProductImages([
                        ...productImages,
                        `gallery_${Date.now()}`,
                      ])
                    }
                    className="w-full bg-white text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 py-3 border border-gray-300"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Galerie</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  {productImages.length === 0
                    ? "Erstes Bild wird als Hauptbild verwendet"
                    : "Weitere Bilder hinzufügen"}
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
                    validateField("productCategory", e.target.value);
                  }}
                  className={`w-full h-12 p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base transition-colors bg-white ${
                    errors.productCategory ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">Kategorie wählen...</option>
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
          {/* Preis und Lagerbestand */}
          {!hasVariants && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preis & Lagerbestand</h3>
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
                            onClick={() => removeVariant(index)}
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
        </div>
      </div>
    </div>
  );
}
