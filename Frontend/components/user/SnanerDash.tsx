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
  const scannerIdRef = useRef(`qr-reader-${Date.now()}`);
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

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
        scanContainerRef.current.id = scannerIdRef.current;
        // Limpiar cualquier contenido previo del contenedor
        scanContainerRef.current.innerHTML = "";
      }

      // Crear instancia del escáner
      const scanner = new Html5Qrcode(scannerIdRef.current, {
        verbose: false,
      });

      scannerRef.current = scanner;

      // Configuración del escáner - sin qrbox para mostrar toda la cámara
      const config = {
        fps: 10,
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: false,
        showZoomSliderIfSupported: false,
      };

      // Iniciar el escaneo
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

      // Buscar el producto por código QR
      const url = buildApiUrl(`/api/products/qr/${encodeURIComponent(qrCode)}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Produkt nicht gefunden");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Produkt nicht gefunden");
      }

      // Convertir el producto al formato correcto
      const productData = result.data;
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

      // Agregar al carrito
      addToCart(product, 1);
      setScannedProduct(product);
      setShowSuccessModal(true);
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

  return (
    <div className="animate-page-enter gpu-accelerated">
      <div className="flex-1 flex flex-col items-center justify-center ml-16 mr-16 pb-24 pt-20 animate-fade-in-scale">
        <div className="relative w-[280px] h-[280px] animate-scale-in">
          {/* Main scanner container - La cámara se renderiza aquí */}
          <div
            id={scannerIdRef.current}
            ref={scanContainerRef}
            className="absolute inset-0 bg-black rounded-3xl shadow-2xl overflow-hidden transition-interactive"
            style={{ zIndex: 1 }}
          ></div>

          {/* Overlay con decoraciones y contenido - Solo cuando NO está escaneando */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl"></div>
              <div className="relative z-30 text-center">
                {/* Barcode icon with better styling */}
                <div className="relative mb-6">
                  <ScanBarcode
                    className="w-20 h-20 text-gray-600 mx-auto animate-pulse"
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

              {/* Enhanced animated scanner line */}
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute w-64 h-1 bg-gradient-to-r from-transparent via-[#25D076] to-transparent opacity-90 shadow-lg"
                    style={{
                      animation: "scanLine 1.5s ease-in-out infinite",
                      filter: "drop-shadow(0 0 8px #25D076)",
                    }}
                  ></div>
                </div>
                <style jsx>{`
                  @keyframes scanLine {
                    0% {
                      transform: translateY(-140px);
                      opacity: 0;
                    }
                    10% {
                      opacity: 1;
                    }
                    90% {
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(140px);
                      opacity: 0;
                    }
                  }
                `}</style>

                {/* Status indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                  <div className="flex items-center space-x-2 bg-white/90 px-4 py-2 rounded-full shadow-lg">
                    <div className="w-2 h-2 bg-[#25D076] rounded-full animate-pulse"></div>
                    <span className="text-[#25D076] text-sm font-semibold">
                      Analysiert...
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleStartScan}
          className="bg-gradient-to-r from-[#25D076] to-[#25D076] text-white px-6 py-4 justify-center w-[305px] rounded-full mt-10 font-bold text-lg 
                   hover:from-[#25D076]/80 hover:to-[#25D076]/80 transition-interactive gpu-accelerated disabled:opacity-50 
                   shadow-2xl active:scale-95 hover:scale-105 flex items-center space-x-3 touch-target tap-highlight-transparent
                   animate-slide-up-fade"
          style={{ minHeight: '56px' }}
          aria-label={isScanning ? "Escaneo detener" : "Produkt scannen"}
        >
          <ScanBarcode className="w-5 h-5 transition-interactive" />
          <span className="text-white font-semibold text-[16px] transition-interactive">
            {isScanning ? "Escaneo stoppen" : "Produkt scannen"}
          </span>
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-scale-in gpu-accelerated">
            <div className="w-16 h-16 bg-[#25D076] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <CheckCircle className="w-8 h-8 text-white transition-interactive" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 transition-interactive">Erfolgreich!</h3>
            <p className="text-gray-600 mb-4 transition-interactive">
              {scannedProduct
                ? `${scannedProduct.name} wurde zum Warenkorb hinzugefügt`
                : "Produkt erfolgreich gescannt"}
            </p>

            {/* Dos botones */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  handleCloseModal();
                  handleStartScan();
                }}
                className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                         transition-interactive gpu-accelerated w-full touch-target tap-highlight-transparent 
                         active:scale-95 hover:scale-105"
                style={{ minHeight: '48px' }}
                aria-label="Weiter scannen"
              >
                Weiter scannen
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  const targetRoute = store?.slug ? `/store/${store.slug}/cart` : '/user/cart';
                  router.push(targetRoute);
                }}
                className="bg-white text-[#25D076] border-2 border-[#25D076] px-6 py-4 rounded-full font-semibold 
                         hover:bg-[#25D076] hover:text-white transition-interactive gpu-accelerated w-full 
                         touch-target tap-highlight-transparent active:scale-95 hover:scale-105"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-scale-in gpu-accelerated">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <XCircle className="w-8 h-8 text-white transition-interactive" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 transition-interactive">Fehler</h3>
            <p className="text-gray-600 mb-6 transition-interactive">{errorMessage}</p>

            <button
              onClick={handleCloseErrorModal}
              className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                       transition-interactive gpu-accelerated w-full touch-target tap-highlight-transparent 
                       active:scale-95 hover:scale-105"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-scale-in gpu-accelerated">
            <div className="w-16 h-16 bg-[#25D076] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <Camera className="w-8 h-8 text-white transition-interactive" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 transition-interactive">
              Kamera erforderlich
            </h3>
            <p className="text-gray-600 mb-6 transition-interactive">
              Um QR-Codes zu scannen, benötigen wir Zugriff auf Ihre Kamera. Bitte erlauben Sie den Zugriff, wenn Ihr Browser danach fragt.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGrantPermission}
                className="bg-[#25D076] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#25D076]/90 
                         transition-interactive gpu-accelerated w-full touch-target tap-highlight-transparent 
                         active:scale-95 hover:scale-105"
                style={{ minHeight: '48px' }}
                aria-label="Permitir acceso a la cámara"
              >
                Permitir acceso a la cámara
              </button>
              <button
                onClick={handleCloseCameraPermissionModal}
                className="bg-white text-gray-600 border-2 border-gray-300 px-6 py-4 rounded-full font-semibold 
                         hover:bg-gray-50 transition-interactive gpu-accelerated w-full 
                         touch-target tap-highlight-transparent active:scale-95 hover:scale-105"
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
