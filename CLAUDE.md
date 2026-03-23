# Vendly Checkout

## ULTRON project name: `vendly`
Al iniciar → `/start` → elegir "vendly"

## Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind
- **Backend:** Express + **JavaScript** (NO TypeScript) + PostgreSQL
- **Auth:** Supabase Auth
- **BD:** PostgreSQL → usar `mcp__supabase-vendly__` para queries directas
- **UI language:** Alemán (strings de interfaz en alemán)
- **Cliente:** Operador en Suiza

## Estado
Funcional. Pendiente: integración final de pagos.
Derechos del código: 100% de Steven.

## Patrones específicos
- Variables y strings de UI en alemán (ej: `inaktiv`, `Kunde`, `Geschäft`)
- Supabase Auth para autenticación de comercios
- Backend en JS puro — no agregar TypeScript al backend existente

## Archivos clave
- Frontend: Next.js en raíz del proyecto
- Backend: carpeta `back/` o `server/` (verificar estructura actual)
