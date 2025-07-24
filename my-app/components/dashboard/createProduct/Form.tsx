'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Camera, X, Plus, Check, AlertCircle, Loader2, Package, Percent, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';


// Types
interface ProductVariant {
  name: string;
  price: string;
  promotionPrice: string;
}

interface FormErrors {
  productName?: string;
  productPrice?: string;
  productCategory?: string;
  promotionPrice?: string;
}

interface Category {
  value: string;
  icon: string;
  color: string;
}

interface VatRate {
  value: string;
  label: string;
  color: string;
}

export default function Form() {
  const router = useRouter();
  
  // Form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [stock, setStock] = useState(50);
  const [isActive, setIsActive] = useState(true);
  const [hasPromotion, setHasPromotion] = useState(false);
  const [promotionPrice] = useState('');
  const [promotionDuration, setPromotionDuration] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [hasVariants, setHasVariants] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { name: 'Bsp: Mini (250g)', price: '6.50', promotionPrice: '' },
    { name: 'Bsp: Klein (500g)', price: '0.00', promotionPrice: '' }
  ]);
  const [vatRate, setVatRate] = useState('0');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  // Data - Using useMemo to fix the warning
  const categories: Category[] = useMemo(() => [
    { value: 'Früchte', icon: '🍎', color: 'bg-red-50 text-red-700' },
    { value: 'Gemüse', icon: '🥕', color: 'bg-orange-50 text-orange-700' },
    { value: 'Alle', icon: '🛒', color: 'bg-gray-50 text-gray-700' }
  ], []);

  const vatRates: VatRate[] = useMemo(() => [
    { value: '2.6', label: '2.6% (Lebensmittel)', color: 'text-green-600' },
    { value: '8.1', label: '8.1% (Standard)', color: 'text-blue-600' },
    { value: '0', label: '0% (befreit)', color: 'text-gray-600' }
  ], []);

  // Validation
  const validateField = useCallback((field: keyof FormErrors, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'productName':
        if (!value.trim()) {
          newErrors.productName = 'Produktname ist erforderlich';
        } else if (value.length < 2) {
          newErrors.productName = 'Mindestens 2 Zeichen';
        } else if (value.length > 50) {
          newErrors.productName = 'Maximal 50 Zeichen';
        } else {
          delete newErrors.productName;
        }
        break;
      case 'productPrice':
        if (!hasVariants && (!value || parseFloat(value) <= 0)) {
          newErrors.productPrice = 'Gültiger Preis erforderlich';
        } else if (!hasVariants && parseFloat(value) > 9999) {
          newErrors.productPrice = 'Preis zu hoch';
        } else {
          delete newErrors.productPrice;
        }
        break;
      case 'productCategory':
        if (!value) {
          newErrors.productCategory = 'Kategorie wählen';
        } else {
          delete newErrors.productCategory;
        }
        break;
      case 'promotionPrice':
        if (hasPromotion && !value) {
          newErrors.promotionPrice = 'Aktionspreis erforderlich';
        } else if (hasPromotion && !hasVariants && parseFloat(value) >= parseFloat(productPrice)) {
          newErrors.promotionPrice = 'Aktionspreis muss kleiner sein';
        } else {
          delete newErrors.promotionPrice;
        }
        break;
    }
    setErrors(newErrors);
  }, [errors, hasVariants, hasPromotion, productPrice]);

  // Handlers
  const handleSave = useCallback(async () => {
    // Validation
    validateField('productName', productName);
    validateField('productCategory', productCategory);
    
    if (!hasVariants) {
      validateField('productPrice', productPrice);
    }
    if (hasPromotion) {
      validateField('promotionPrice', promotionPrice);
    }

    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    
    // Simulate progress steps
    const steps = [
      { message: 'Produktdaten validieren...', duration: 300 },
      { message: 'Bilder hochladen...', duration: 600 },
      { message: 'QR-Code generieren...', duration: 400 },
      { message: 'Katalog aktualisieren...', duration: 500 },
      { message: 'Abschließen...', duration: 200 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setSaveProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    setIsSaving(false);
    setSaveProgress(0);
    
    // Create product object matching your mock data structure
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      originalPrice: hasPromotion ? parseFloat(promotionPrice) : undefined,
      category: productCategory,
      categoryId: productCategory === 'Alle' ? 'all' : productCategory.toLowerCase(),
      stock: stock,
      barcode: `1234567890${Date.now()}`,
      sku: productName.toUpperCase().replace(/\s+/g, '-'),
      tags: productDescription ? productDescription.toLowerCase().split(' ') : [],
      isNew: true,
      rating: 0,
      reviews: 0,
      weight: hasVariants ? 0 : 1000, // Default weight
      dimensions: { length: 15, width: 12, height: 8 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasWeight: !hasVariants,
      discountPercentage: hasPromotion ? Math.round(((parseFloat(productPrice) - parseFloat(promotionPrice)) / parseFloat(productPrice)) * 100) : undefined
    };

    console.log('Nuevo producto creado:', newProduct);
    
    // Navigate back to products list
    router.push('/products_list');
  }, [productName, productDescription, productCategory, productPrice, promotionPrice, stock, hasVariants, hasPromotion, errors, validateField, router]);

  const addVariant = useCallback(() => {
    setVariants([...variants, { name: '', price: '', promotionPrice: '' }]);
  }, [variants]);

  const removeVariant = useCallback((index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  }, [variants]);

  const updateVariant = useCallback((index: number, field: keyof ProductVariant, value: string) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  }, [variants]);

  const getSelectedCategory = useCallback(() => {
    return categories.find(cat => cat.value === productCategory);
  }, [productCategory, categories]);

  const isFormValid = useMemo(() => {
    return productName && 
           productCategory && 
           ((!hasVariants && productPrice) || (hasVariants && variants.some(v => v.name && v.price))) &&
           Object.keys(errors).length === 0;
  }, [productName, productCategory, hasVariants, productPrice, variants, errors]);



    return (
    <div className="max-w-sm mx-auto bg-background-cream min-h-screen">
      
 
        {/* Progress Bar */}
        {isSaving && (
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
              <span className="text-sm text-gray-700">Speichert Produkt...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${saveProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 pb-20 space-y-5">
        
        {/* Produktbilder */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Produktbilder</label>
            <span className="text-xs text-gray-500">{productImages.length}/3</span>
          </div>
          
          {/* Images Preview - ARRIBA */}
          {productImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {productImages.map((image, index) => (
                <div key={index} className="relative">
                  <div 
                    className="w-full h-20 object-cover rounded-lg border border-gray-200 bg-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" 
                    style={{ aspectRatio: '1/1' }}
                  >
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setProductImages(productImages.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Haupt
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Area - ABAJO */}
          {productImages.length < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors bg-background-cream">
              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="space-y-2">
                <button 
                  onClick={() => setProductImages([...productImages, `photo_${Date.now()}`])}
                  className="w-full bg-brand-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Foto aufnehmen</span>
                </button>
                <button 
                  onClick={() => setProductImages([...productImages, `gallery_${Date.now()}`])}
                  className="w-full bg-white text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Galerie</span>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {productImages.length === 0 ? 'Erstes Bild wird als Hauptbild verwendet' : 'Weitere Bilder hinzufügen'}
              </div>
            </div>
          )}
        </div>

        {/* Grunddaten */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Produktname  <span className="text-red-500">*</span> </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                validateField('productName', e.target.value);
              }}
              placeholder="Äpfel Gala Suisse"
              maxLength={50}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium transition-colors bg-white ${
                errors.productName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.productName && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="text-red-500 text-xs">{errors.productName}</p>
              </div>
            )}
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">Kunden sehen diesen Namen</div>
              <div className="text-xs text-gray-500">{productName.length}/50</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung <span className="text-gray-500">(optional)</span></label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Bsp: Original Edition"
              rows={2}
              maxLength={100}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm bg-white"
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">Zusätzliche Informationen für Kunden</div>
              <div className="text-xs text-gray-500">{productDescription.length}/100</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie <span className="text-red-500">*</span></label>
            <select
              value={productCategory}
              onChange={(e) => {
                setProductCategory(e.target.value);
                validateField('productCategory', e.target.value);
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-colors bg-white ${
                errors.productCategory ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Kategorie wählen...</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.value}
                </option>
              ))}
            </select>
            {errors.productCategory && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="text-red-500 text-xs">{errors.productCategory}</p>
              </div>
            )}
            {productCategory && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSelectedCategory()?.color}`}>
                  {getSelectedCategory()?.icon} {productCategory}
                </span>
              </div>
            )}
          </div>

          {/* Preis und Lagerbestand ohne Varianten */}
          {!hasVariants && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preis <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={productPrice}
                    onChange={(e) => {
                      setProductPrice(e.target.value);
                      validateField('productPrice', e.target.value);
                    }}
                    placeholder="8.50"
                                      className={`w-full p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium transition-colors bg-white ${
                    errors.productPrice ? 'border-red-500' : 'border-gray-200'
                  }`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    CHF
                  </div>
                </div>
                {errors.productPrice && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <p className="text-red-500 text-xs">{errors.productPrice}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lagerbestand</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  placeholder="50"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-medium transition-colors bg-white"
                />
              </div>
            </div>
          )}

          {/* Varianten Info */}
          {hasVariants && (
                            <div className="bg-brand-50 p-3 rounded-lg border border-brand-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Package className="w-4 h-4 text-brand-600" />
                    <div className="text-sm font-medium text-brand-800">Varianten-Modus aktiv</div>
                  </div>
                  <div className="text-xs text-brand-600">
                    Verschiedene Ausprägungen mit individuellen Preisen
                  </div>
                </div>
          )}
        </div>

        {/* Aktion Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">Aktion</div>
                <div className="text-xs text-gray-500">Reduzierter Preis anbieten</div>
              </div>
            </div>
            <button
              onClick={() => setHasPromotion(!hasPromotion)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                hasPromotion ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  hasPromotion ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {hasPromotion && (
            <div className="space-y-3">
              <select
                value={promotionDuration}
                onChange={(e) => setPromotionDuration(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Aktionsdauer...</option>
                <option value="1_day">1 Tag</option>
                <option value="3_days">3 Tage</option>
                <option value="1_week">1 Woche</option>
                <option value="2_weeks">2 Wochen</option>
                <option value="1_month">1 Monat</option>
                <option value="custom">Enddatum wählen</option>
              </select>

              {promotionDuration === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Enddatum</label>
                  <input
                    type="datetime-local"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Varianten Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">Varianten</div>
                <div className="text-xs text-gray-500">Produktausprägungen anbieten</div>
              </div>
            </div>
            <button
              onClick={() => setHasVariants(!hasVariants)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                hasVariants ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  hasVariants ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {hasVariants && (
            <div className="space-y-3">
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="Bsp: Mini (250g)"
                        className="flex-1 p-2 border border-gray-200 rounded text-sm bg-white"
                      />
                      {variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(index)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Preis <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                            placeholder="6.50"
                            className="w-full p-2 pl-9 border border-gray-200 rounded text-sm text-right font-medium bg-white"
                          />
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                            CHF
                          </div>
                        </div>
                      </div>
                      
                      {hasPromotion && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Aktionspreis <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.05"
                              value={variant.promotionPrice}
                              onChange={(e) => updateVariant(index, 'promotionPrice', e.target.value)}
                              placeholder="5.50"
                              className="w-full p-2 pl-9 border border-orange-300 rounded text-sm text-right font-medium bg-white"
                            />
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              CHF
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addVariant}
                className="w-full bg-brand-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Neue Variante</span>
              </button>
            </div>
          )}
        </div>

        {/* MwSt Einstellung */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mehrwertsteuer</label>
          <select 
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
                              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
          >
            {vatRates.map(rate => (
              <option key={rate.value} value={rate.value} className={rate.color}>
                {rate.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {isActive ? 'Aktiv im Shop' : 'Inaktiv im Shop'}
                </div>
                <div className="text-xs text-gray-500">
                  {isActive ? 'Für Kunden sichtbar' : 'Für Kunden unsichtbar'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isActive ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>


      </div>

      {/* Simple Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <button 
            onClick={handleSave}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              isFormValid && !isSaving
                ? 'bg-brand-500 hover:bg-brand-600' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!isFormValid || isSaving}
          >
            <div className="flex items-center justify-center space-x-2">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Speichert...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Produkt speichern</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}