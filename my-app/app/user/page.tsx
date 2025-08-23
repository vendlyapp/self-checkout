"use client";

import DashboardUser from "@/components/user/Dashboard";
import React from "react";

/**
 * Dashboard Page - Página principal del dashboard
 *
 * Esta página actúa como un punto de entrada limpio que simplemente
 * renderiza el componente HomeDashboard. Toda la lógica de presentación
 * está en el componente HomeDashboard para seguir el principio de
 * separación de responsabilidades.
 *
 * Beneficios de esta arquitectura:
 * - Page solo se encarga de routing
 * - HomeDashboard maneja toda la lógica de presentación
 * - Facilita testing y reutilización
 * - Mejor preparado para SSR/SSG si se necesita
 * - Arquitectura escalable para futuras funcionalidades
 */
export default function UserPage() {
  return <DashboardUser />;
}
