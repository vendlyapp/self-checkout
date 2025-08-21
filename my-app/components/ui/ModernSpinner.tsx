import React from "react";

interface ModernSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "green" | "brand" | "gray";
  className?: string;
}

const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = "md",
  color = "blue",
  className = "",
}) => {
  // Configuración de tamaños
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  // Configuración de colores
  const colorClasses = {
    blue: {
      border: "border-t-blue-500 border-r-blue-400 border-b-blue-300",
      inner: "bg-blue-50",
      center: "bg-blue-500",
    },
    green: {
      border: "border-t-green-500 border-r-green-400 border-b-green-300",
      inner: "bg-green-50",
      center: "bg-green-500",
    },
    brand: {
      border: "border-t-brand-500 border-r-brand-400 border-b-brand-300",
      inner: "bg-brand-50",
      center: "bg-brand-500",
    },
    gray: {
      border: "border-t-gray-500 border-r-gray-400 border-b-gray-300",
      inner: "bg-gray-50",
      center: "bg-gray-500",
    },
  };

  const selectedSize = sizeClasses[size];
  const selectedColors = colorClasses[color];

  return (
    <div className={`relative ${selectedSize} mx-auto ${className}`}>
      {/* Círculo exterior estático */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

      {/* Círculo animado con gradiente */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-transparent ${selectedColors.border} animate-spin`}
      ></div>

      {/* Círculo interior con pulso */}
      <div
        className={`absolute inset-2 rounded-full ${selectedColors.inner} animate-pulse`}
      ></div>

      {/* Punto central con ping */}
      <div
        className={`absolute inset-4 rounded-full ${selectedColors.center} animate-ping`}
      ></div>
    </div>
  );
};

export default ModernSpinner;
