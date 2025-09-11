"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ActionButtonProps } from "./types";

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  variant = "primary",
}) => {
  // Estado para el efecto de presión
  const [pressed, setPressed] = useState(false);

  const baseClasses =
    "btn-tap w-full rounded-2xl p-5 flex items-center justify-between transition-all group transition-transform duration-150 mb-3 mt-3";
  const variantClasses =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
      : "bg-card border border-border hover:bg-muted";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${
        pressed ? "scale-95" : ""
      }`}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 ${
            variant === "primary" ? "bg-white/20" : "bg-muted"
          } rounded-xl flex items-center justify-center`}
        >
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-base">{title}</h3>
          <p
            className={`text-sm ${
              variant === "primary" ? "opacity-90" : "text-muted-foreground"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

export default ActionButton;
