"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import React from "react";

export type PromotionCardProps = {
  title?: string;
  discountPercent?: number;
  imageUrl: string;
  name: string;
  currency?: string;
  price: number;
  originalPrice?: number;
  progressFraction?: number; // 0..1
  progressLabel?: string;
  actionLabel?: string;
  onAdd?: () => void;
  className?: string;
  disabled?: boolean;
};

const formatPrice = (value: number): string => {
  if (Number.isNaN(value)) return "0.00";
  return value % 1 === 0 ? `${value.toFixed(0)}.-` : value.toFixed(2);
};

const clamp01 = (value = 0): number => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

export const PromotionCard: React.FC<PromotionCardProps> = ({
  title = "Tagesaktion",
  discountPercent,
  imageUrl,
  name,
  currency = "CHF",
  price,
  originalPrice,
  progressFraction = 0,
  progressLabel,
  actionLabel = "Jetzt hinzufügen",
  onAdd,
  className,
  disabled = false,
}) => {
  const handleAddClick = () => {
    if (disabled) return;
    if (onAdd) onAdd();
  };

  // Debug: ver qué valor llega
  console.log('ProgressFraction recibido:', progressFraction, 'Tipo:', typeof progressFraction);

  const progressWidth = `${Math.round(clamp01(progressFraction) * 100)}%`;

  // Debug: ver el ancho calculado
  console.log('ProgressWidth calculado:', progressWidth, 'Valor original:', progressFraction);

  return (
    <div
      className={clsx(
        // Layout y estructura
        "bg-white rounded-2xl p-4 flex flex-col items-center shrink-0",
        // Sombra personalizada
        "shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        className
      )}
      style={{
        width: "232px",
        height: "292px",
      }}
      role="region"
      aria-label={`${title}: ${name}`}
    >
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-[#FD3F37] font-semibold text-lg leading-[19px] font-inter">
          {title}
        </h3>
      </div>

      {/* Image container with badges */}
      <div className="relative mb-4">
        {/* Image */}
        <div
          className="relative overflow-hidden rounded-lg border border-[#E2DFDC] shrink-0"
          style={{
            width: "136.5px",
            height: "90px",
            aspectRatio: "91/60",
          }}
        >
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Discount badge */}
        {typeof discountPercent === "number" && (
          <div className="absolute -top-2 -left-6">
            <span className="w-10 h-6 px-6 py-2 bg-[#FD3F37] flex items-center justify-center text-white text-sm font-bold rounded-full">
              -{Math.round(discountPercent)}%
            </span>
          </div>
        )}

        {/* Price bubble */}
        <div className="absolute -right-10 bottom-3 w-[70px] h-[70px] bg-white rounded-full flex flex-col items-center justify-center border-2 border-gray-50 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
          <span className="font-semibold leading-3 text-[10px] text-[#FD3F37]">
            {currency}
          </span>
          <span className="font-black leading-none text-xl text-[#FD3F37]">
            {formatPrice(price)}
          </span>
          {typeof originalPrice === "number" && (
            <span className="font-medium leading-3 text-[8px] text-[#FD3F37] opacity-70">
              statt {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="text-center px-2 w-full h-[60px] flex items-center justify-center">
        <h4 className="font-semibold text-sm text-gray-800 leading-tight max-w-full truncate whitespace-nowrap overflow-hidden">
          {name}
        </h4>
      </div>

      {/* Progress bar */}
      <div className="w-full mb-2 h-[40px] flex flex-col justify-center">
        <div className="w-full h-3 rounded-full bg-[#F2EDE8] overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#C9B27B] to-[#D4C08C] shadow-sm"
            style={{
              width: progressWidth,
              minWidth: progressFraction > 0 ? "8px" : "0px", // Mínimo 8px si hay progreso
            }}
            aria-hidden="true"
          />
        </div>
        {progressLabel && (
          <div className="text-center">
            <span className="font-medium text-[10px] text-gray-600">
              {progressLabel}
            </span>
          </div>
        )}
      </div>

      {/* CTA Button - positioned at bottom */}
      <div className="mt-auto w-full flex justify-center">
        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled}
          className={clsx(
            // Layout y estructura
            "flex items-center justify-center gap-2 shrink-0 rounded-full",
            // Tipografía
            "font-bold text-white text-sm",
            // Transiciones
            "transition-all duration-200",
            // Estados
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-400"
              : "bg-[#25D076] hover:bg-[#25D076]/90 hover:scale-105 active:scale-95",
            // Sombra personalizada
            "shadow-[0_7px_29px_0_rgba(100,100,111,0.20)]"
          )}
          style={{
            width: "199.594px",
            height: "35px",
          }}
          aria-label={`${actionLabel} ${name}`}
        >
          {actionLabel}
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PromotionCard;
