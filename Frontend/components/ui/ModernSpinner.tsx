import React from "react";

interface ModernSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "green" | "brand" | "gray";
  className?: string;
}

const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = "md",
  color = "green",
  className = "",
}) => {
  // Configuración de tamaños
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  // Configuración de colores con gradientes verdes mejorados
  const colorClasses = {
    blue: {
      border: "border-t-blue-500 border-r-blue-400 border-b-blue-300",
      inner: "bg-blue-50",
      center: "bg-blue-500",
      glow: "shadow-blue-500/50",
    },
    green: {
      border: "border-t-[#25d076] border-r-[#39f592] border-b-[#22c57f]",
      inner: "bg-[#e8fbf0]",
      center: "bg-[#25d076]",
      glow: "shadow-[#25d076]/50",
    },
    brand: {
      border: "border-t-[#25d076] border-r-[#39f592] border-b-[#22c57f]",
      inner: "bg-[#e8fbf0]",
      center: "bg-[#25d076]",
      glow: "shadow-[#25d076]/50",
    },
    gray: {
      border: "border-t-gray-500 border-r-gray-400 border-b-gray-300",
      inner: "bg-gray-50",
      center: "bg-gray-500",
      glow: "shadow-gray-500/50",
    },
  };

  const selectedSize = sizeClasses[size];
  const selectedColors = colorClasses[color];

  return (
    <div className={`relative ${selectedSize} mx-auto ${className}`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full ${selectedColors.glow} blur-xl opacity-30 animate-pulse`}></div>
      
      {/* Círculo exterior estático con sombra suave */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>

      {/* Círculo animado con gradiente mejorado */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-transparent ${selectedColors.border} animate-spin`}
        style={{
          animation: "spin 1s linear infinite",
        }}
      ></div>

      {/* Círculo interior con pulso suave */}
      <div
        className={`absolute inset-2 rounded-full ${selectedColors.inner} animate-pulse`}
        style={{
          animation: "pulse 2s ease-in-out infinite",
        }}
      ></div>

      {/* Punto central con efecto de brillo */}
      <div
        className={`absolute inset-4 rounded-full ${selectedColors.center} shadow-lg`}
        style={{
          animation: "ping 2s ease-out infinite",
          boxShadow: `0 0 0 0 ${selectedColors.center}40, 0 0 0 0 ${selectedColors.center}40`,
        }}
      ></div>
    </div>
  );
};

export default ModernSpinner;
