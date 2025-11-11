"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  meta,
  actions,
  className,
}) => {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          ) : null}
        </div>
        {meta ? (
          <div
            className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            {meta}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </header>
  );
};

export default AdminPageHeader;


