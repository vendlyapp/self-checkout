'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { QrCode, Camera, X, Flashlight, FlashlightOff } from 'lucide-react';

interface QRScannerProps {
  onScan?: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface ScanResult {
  code: string;
  format: string;
  timestamp: Date;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, className }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Haptic feedback function
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [50, 100, 50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Request camera permission and start stream
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          // @ts-expect-error - focusMode is supported in modern browsers
          focusMode: 'continuous'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission('granted');
        setIsScanning(true);
        setIsLoading(false);
        scanLoop();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Kamera konnte nicht gestartet werden');
      setCameraPermission('denied');
      setIsLoading(false);
      onError?.('Kamera-Zugriff verweigert');
    }
  }, [onError]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
  }, []);

  // QR Code scanning loop
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simulate QR detection
    if (Math.random() < 0.01) {
      const mockResult = {
        code: `PROD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        format: 'QR_CODE',
        timestamp: new Date()
      };
      handleScanSuccess(mockResult);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  }, [isScanning]);

  // Handle successful scan
  const handleScanSuccess = useCallback((result: ScanResult) => {
    hapticFeedback('success');
    setScanResult(result);
    setShowSuccess(true);
    setIsScanning(false);
    stopCamera();
    onScan?.(result.code);
    
    setTimeout(() => {
      setShowSuccess(false);
      setScanResult(null);
    }, 2000);
  }, [hapticFeedback, onScan, stopCamera]);

  // Toggle flash
  const toggleFlash = useCallback(() => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities();
        // @ts-expect-error - torch property exists in modern browsers
        if (capabilities.torch) {
          track.applyConstraints({
            // @ts-expect-error - torch constraint is supported in modern browsers
            advanced: [{ torch: !isFlashOn }]
          });
          setIsFlashOn(!isFlashOn);
          hapticFeedback('light');
        }
      }
    }
  }, [isFlashOn, hapticFeedback]);

  // Handle manual scan button
  const handleManualScan = useCallback(() => {
    hapticFeedback('medium');
    if (!isScanning) {
      startCamera();
    }
  }, [hapticFeedback, isScanning, startCamera]);

  // Handle close scanner
  const handleClose = useCallback(() => {
    hapticFeedback('light');
    stopCamera();
    window.history.back();
  }, [hapticFeedback, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  return (
    <div className={cn("fixed inset-0 flex flex-col ", className)} style={{ backgroundColor: '#191F2D' }}>
      {/* Camera Video */}
      <div className="relative flex-1 overflow-hidden w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanner Overlay */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4 pt-8">
            <button
              onClick={handleClose}
              className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Schließen"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={toggleFlash}
              className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label={isFlashOn ? "Blitz ausschalten" : "Blitz einschalten"}
            >
              {isFlashOn ? <FlashlightOff className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
            </button>
          </div>

          {/* Center Scanner Frame */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-80 h-80 max-w-[90vw] max-h-[60vh]">
              {/* Professional Scanner Frame */}
              <div className="absolute inset-0 bg-gray-800/40 backdrop-blur-md rounded-3xl border-2 border-[#25D076] shadow-[0_0_0_2px_rgba(37,208,118,0.2),0_20px_60px_rgba(0,0,0,0.4),inset_0_0_100px_rgba(37,208,118,0.08)]">
                {/* Enhanced Corner Indicators */}
                <div className="absolute top-0 left-0 w-10 h-10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D076] to-transparent rounded-tl-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tl-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" />
                </div>
                
                <div className="absolute top-0 right-0 w-10 h-10">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[#25D076] to-transparent rounded-tr-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tr-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                
                <div className="absolute bottom-0 left-0 w-10 h-10">
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D076] to-transparent rounded-bl-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-bl-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                
                <div className="absolute bottom-0 right-0 w-10 h-10">
                  <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-[#25D076] to-transparent rounded-br-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" style={{ animationDelay: '1.5s' }} />
                  <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-br-lg shadow-[0_0_10px_rgba(37,208,118,0.8)] animate-pulse" style={{ animationDelay: '1.5s' }} />
                </div>
                
                {/* Enhanced Scan Line */}
                <div className="absolute left-2 right-2 h-1.5 bg-gradient-to-r from-transparent via-[#25D076] to-transparent rounded-full shadow-[0_0_30px_rgba(37,208,118,0.9)] animate-pulse" />
                
                {/* Professional Analyzing Status */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm px-6 py-3 rounded-full border border-[#25D076]/30">
                  <div className="w-2.5 h-2.5 bg-[#25D076] rounded-full animate-pulse shadow-[0_0_10px_rgba(37,208,118,0.8)]" />
                  <span className="text-white/90 text-sm font-medium">Analysiert</span>
                  <span className="text-[#25D076] animate-pulse">.</span>
                  <span className="text-[#25D076] animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
                  <span className="text-[#25D076] animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
                </div>
              </div>

              {/* Success Overlay */}
              {showSuccess && (
                <div className="absolute inset-0 bg-[#25D076]/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 animate-bounce shadow-[0_0_30px_rgba(37,208,118,0.8)]">
                    <svg className="w-12 h-12 text-[#25D076]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#25D076]/20 border-t-[#25D076] rounded-full animate-spin shadow-[0_0_20px_rgba(37,208,118,0.5)]" />
                </div>
              )}

              {/* Error Overlay */}
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <p className="text-lg font-semibold mb-2">Kamera-Fehler</p>
                    <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2 bg-[#25D076] text-white rounded-lg font-medium hover:bg-[#20B86A] transition-colors"
                    >
                      Erneut versuchen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Scan Button */}
          <div className="pb-64 text-center">
            <button
              onClick={handleManualScan}
              className="flex items-center justify-center gap-3 px-12 py-4 text-white rounded-full font-semibold mx-auto transition-all duration-300 shadow-[0_4px_20px_rgba(37,208,118,0.4)] hover:shadow-[0_6px_30px_rgba(37,208,118,0.6)] hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#25D076' }}
            >
              <QrCode className="w-6 h-6" />
              Produkt scannen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;