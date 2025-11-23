"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AdminMetricTone = "brand" | "success" | "warning" | "danger" | "neutral";

interface AdminMetricCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  primaryValue: React.ReactNode;
  secondaryValue?: React.ReactNode;
  helperText?: React.ReactNode;
  tone?: AdminMetricTone;
  className?: string;
}

const toneStyles: Record<AdminMetricTone, { icon: string; accent: string }> = {
  brand: {
    icon: "text-brand-600 dark:text-brand-400",
    accent: "bg-brand-50 dark:bg-brand-500/15",
  },
  success: {
    icon: "text-green-600 dark:text-green-400",
    accent: "bg-green-50 dark:bg-green-500/15",
  },
  warning: {
    icon: "text-orange-600 dark:text-orange-400",
    accent: "bg-orange-50 dark:bg-orange-500/15",
  },
  danger: {
    icon: "text-red-600 dark:text-red-400",
    accent: "bg-red-50 dark:bg-red-500/15",
  },
  neutral: {
    icon: "text-gray-600 dark:text-gray-400",
    accent: "bg-gray-100 dark:bg-gray-800",
  },
};

const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  icon: Icon,
  label,
  primaryValue,
  secondaryValue,
  helperText,
  tone = "brand",
  className,
}) => {
  const styles = toneStyles[tone];

  return (
    <article
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-colors hover:border-brand-200 focus-within:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </span>
          <div className="flex flex-col">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white/90">
              {primaryValue}
            </span>
            {secondaryValue ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {secondaryValue}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            styles.accent,
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-6 w-6", styles.icon)} />
        </div>
      </div>
      {helperText ? (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </article>
  );
};

export default AdminMetricCard;


