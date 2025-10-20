"use client";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type NavigationItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "success" | "info" | "warning" | "danger";
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  showArrow?: boolean;
  className?: string;
};

const badgeColors: Record<string, string> = {
  success: "bg-brand-100 text-brand-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  default: "bg-gray-100 text-gray-700",
};

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeVariant = "default",
  onClick,
  href,
  ariaLabel,
  showArrow = true,
  className = "",
}) => {
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`w-full flex items-center gap-4 py-4 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-500 group transition-transform duration-150 ${
        pressed ? "scale-95" : ""
      } ${className}`}
      tabIndex={0}
      aria-label={ariaLabel || title}
      onClick={handleClick}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <div className="w-10 h-10 rounded-xl bg-warm-300 flex items-center justify-center">
        <span className="text-brand-700 bg-background-cream rounded-lg p-2">
          {icon}
        </span>
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-[#373F49] text-[16px] leading-tight">
          {title}
        </div>
        {subtitle && (
          <div className="text-[14px] font-regular text-[#6E7996] mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      {badge && (
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
            badgeColors[badgeVariant] || badgeColors.default
          }`}
        >
          {badge}
        </span>
      )}
      {showArrow && (
        <ChevronRight className="w-4 h-4 text-gray-400 group-active:translate-x-0.5 transition-transform ml-1" />
      )}
    </button>
  );
};

export default NavigationItem;
