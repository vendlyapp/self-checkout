"use client";

import React from "react";
import { AlertCircle, FolderOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminDataStateType = "loading" | "error" | "empty";

interface AdminDataStateProps {
  type: AdminDataStateType;
  title?: string;
  description?: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const iconMap: Record<
  AdminDataStateType,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  loading: Loader2,
  error: AlertCircle,
  empty: FolderOpen,
};

const toneMap: Record<AdminDataStateType, string> = {
  loading:
    "bg-gray-50 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300 border border-dashed border-gray-200 dark:border-gray-700",
  error:
    "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200 dark:border-red-500/50",
  empty:
    "bg-white text-gray-600 border border-dashed border-gray-200 dark:bg-white/[0.03] dark:text-gray-400 dark:border-gray-800",
};

const AdminDataState: React.FC<AdminDataStateProps> = ({
  type,
  title,
  description,
  className,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
}) => {
  const Icon = iconMap[type];
  const toneClasses = toneMap[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-12 text-center transition-colors",
        toneClasses,
        className,
      )}
      role="status"
      aria-live={type === "loading" ? "polite" : "off"}
    >
      <Icon
        className={cn(
          "h-8 w-8",
          type === "loading" ? "animate-spin" : undefined,
        )}
        aria-hidden="true"
      />
      {title ? (
        <h3 className="text-base font-semibold text-current">{title}</h3>
      ) : null}
      {description ? (
        <p className="max-w-sm text-sm text-current/80">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
          aria-label={actionLabel}
        >
          {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
          <span>{actionLabel}</span>
        </button>
      ) : null}
    </div>
  );
};

export default AdminDataState;


