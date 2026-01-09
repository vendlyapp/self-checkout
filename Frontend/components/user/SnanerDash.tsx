"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, ScanBarcode, XCircle, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { buildApiUrl } from "@/lib/config/api";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";

const SnanerDash = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
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
  const processProductData = async (productData: any) => {
    // Convertir el producto al formato correcto
    const product: Product = {
      id: productData.id,
      name: productData.name,
      description: productData.description || "",
      price: parseFloat(productData.price) || 0,
      originalPrice: productData.originalPrice
        ? parseFloat(productData.originalPrice)
        : undefined,
      promotionalPrice: productData.promotionalPrice
        ? parseFloat(productData.promotionalPrice)
        : undefined,
      category: productData.category || "",
      categoryId: productData.categoryId || "",
      stock: parseInt(productData.stock) || 0,
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
    const storeData = {
      id: storeInfo.id,
      name: storeInfo.name,
      slug: storeInfo.slug,
      logo: storeInfo.logo,
      isOpen: storeInfo.isOpen ?? true,
    };
    setStore(storeData);
    setCurrentStore(storeInfo.slug);

    // Guardar información de la tienda en el producto para uso en el modal
    const productWithStore = {
      ...product,
      store: storeInfo
    };

    // Agregar el producto al carrito
    addToCart(product, 1);
    setScannedProduct(productWithStore as any);
    
    // Mostrar modal de éxito antes de redirigir
    setShowSuccessModal(true);
    
    // Redirigir a la tienda del producto después de un breve delay
    setTimeout(() => {
      handleCloseModal();
      router.push(`/store/${storeInfo.slug}`);
    }, 2500);
  };

  return (
    <div>
      <div className="flex-1 flex flex-col items-center justify-center ml-16 mr-16 pb-24 pt-20">
        <div className="relative w-[280px] h-[280px]">
          {/* Main scanner container - La cámara se renderiza aquí */}
          <div
            id={scannerId}
            ref={scanContainerRef}
            className="absolute inset-0 bg-black/50 rounded-2xl shadow-2xl overflow-hidden"
            style={{ zIndex: 1 }}
          ></div>

          {/* Overlay con decoraciones y contenido - Solo cuando NO está escaneando */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="absolute inset-0 bg-white/90 rounded-3xl"></div>
              <div className="relative z-30 text-center">
                {/* Barcode icon with better styling */}
                <div className="relative mb-6">
                  <ScanBarcode
                    className="w-20 h-20 text-gray-600 mx-auto"
                    strokeWidth={1.5}
                  />
                  <div className="justify-center items-center text-[10px] W-[100px] text-gray-600 font-medium">
                    QR CODE / BARCODE
                  </div>
                </div>

                <p className="text-gray-800 font-bold text-lg mb-2">
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
              <div className="absolute top-6 left-6 w-12 h-12 z-30 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#25D076] to-transparent rounded-tl-2xl"></div>
                <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tl-2xl"></div>
              </div>
              <div className="absolute top-6 right-6 w-12 h-12 z-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-3 bg-gradient-to-l from-[#25D076] to-transparent rounded-tr-2xl"></div>
                <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tr-2xl"></div>
              </div>
              <div className="absolute bottom-6 left-6 w-12 h-12 z-30 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-[#25D076] to-transparent rounded-bl-2xl"></div>
                <div className="absolute bottom-0 left-0 w-3 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-bl-2xl"></div>
              </div>
              <div className="absolute bottom-6 right-6 w-12 h-12 z-30 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-3 bg-gradient-to-l from-[#25D076] to-transparent rounded-br-2xl"></div>
                <div className="absolute bottom-0 right-0 w-3 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-br-2xl"></div>
              </div>

              {/* Status indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto z-30">
                <div className="flex items-center space-x-2 bg-black/95 px-4 py-2 rounded-full shadow-lg">
                  <div className="w-2 h-2 bg-[#25D076] rounded-full"></div>
                  <span className="text-[#25D076] text-sm font-semibold">
                    Analysiert...
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleStartScan}
          className="bg-[#25D076] text-white px-6 py-4 justify-center w-[305px] rounded-full mt-10 font-bold text-lg 
                   disabled:opacity-50 shadow-lg flex items-center space-x-3 touch-target tap-highlight-transparent"
          style={{ minHeight: '56px' }}
          aria-label={isScanning ? "Escaneo detener" : "Produkt scannen"}
        >
          <ScanBarcode className="w-5 h-5" />
          <span className="text-white font-semibold text-[16px]">
            {isScanning ? "Escaneo stoppen" : "Produkt scannen"}
          </span>
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#25D076] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erfolgreich!</h3>
            <p className="text-gray-600 mb-2">
              {scannedProduct
                ? `${scannedProduct.name} wurde zum Warenkorb hinzugefügt`
                : "Produkt erfolgreich gescannt"}
            </p>
            {scannedProduct && (scannedProduct as any).store && (
              <p className="text-sm text-gray-500 mb-4">
                Weiterleitung zu {(scannedProduct as any).store.name}...
              </p>
            )}

            {/* Dos botones */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  handleCloseModal();
                  handleStartScan();
                }}
                className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                         w-full touch-target tap-highlight-transparent"
                style={{ minHeight: '48px' }}
                aria-label="Weiter scannen"
              >
                Weiter scannen
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  // Siempre usar la tienda del producto escaneado, que ya está guardada en el store
                  if (scannedProduct && (scannedProduct as any).store?.slug) {
                    router.push(`/store/${(scannedProduct as any).store.slug}/cart`);
                  } else if (store?.slug) {
                    router.push(`/store/${store.slug}/cart`);
                  } else {
                    // Fallback: redirigir a la página principal
                    router.push('/');
                  }
                }}
                className="bg-white text-[#25D076] border-2 border-[#25D076] px-6 py-4 rounded-full font-semibold 
                         hover:bg-[#25D076] hover:text-white w-full 
                         touch-target tap-highlight-transparent"
                style={{ minHeight: '48px' }}
                aria-label="Warenkorb anzeigen"
              >
                Warenkorb anzeigen
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
