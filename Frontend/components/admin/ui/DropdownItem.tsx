"use client";
import Link from "next/link";
import type React from "react";

interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  onItemClick?: () => void;
  href?: string;
  tag?: "a" | "button" | "div";
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  className = "",
  onItemClick,
  href,
  tag = "div",
}) => {
  const baseClassName = `block cursor-pointer ${className}`;

  if (tag === "a" && href) {
    return (
      <Link href={href} className={baseClassName} onClick={onItemClick}>
        {children}
      </Link>
    );
  }

  if (tag === "button") {
    return (
      <button className={baseClassName} onClick={onItemClick}>
        {children}
      </button>
    );
  }

  return (
    <div className={baseClassName} onClick={onItemClick}>
      {children}
    </div>
  );
};

