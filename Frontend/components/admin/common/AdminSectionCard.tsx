"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminSectionCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const AdminSectionCard: React.FC<AdminSectionCardProps> = ({
  title,
  subtitle,
  actions,
  footer,
  children,
  className,
  contentClassName,
}) => {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]",
        className,
      )}
    >
      {title || subtitle || actions ? (
        <header className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            {title ? (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("flex-1 p-5 sm:p-6", contentClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {footer}
        </footer>
      ) : null}
    </section>
  );
};

export default AdminSectionCard;


