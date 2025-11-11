"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SegmentedItem<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface AdminSegmentedControlProps<T extends string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}

const AdminSegmentedControl = <T extends string>({
  items,
  value,
  onChange,
  className,
  size = "md",
  ariaLabel,
}: AdminSegmentedControlProps<T>) => {
  const paddingClasses = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, itemValue: T) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(itemValue);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900/60",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, item.value)}
            className={cn(
              "flex items-center justify-center rounded-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
              paddingClasses,
              isActive
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white/90",
            )}
          >
            <span>{item.label}</span>
            {item.description ? (
              <span className="ml-2 hidden text-xs font-normal text-gray-400 dark:text-gray-500 sm:inline">
                {item.description}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default AdminSegmentedControl;


