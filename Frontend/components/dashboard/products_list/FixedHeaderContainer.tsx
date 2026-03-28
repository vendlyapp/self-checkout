"use client";

import React from "react";

interface FixedHeaderContainerProps {
  children: React.ReactNode;
}

/**
 * Contenedor para contenido bajo headers fijos (products_list, categories).
 * El padding-top lo aplica ya el main en AdminLayout (layoutHeights), no duplicar aquí.
 */
export default function FixedHeaderContainer({
  children,
}: FixedHeaderContainerProps) {
  return (
    <div className="min-w-0 flex-1 animate-fade-in-scale overflow-y-auto pb-32 pt-20">
      {children}
    </div>
  );
}
