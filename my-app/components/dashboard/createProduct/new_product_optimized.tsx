import React, { useState } from 'react';
import { ArrowLeft, Camera, X, Plus, Check, AlertCircle, Loader2, Package, Percent } from 'lucide-react';
import Image from 'next/image';

const NewProductPage = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [hasPromotion, setHasPromotion] = useState(false);
  const [promotionPrice, setPromotionPrice] = useState('');
  const [promotionDuration, setPromotionDuration] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedVariantIndex] = useState(0);
  const [variants, setVariants] = useState([
    { name: 'Klein (500g)', price: '7.00', promotionPrice: '' },
    { name: 'Gross (1kg)', price: '13.00', promotionPrice: '' }
  ]);
  const [vatRate, setVatRate] = useState('2.6');
  const [errors, setErrors] = useState<{
    productName?: string;
    productPrice?: string;
    productCategory?: string;
    promotionPrice?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  const categories = [
    { value: 'Früchte', icon: '🍎', color: 'bg-red-50 text-red-700' },
    { value: 'Gemüse', icon: '🥕', color: 'bg-orange-50 text-orange-700' },
    { value: 'Milchprodukte', icon: '🥛', color: 'bg-blue-50 text-blue-700' },
    { value: 'Fleisch', icon: '🥩', color: 'bg-red-50 text-red-700' },
    { value: 'Backwaren', icon: '🍞', color: 'bg-yellow-50 text-yellow-700' },
    { value: 'Getränke', icon: '🥤', color: 'bg-blue-50 text-blue-700' },
    { value: 'Konserven', icon: '🥫', color: 'bg-gray-50 text-gray-700' },
    { value: 'Süsswaren', icon: '🍫', color: 'bg-purple-50 text-purple-700' },
    { value: 'Gewürze', icon: '🧂', color: 'bg-green-50 text-green-700' },
    { value: 'Sonstiges', icon: '📦', color: 'bg-gray-50 text-gray-700' }
  ];

  const vatRates = [
    { value: '2.6', label: '2.6% (Lebensmittel)', color: 'text-green-600' },
    { value: '8.1', label: '8.1% (Standard)', color: 'text-blue-600' },
    { value: '0', label: '0% (befreit)', color: 'text-gray-600' }
  ];

  const smartSuggestions: { [key: string]: string[] } = {
    'Früchte': ['1kg', '500g', '1 Schale', 'Bio', 'Regional'],
    'Gemüse': ['1kg', '500g', '1 Bund', 'Bio', 'Regional'],
    'Milchprodukte': ['1 Liter', '500ml', '200g', 'Bio', 'Vollmilch'],
    'Backwaren': ['1 Stück', '500g', '1 Laib', 'Vollkorn', 'Weiss'],
    'Getränke': ['1 Liter', '500ml', '330ml', 'Süss', 'Zuckerfrei']
  };

  const validateField = (field: string, value: string) => {
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
  };

  const handleSave = async () => {
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
    // Navigate back or show success
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', promotionPrice: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  };

  const applySuggestion = (suggestion: string) => {
    const newVariant = { name: suggestion, price: '', promotionPrice: '' };
    setVariants([...variants, newVariant]);
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === productCategory);
  };

  const isFormValid = () => {
    return productName && 
           productCategory && 
           ((!hasVariants && productPrice) || (hasVariants && variants.some(v => v.name && v.price))) &&
           Object.keys(errors).length === 0;
  };

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <div className="font-medium text-gray-800">Neues Produkt</div>
              <div className="text-xs text-gray-500">
                {isFormValid() ? 'Bereit zum Speichern' : 'Artikel anlegen'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
                          <button
                onClick={() => {}}
                className="text-blue-500 text-xs font-medium hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                {/* <Eye className="w-3 h-3" /> */}
                <span>Vorschau</span>
              </button>
            <button className="text-red-500 text-xs font-medium hover:text-red-600 transition-colors">
              Abbrechen
            </button>
          </div>
        </div>
      </div>

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
          
          {/* Bilder Vorschau */}
          {productImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {productImages.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={`/api/placeholder/120/120`} 
                    alt={`Produktbild ${index + 1}`} 
                    width={120}
                    height={120}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200" 
                    style={{ aspectRatio: '1/1' }}
                  />
                  <button
                    onClick={() => setProductImages(productImages.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                      Haupt
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Buttons */}
          {productImages.length < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const newImage = `photo_${Date.now()}`;
                    setProductImages([...productImages, newImage]);
                  }}
                  className="w-full bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Foto aufnehmen</span>
                </button>
                <button 
                  onClick={() => {
                    const newImage = `gallery_${Date.now()}`;
                    setProductImages([...productImages, newImage]);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Package className="w-4 h-4" />
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
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Produktname *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                validateField('productName', e.target.value);
              }}
              placeholder="z.B. Äpfel Gala"
              maxLength={50}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium transition-colors ${
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Kurze Beschreibung oder Herkunft (optional)"
              rows={2}
              maxLength={100}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">Zusätzliche Informationen für Kunden</div>
              <div className="text-xs text-gray-500">{productDescription.length}/100</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
            <select
              value={productCategory}
              onChange={(e) => {
                setProductCategory(e.target.value);
                validateField('productCategory', e.target.value);
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-colors ${
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

          {/* Preis ohne Varianten */}
          {!hasVariants && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preis *</label>
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
                  className={`w-full p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium transition-colors ${
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
          )}

          {/* Varianten Info */}
          {hasVariants && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <div className="text-sm font-medium text-blue-800">Varianten-Modus aktiv</div>
              </div>
              <div className="text-xs text-blue-600">
                Verschiedene Ausprägungen mit individuellen Preisen
              </div>
            </div>
          )}
        </div>

        {/* Aktionen Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">Aktion</div>
                <div className="text-xs text-gray-500">
                  {hasVariants ? 'Rabatt auf alle Varianten' : 'Reduzierter Preis anbieten'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setHasPromotion(!hasPromotion)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                hasPromotion ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              {/* <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  hasPromotion ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              /> */}
            </button>
          </div>

          {hasPromotion && (
            <div className="space-y-3">
              {!hasVariants && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={promotionPrice}
                      onChange={(e) => {
                        setPromotionPrice(e.target.value);
                        validateField('promotionPrice', e.target.value);
                      }}
                      placeholder="6.80"
                      className={`w-full p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium transition-colors ${
                        errors.promotionPrice ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      CHF
                    </div>
                    {productPrice && promotionPrice && !errors.promotionPrice && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                          -{Math.round(((parseFloat(productPrice) - parseFloat(promotionPrice)) / parseFloat(productPrice)) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <select
                    value={promotionDuration}
                    onChange={(e) => setPromotionDuration(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="">Dauer...</option>
                    <option value="1_day">1 Tag</option>
                    <option value="3_days">3 Tage</option>
                    <option value="1_week">1 Woche</option>
                    <option value="2_weeks">2 Wochen</option>
                    <option value="1_month">1 Monat</option>
                    <option value="custom">Enddatum wählen</option>
                  </select>
                </div>
              )}

              {hasVariants && (
                <div>
                  <select
                    value={promotionDuration}
                    onChange={(e) => setPromotionDuration(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="">Aktionsdauer...</option>
                    <option value="1_day">1 Tag</option>
                    <option value="3_days">3 Tage</option>
                    <option value="1_week">1 Woche</option>
                    <option value="2_weeks">2 Wochen</option>
                    <option value="1_month">1 Monat</option>
                    <option value="custom">Enddatum wählen</option>
                  </select>
                </div>
              )}

              {promotionDuration === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Enddatum</label>
                  <input
                    type="datetime-local"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}

              {errors.promotionPrice && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <p className="text-red-500 text-xs">{errors.promotionPrice}</p>
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
                <div className="text-xs text-gray-500">Verschiedene Ausprägungen anbieten</div>
              </div>
            </div>
            <button
              onClick={() => setHasVariants(!hasVariants)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                hasVariants ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              {/* <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  hasVariants ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              /> */}
            </button>
          </div>

          {hasVariants && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Ausprägungen definieren</div>
                <button
                  onClick={addVariant}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Variante</span>
                </button>
              </div>
              
              {/* Smart Suggestions */}
              {productCategory && smartSuggestions[productCategory] && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-700 mb-2">💡 Vorschläge für {productCategory}:</div>
                  <div className="flex flex-wrap gap-2">
                    {smartSuggestions[productCategory].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => applySuggestion(suggestion)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="z.B. 1kg, 500g, Bio"
                        className="flex-1 p-2 border border-gray-200 rounded text-sm"
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
                        <label className="block text-xs text-gray-600 mb-1">Normalpreis</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                            placeholder="7.00"
                            className="w-full p-2 pl-9 border border-gray-200 rounded text-sm text-right font-medium"
                          />
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                            CHF
                          </div>
                        </div>
                      </div>
                      
                      {hasPromotion && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Aktionspreis</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.05"
                              value={variant.promotionPrice}
                              onChange={(e) => updateVariant(index, 'promotionPrice', e.target.value)}
                              placeholder="5.50"
                              className="w-full p-2 pl-9 border border-orange-300 rounded text-sm text-right font-medium"
                            />
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              CHF
                            </div>
                            {variant.price && variant.promotionPrice && parseFloat(variant.promotionPrice) < parseFloat(variant.price) && (
                              <div className="absolute -bottom-5 right-0 text-xs text-red-600 font-medium">
                                -{Math.round(((parseFloat(variant.price) - parseFloat(variant.promotionPrice)) / parseFloat(variant.price)) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MwSt Einstellung */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mehrwertsteuer</label>
          <select 
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
                isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {/* <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              /> */}
            </button>
          </div>
        </div>

        {/* Kundenvorschau */}
        {(isFormValid()) && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Kundenansicht</h3>
              {/* <Eye className="w-4 h-4 text-gray-400" /> */}
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{productName || 'Produktname'}</div>
                  {productDescription && (
                    <div className="text-xs text-gray-600 mt-0.5">{productDescription}</div>
                  )}
                  {productCategory && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getSelectedCategory()?.color}`}>
                        {getSelectedCategory()?.icon} {productCategory}
                      </span>
                    </div>
                  )}
                  
                  {!hasVariants ? (
                    <div className="flex items-center space-x-2 mt-2">
                      {hasPromotion && promotionPrice && !errors.promotionPrice ? (
                        <>
                          <span className="text-sm font-bold text-red-600">CHF {promotionPrice}</span>
                          <span className="text-xs text-gray-500 line-through">CHF {productPrice}</span>
                          <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                            -{Math.round(((parseFloat(productPrice) - parseFloat(promotionPrice)) / parseFloat(productPrice)) * 100)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-800">CHF {productPrice}</span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <select className="text-xs bg-gray-100 px-2 py-1 rounded border">
                          {variants.filter(v => v.name && v.price).map((variant, index) => (
                            <option key={index} value={index}>
                              {variant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {variants[selectedVariantIndex] && (
                        <div className="flex items-center space-x-2 mt-1">
                          {hasPromotion && variants[selectedVariantIndex]?.promotionPrice ? (
                            <>
                              <span className="text-sm font-bold text-red-600">
                                CHF {parseFloat(variants[selectedVariantIndex]?.promotionPrice).toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                CHF {variants[selectedVariantIndex]?.price}
                              </span>
                              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                                -{Math.round(((parseFloat(variants[selectedVariantIndex]?.price) - parseFloat(variants[selectedVariantIndex]?.promotionPrice)) / parseFloat(variants[selectedVariantIndex]?.price)) * 100)}%
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-800">
                              CHF {variants[selectedVariantIndex]?.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <button 
            onClick={handleSave}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              isFormValid() && !isSaving
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!isFormValid() || isSaving}
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
          
          {/* Validation Summary */}
          {!isFormValid() && (
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-500">
                {!productName && 'Produktname fehlt'} 
                {!productCategory && (!productName ? ', Kategorie fehlt' : 'Kategorie fehlt')}
                {!hasVariants && !productPrice && ((!productName || !productCategory) ? ', Preis fehlt' : 'Preis fehlt')}
                {hasVariants && !variants.some(v => v.name && v.price) && ((!productName || !productCategory) ? ', Varianten fehlen' : 'Varianten fehlen')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProductPage;