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
    <div className="flex-1 overflow-y-auto pt-4 pb-32 gpu-accelerated animate-fade-in-scale">
      {children}
    </div>
  );
}
