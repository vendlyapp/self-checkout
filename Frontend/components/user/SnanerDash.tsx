"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, ScanBarcode, XCircle, Camera, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore, type StoreInfo } from "@/lib/stores/scannedStoreStore";
import { buildApiUrl } from "@/lib/config/api";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import Image from "next/image";

// Type for product with store information
interface ProductWithStore extends Product {
  store: StoreInfo;
}

// Type for API product data response (raw structure from backend)
interface ProductApiResponse {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  originalPrice?: number | string;
  promotionalPrice?: number | string;
  category?: string;
  categoryId?: string;
  stock: number | string;
  sku?: string;
  barcode?: string;
  qrCode?: string;
  image?: string;
  images?: string[];
  isActive?: boolean;
  isPromotional?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  currency?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    isOpen?: boolean;
  };
}

const SnanerDash = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ProductWithStore | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanContainerRef = useRef<HTMLDivElement>(null);
  const isCleaningUpRef = useRef(false);
  const [scannerId] = useState(() => 'qr-reader-scanner');
  const router = useRouter();
  const { addToCart, setCurrentStore } = useCartStore();
  const { store, setStore } = useScannedStoreStore();

  // Limpiar el escáner cuando el componente se desmonte
  useEffect(() => {
    return () => {
      isCleaningUpRef.current = true;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        
        scanner
          .stop()
          .then(() => {
            try {
              scanner.clear();
            } catch {
              // Ignorar errores de limpieza durante el desmontaje
            }
          })
          .catch(() => {
            // Ignorar errores durante el desmontaje
          });
      }
    };
  }, []);

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Si tenemos acceso, detener el stream inmediatamente
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const startScanning = async () => {
    if (!scanContainerRef.current) return;

    // Verificar permisos de cámara primero
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      setShowCameraPermissionModal(true);
      return;
    }

    try {
      setIsScanning(true);
      setShowErrorModal(false);
      setShowCameraPermissionModal(false);
      setErrorMessage("");

      // Asegurar que el contenedor tenga el ID correcto
      if (scanContainerRef.current) {
        scanContainerRef.current.id = scannerId;
        // Limpiar cualquier contenido previo del contenedor
        scanContainerRef.current.innerHTML = "";
      }

      // Crear instancia del escáner
      const scanner = new Html5Qrcode(scannerId, {
        verbose: false,
      });

      scannerRef.current = scanner;

      // Configuración del escáner - sin qrbox para mostrar toda la cámara
      // Mejor calidad de video para evitar efecto borroso
      const config = {
        fps: 30, // Aumentar FPS para mejor fluidez
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: false,
        showZoomSliderIfSupported: false,
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      };

      // Iniciar el escaneo - solo facingMode en el primer parámetro
      await scanner.start(
        { facingMode: "environment" }, // Cámara trasera
        config,
        (decodedText) => {
          // Código escaneado exitosamente
          if (!isCleaningUpRef.current) {
            handleScannedCode(decodedText);
          }
        },
        () => {
          // Ignorar errores de escaneo continuo (solo loguear si es necesario)
          // console.log("Escaneando...", errorMessage);
        }
      );
    } catch (error: unknown) {
      console.error("Error al iniciar el escáner:", error);
      setIsScanning(false);
      
      let errorMsg = "Zugriff auf die Kamera nicht möglich. Bitte überprüfen Sie die Berechtigungen.";
      const errorObj = error as { message?: string; name?: string };
      if (errorObj?.message?.includes("Permission denied") || errorObj?.name === "NotAllowedError") {
        errorMsg = "Kameraberechtigung verweigert. Bitte erlauben Sie den Zugriff auf die Kamera in den Browsereinstellungen.";
        setShowCameraPermissionModal(true);
      } else if (errorObj?.message?.includes("not found") || errorObj?.name === "NotFoundError") {
        errorMsg = "Keine Kamera auf Ihrem Gerät gefunden.";
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        await scanner.stop();
        
        // Limpiar el contenedor después de un pequeño delay para evitar conflictos
        setTimeout(() => {
          if (scanContainerRef.current && !isCleaningUpRef.current) {
            try {
              scanner.clear();
              // Limpiar manualmente el contenido del contenedor
              if (scanContainerRef.current) {
                scanContainerRef.current.innerHTML = "";
              }
            } catch {
              // Ignorar errores de limpieza
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error al detener el escáner:", error);
        // Limpiar el contenedor incluso si hay error
        if (scanContainerRef.current) {
          scanContainerRef.current.innerHTML = "";
        }
      }
    }
    setIsScanning(false);
  };

  const handleScannedCode = async (qrCode: string) => {
    try {
      // Detener el escáner
      await stopScanning();

      // Verificar si el código escaneado es una URL completa
      // Si es una URL que contiene /product/, extraer el productId o redirigir directamente
      if (qrCode.includes('/product/')) {
        // Es una URL completa, extraer el productId o redirigir directamente
        const productIdMatch = qrCode.match(/\/product\/([a-f0-9-]+)/i);
        if (productIdMatch && productIdMatch[1]) {
          // Extraer el productId y usar el endpoint
          const productId = productIdMatch[1];
          const url = buildApiUrl(`/api/products/qr/${encodeURIComponent(productId)}`);
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error("Produkt nicht gefunden");
          }

          const result = await response.json();
          if (!result.success || !result.data) {
            throw new Error("Produkt nicht gefunden");
          }

          await processProductData(result.data);
          return;
        } else {
          // Si no podemos extraer el ID, redirigir directamente a la URL
          window.location.href = qrCode;
          return;
        }
      }

      // Si no es una URL, asumir que es un productId (UUID) - compatibilidad hacia atrás
      // Buscar el producto por código QR (incluye información de la tienda)
      const url = buildApiUrl(`/api/products/qr/${encodeURIComponent(qrCode)}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Produkt nicht gefunden");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Produkt nicht gefunden");
      }

      await processProductData(result.data);
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al procesar el código QR. Intenta nuevamente."
      );
      setShowErrorModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setScannedProduct(null);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const handleCloseCameraPermissionModal = () => {
    setShowCameraPermissionModal(false);
  };

  const handleGrantPermission = async () => {
    setShowCameraPermissionModal(false);
    // Pequeño delay para que el modal se cierre antes de solicitar permisos
    setTimeout(() => {
      startScanning();
    }, 300);
  };

  const handleStartScan = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  // Función auxiliar para procesar los datos del producto
  const processProductData = async (productData: ProductApiResponse) => {
    // Convertir el producto al formato correcto
    const product: Product = {
      id: productData.id,
      name: productData.name,
      description: productData.description || "",
      price: parseFloat(String(productData.price)) || 0,
      originalPrice: productData.originalPrice
        ? parseFloat(String(productData.originalPrice))
        : undefined,
      promotionalPrice: productData.promotionalPrice
        ? parseFloat(String(productData.promotionalPrice))
        : undefined,
      category: productData.category || "",
      categoryId: productData.categoryId || "",
      stock: parseInt(String(productData.stock)) || 0,
      sku: productData.sku || "",
      barcode: productData.barcode,
      qrCode: productData.qrCode,
      image: productData.image,
      images: productData.images,
      isActive: productData.isActive ?? true,
      isPromotional: productData.isPromotional || false,
      isOnSale: productData.isOnSale || false,
      isNew: productData.isNew || false,
      isPopular: productData.isPopular || false,
      currency: productData.currency || "CHF",
      tags: productData.tags || [],
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: productData.updatedAt || new Date().toISOString(),
    };

    // Verificar si el producto está disponible
    if (!product.isActive || product.stock <= 0) {
      throw new Error("Producto no disponible");
    }

    // Obtener información de la tienda del producto
    const storeInfo = productData.store;
    if (!storeInfo || !storeInfo.slug) {
      throw new Error("Tienda no encontrada para este producto");
    }

    // Guardar la tienda en el store global
    const storeData: StoreInfo = {
      id: storeInfo.id,
      name: storeInfo.name,
      slug: storeInfo.slug,
      logo: storeInfo.logo || null,
      isOpen: storeInfo.isOpen ?? true,
    };
    setStore(storeData);
    setCurrentStore(storeInfo.slug);

    // Guardar información de la tienda en el producto para uso en el modal
    const productWithStore: ProductWithStore = {
      ...product,
      store: storeData
    };

    // Agregar el producto al carrito
    addToCart(product, 1);
    setScannedProduct(productWithStore);
    
    // Mostrar modal de éxito (sin redirección automática)
    setShowSuccessModal(true);
  };

  return (
    <div className="w-full flex items-center justify-center" style={{ height: '100%', minHeight: 0, maxHeight: '100%' }}>
      <div className="flex flex-col items-center justify-center w-full max-w-md px-4" style={{ maxHeight: '100%', overflow: 'hidden' }}>
        {/* Scanner Container - Centrado y mejorado */}
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mb-6 sm:mb-8 flex-shrink-0">
          {/* Main scanner container - La cámara se renderiza aquí */}
          <div
            id={scannerId}
            ref={scanContainerRef}
            className="absolute inset-0 bg-black/50 rounded-3xl shadow-2xl overflow-hidden"
            style={{ zIndex: 1 }}
          ></div>

          {/* Overlay con decoraciones y contenido - Solo cuando NO está escaneando */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm rounded-3xl border-2 border-gray-100"></div>
              <div className="relative z-30 text-center px-6">
                {/* Barcode icon with better styling */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto mb-3 bg-gradient-to-br from-[#25D076]/10 to-[#25D076]/5 rounded-3xl flex items-center justify-center">
                    <ScanBarcode
                      className="w-12 h-12 text-[#25D076]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="text-center text-xs text-gray-500 font-semibold tracking-wider uppercase">
                    QR CODE / BARCODE
                  </div>
                </div>

                <p className="text-gray-900 font-bold text-xl mb-2">
                  Produkt positionieren
                </p>
                <p className="text-gray-600 text-sm font-medium">
                  Automatische Erkennung
                </p>
              </div>
            </div>
          )}

          {/* Corner markers - Siempre visibles cuando está escaneando */}
          {isScanning && (
            <>
              {/* Top Left Corner */}
              <div className="absolute top-4 left-4 w-16 h-16 z-30 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#25D076] to-transparent rounded-tl-3xl"></div>
                <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tl-3xl"></div>
              </div>
              {/* Top Right Corner */}
              <div className="absolute top-4 right-4 w-16 h-16 z-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-4 bg-gradient-to-l from-[#25D076] to-transparent rounded-tr-3xl"></div>
                <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tr-3xl"></div>
              </div>
              {/* Bottom Left Corner */}
              <div className="absolute bottom-4 left-4 w-16 h-16 z-30 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-[#25D076] to-transparent rounded-bl-3xl"></div>
                <div className="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-bl-3xl"></div>
              </div>
              {/* Bottom Right Corner */}
              <div className="absolute bottom-4 right-4 w-16 h-16 z-30 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-4 bg-gradient-to-l from-[#25D076] to-transparent rounded-br-3xl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-br-3xl"></div>
              </div>

              {/* Status indicator - Mejorado */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
                <div className="flex items-center space-x-2.5 bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-[#25D076]/20">
                  <div className="w-2.5 h-2.5 bg-[#25D076] rounded-full animate-pulse"></div>
                  <span className="text-[#25D076] text-sm font-semibold">
                    Analysiert...
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Button - Mejorado y centrado */}
        <button
          onClick={handleStartScan}
          className="bg-[#25D076] text-white px-8 py-4 rounded-full font-bold text-base 
                   disabled:opacity-50 flex items-center justify-center space-x-3 
                   touch-target tap-highlight-transparent hover:bg-[#25D076]/90 active:scale-95 
                   transition-ios w-full max-w-[320px]"
          style={{ minHeight: '56px' }}
          aria-label={isScanning ? "Escaneo detener" : "Produkt scannen"}
        >
          <ScanBarcode className="w-5 h-5 flex-shrink-0" />
          <span className="text-white font-semibold text-base">
            {isScanning ? "Escaneo stoppen" : "Produkt scannen"}
          </span>
        </button>
      </div>

      {/* Success Modal - Mejorado */}
      {showSuccessModal && scannedProduct && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={(e) => {
            // Cerrar al hacer click fuera del modal
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm mx-4 text-center shadow-2xl w-full">
            {/* Icono de éxito animado */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#25D076] to-[#20B869] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            {/* Título */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Erfolgreich!</h3>

            {/* Imagen del producto */}
            {scannedProduct.image && (
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md">
                <Image
                  src={scannedProduct.image}
                  alt={scannedProduct.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            )}

            {/* Nombre del producto */}
            <p className="text-lg font-semibold text-gray-900 mb-2 px-2">
              {scannedProduct.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              wurde zum Warenkorb hinzugefügt
            </p>

            {/* Precio */}
            <div className="mb-6">
              <span className="text-xl font-bold text-[#25D076]">
                CHF {typeof scannedProduct.price === 'number' ? scannedProduct.price.toFixed(2) : scannedProduct.price}
              </span>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  handleCloseModal();
                  // Siempre usar la tienda del producto escaneado, que ya está guardada en el store
                  if (scannedProduct && scannedProduct.store?.slug) {
                    router.push(`/store/${scannedProduct.store.slug}/cart`);
                  } else if (store?.slug) {
                    router.push(`/store/${store.slug}/cart`);
                  } else {
                    // Fallback: redirigir a la página principal
                    router.push('/');
                  }
                }}
                className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                         active:scale-95 transition-ios w-full touch-target tap-highlight-transparent
                         flex items-center justify-center gap-2"
                style={{ minHeight: '52px' }}
                aria-label="Warenkorb anzeigen"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Zum Warenkorb</span>
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  // Redirigir a la tienda del producto escaneado para seguir escaneando
                  if (scannedProduct && scannedProduct.store?.slug) {
                    router.push(`/store/${scannedProduct.store.slug}/scan`);
                  } else if (store?.slug) {
                    router.push(`/store/${store.slug}/scan`);
                  } else {
                    // Si no hay tienda, reiniciar el escáner en la misma página
                    handleStartScan();
                  }
                }}
                className="bg-white text-[#25D076] border-2 border-[#25D076] px-6 py-4 rounded-full font-semibold 
                         hover:bg-[#25D076]/5 active:scale-95 transition-ios w-full 
                         touch-target tap-highlight-transparent flex items-center justify-center gap-2"
                style={{ minHeight: '52px' }}
                aria-label="Weiter scannen"
              >
                <ScanBarcode className="w-5 h-5" />
                <span>Weiter scannen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fehler</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>

            <button
              onClick={handleCloseErrorModal}
              className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                       w-full touch-target tap-highlight-transparent"
              style={{ minHeight: '48px' }}
              aria-label="Erneut versuchen"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Camera Permission Modal */}
      {showCameraPermissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#25D076] rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Kamera erforderlich
            </h3>
            <p className="text-gray-600 mb-6">
              Um QR-Codes zu scannen, benötigen wir Zugriff auf Ihre Kamera. Bitte erlauben Sie den Zugriff, wenn Ihr Browser danach fragt.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGrantPermission}
                className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                         w-full touch-target tap-highlight-transparent"
                style={{ minHeight: '48px' }}
                aria-label="Permitir acceso a la cámara"
              >
                Permitir acceso a la cámara
              </button>
              <button
                onClick={handleCloseCameraPermissionModal}
                className="bg-white text-gray-600 border-2 border-gray-300 px-6 py-4 rounded-full font-semibold 
                         hover:bg-gray-50 w-full 
                         touch-target tap-highlight-transparent"
                style={{ minHeight: '48px' }}
                aria-label="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnanerDash;
