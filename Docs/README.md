# Vendly Checkout — Documentación del Sistema

**Actualizado:** Marzo 2026
**Versión:** Frontend 0.1.0 | Backend 2.0.0

---

## ¿Qué es Vendly Checkout?

Sistema de Self-Checkout para tiendas físicas. El cliente escanea un QR code en la tienda, accede a la vista de productos, agrega items al carrito y paga — todo desde su móvil sin pasar por caja.

El administrador gestiona productos, categorías, promociones, órdenes e invoices desde un panel web.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│  CLIENTE (móvil)                                        │
│  Escanea QR → /store/[slug] → agrega al carrito → paga │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│  FRONTEND — Next.js 15 (App Router)                     │
│  Vercel / localhost:3000                                 │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────────┐
│  BACKEND — Express.js (Node.js)                         │
│  Fly.io / localhost:5000                                 │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Supabase (PostgreSQL + Auth + Storage)                 │
└─────────────────────────────────────────────────────────┘
```

---

## Documentación disponible

| Archivo | Descripción |
|---------|-------------|
| [SETUP.md](./SETUP.md) | Cómo correr el proyecto localmente |
| [FRONTEND.md](./FRONTEND.md) | Estructura, rutas, componentes, estado global |
| [BACKEND.md](./BACKEND.md) | Endpoints, servicios, base de datos, middlewares |
| [MEJORAS.md](./MEJORAS.md) | Backlog de mejoras técnicas identificadas |

---

## Stack resumido

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS v4 |
| Estado | Zustand (client), React Query (server state) |
| Backend | Express.js, Node.js 18+, JavaScript |
| Base de datos | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (JWT + Google OAuth) |
| Deploy Frontend | Vercel (o cualquier plataforma Node) |
| Deploy Backend | Fly.io |

---

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| `SUPER_ADMIN` | Panel `/super-admin` — gestión de toda la plataforma |
| `ADMIN` | Panel `/dashboard` — gestión de su tienda |
| `CUSTOMER` | Vista `/store/[slug]` — compra en la tienda |
