"use client";

import DashboardUser from "@/components/user/Dashboard";
import React from "react";

/**
 * User Dashboard Page - Página principal del usuario optimizada para móvil
 *
 * Esta página actúa como un punto de entrada limpio que simplemente
 * renderiza el componente DashboardUser. Toda la lógica de presentación
 * está en el componente DashboardUser para seguir el principio de
 * separación de responsabilidades.
 *
 * Optimizaciones móviles aplicadas:
 * - Layout optimizado para iPhone 12+ con safe areas
 * - Soporte completo para Safari iOS y barras de navegación
 * - Viewport dinámico para evitar problemas con barras del navegador
 * - Touch targets optimizados para pantallas táctiles
 * - Scroll behavior mejorado para dispositivos iOS
 */
export default function UserPage() {
  return (
    <div className="w-full h-full ios-scroll-fix">
      <DashboardUser />
    </div>
  );
}
