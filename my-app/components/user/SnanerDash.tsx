import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { QrCode } from 'lucide-react';

interface QRScannerProps {
  onScan?: () => void;
  className?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, className }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Haptic feedback function
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [50, 100, 50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Handle scan button click
  const handleScan = () => {
    hapticFeedback('medium');
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setShowSuccess(true);
      hapticFeedback('success');
      
      // Reset success state
      setTimeout(() => {
        setShowSuccess(false);
        onScan?.();
      }, 2000);
    }, 2000);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotateX(0) rotateY(0);
          }
          50% {
            transform: translateY(-10px) rotateX(2deg) rotateY(2deg);
          }
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(20px, 20px);
          }
        }

        @keyframes expand-h {
          0%, 100% {
            transform: scaleX(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes expand-v {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes scan {
          0% {
            top: 20px;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            top: calc(100% - 20px);
            opacity: 0;
          }
        }

        @keyframes pulse-focus {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.6;
          }
        }

        @keyframes blink {
          0%, 60% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        .scan-button-shine::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .scan-button-shine:active::before {
          left: 100%;
        }

        .corner-animation-h {
          animation: expand-h 2s ease-in-out infinite;
        }

        .corner-animation-v {
          animation: expand-v 2s ease-in-out infinite;
        }

        .scanner-float {
          animation: float 6s ease-in-out infinite;
        }

        .grid-animation {
          animation: grid-move 20s linear infinite;
        }

        .scan-line-animation {
          animation: scan 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .center-focus-animation {
          animation: pulse-focus 2s ease-in-out infinite;
        }

        .dot-blink {
          animation: blink 1.5s infinite;
        }

        .checkmark-animation {
          animation: checkmark 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      <div className={cn(
        "min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex flex-col justify-center items-center p-5 relative overflow-hidden",
        className
      )}>
        {/* Scanner */}
        <div className="relative mb-20 scanner-float" style={{ transformStyle: 'preserve-3d' }}>
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_0_0_1px_rgba(74,222,128,0.1),0_10px_40px_rgba(0,0,0,0.3),inset_0_0_80px_rgba(74,222,128,0.05)]"
                 style={{ background: 'radial-gradient(ellipse at center, rgba(74, 222, 128, 0.05) 0%, transparent 70%)' }}>
              
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-50 grid-animation"
                   style={{
                     backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(74, 222, 128, 0.03) 20px),
                                     repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(74, 222, 128, 0.03) 20px)`
                   }} />
              
              {/* Corners */}
              <div className="absolute top-0 left-0 w-[60px] h-[60px]">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-green-400 rounded-t-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-h" />
                <div className="absolute top-0 left-0 w-[3px] h-full bg-green-400 rounded-l-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-v" />
              </div>
              
              <div className="absolute top-0 right-0 w-[60px] h-[60px]">
                <div className="absolute top-0 right-0 w-full h-[3px] bg-green-400 rounded-t-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-h" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 right-0 w-[3px] h-full bg-green-400 rounded-r-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-v" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="absolute bottom-0 left-0 w-[60px] h-[60px]">
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-green-400 rounded-b-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-h" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-0 left-0 w-[3px] h-full bg-green-400 rounded-l-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-v" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className="absolute bottom-0 right-0 w-[60px] h-[60px]">
                <div className="absolute bottom-0 right-0 w-full h-[3px] bg-green-400 rounded-b-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-h" style={{ animationDelay: '1.5s' }} />
                <div className="absolute bottom-0 right-0 w-[3px] h-full bg-green-400 rounded-r-sm shadow-[0_0_20px_rgba(74,222,128,0.5)] corner-animation-v" style={{ animationDelay: '1.5s' }} />
              </div>
              
              {/* Scan Line */}
              <div className="absolute w-[90%] h-[2px] left-[5%] scan-line-animation blur-[0.5px] shadow-[0_0_20px_#4ade80,0_0_40px_#4ade80,0_0_60px_rgba(74,222,128,0.5)]"
                   style={{
                     background: 'linear-gradient(90deg, transparent 0%, #4ade80 10%, #86efac 50%, #4ade80 90%, transparent 100%)'
                   }} />
              
              {/* Center Focus */}
              <div className="absolute top-1/2 left-1/2 w-[60px] h-[60px] border-2 border-green-400/30 rounded-xl center-focus-animation" />
              
              {/* Analyzing Text */}
              <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 text-slate-400 text-sm font-medium flex items-center gap-0.5">
                Analysiert
                <span className="dot-blink">.</span>
                <span className="dot-blink" style={{ animationDelay: '0.3s' }}>.</span>
                <span className="dot-blink" style={{ animationDelay: '0.6s' }}>.</span>
              </div>
              
              {/* Loading Overlay */}
              <div className={cn(
                "absolute inset-0 bg-[#0f1419]/90 flex items-center justify-center rounded-3xl transition-all duration-300 z-50",
                isScanning ? "opacity-100 visible" : "opacity-0 invisible"
              )}>
                <div className="w-12 h-12 border-3 border-green-400/20 border-t-green-400 rounded-full animate-spin" />
              </div>
              
              {/* Success Checkmark */}
              <svg 
                className={cn(
                  "absolute top-1/2 left-1/2 w-20 h-20 z-[60]",
                  showSuccess ? "checkmark-animation" : "scale-0 opacity-0"
                )}
                viewBox="0 0 80 80" 
                fill="none"
              >
                <circle cx="40" cy="40" r="38" stroke="#4ade80" strokeWidth="4"/>
                <path 
                  d="M22 40l12 12 24-24" 
                  stroke="#4ade80" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Scan Button */}
        <button 
          className={cn(
            "relative flex items-center justify-center gap-3 px-10 py-4 rounded-2xl",
            "bg-gradient-to-r from-green-400 to-green-600 text-[#0f1419]",
            "font-semibold text-lg tracking-wide",
            "shadow-[0_4px_20px_rgba(74,222,128,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "transition-all duration-300 overflow-hidden scan-button-shine",
            "hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(74,222,128,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "active:scale-[0.97] active:shadow-[0_2px_10px_rgba(74,222,128,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "disabled:opacity-70 disabled:cursor-not-allowed"
          )}
          onClick={handleScan}
          disabled={isScanning}
        >
          <QrCode className="w-6 h-6" />
          <span>Produkt scannen</span>
        </button>
      </div>
    </>
  );
};

export default QRScanner;