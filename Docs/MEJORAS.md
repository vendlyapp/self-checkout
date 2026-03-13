# Mejoras técnicas — Backlog

Mejoras identificadas sobre el estado actual del sistema. Ordenadas por impacto/prioridad.

---

## 🔴 Alta prioridad

### 1. Tests — 0% cobertura actual
El proyecto no tiene ningún test. Cualquier cambio puede romper funcionalidad sin saberlo.

**Qué implementar:**
- Backend: Jest + Supertest para endpoints críticos (crear orden, validar stock, auth)
- Frontend: Vitest + React Testing Library para componentes y hooks clave
- E2E: Playwright para el flujo completo cliente (scan → carrito → pago)

**Por dónde empezar:** Tests del `OrderService` (es el más crítico, maneja dinero y stock).

---

### 2. Migrar Backend a TypeScript
El backend está en JavaScript puro. Los bugs de tipos solo aparecen en runtime.

**Plan gradual:**
1. Instalar `tsx` + `@types/node` + `@types/express`
2. Renombrar `.js` → `.ts` empezando por los models/types
3. Agregar interfaces para `req.user`, respuestas de BD, parámetros de servicio
4. Configurar `tsconfig.json` estricto

**Impacto:** Reduce bugs, mejora el autocompletado, facilita refactors seguros.

---

### 3. Eliminar rutas legacy `/user`
Existen rutas `/user/cart`, `/user/payment`, `/user/scan` que redirigen a `/store/[slug]/*` pero siguen en el codebase generando deuda técnica.

**Excepción:** `/user/scan` tiene funcionalidad propia que no está en `/store/[slug]/scan`. Unificar primero.

**Impacto:** Menos código, menos confusión, menos superficie de bugs.

---

### 4. Paginación en todas las listas
Actualmente los endpoints devuelven TODOS los registros. Con tiendas grandes esto puede ser un problema.

**Endpoints a paginar:**
- `GET /api/products` → `?page=1&limit=20`
- `GET /api/orders` → `?page=1&limit=20`
- `GET /api/invoices` → `?page=1&limit=20`
- `GET /api/customers` → `?page=1&limit=20`

**Frontend:** actualizar React Query hooks para soportar paginación infinita con `useInfiniteQuery`.

---

## 🟡 Prioridad media

### 5. Índices en base de datos
Las queries más frecuentes no tienen índices optimizados.

**Índices que agregar:**
```sql
CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_stores_slug ON stores(slug);  -- ya debería existir por UNIQUE
```

---

### 6. Manejo de imágenes con Supabase Storage
Las imágenes de productos se guardan como URLs externas (strings). Esto es frágil — si la URL falla, la imagen desaparece.

**Mejora:**
- Subir imágenes a Supabase Storage desde el frontend
- Guardar la ruta en Storage (no la URL completa)
- Generar URLs firmadas/públicas desde el backend
- Compresión automática antes de subir (client-side, con `browser-image-compression`)

---

### 7. Logging estructurado
Actualmente solo hay `morgan` para requests HTTP. No hay logging de errores estructurado.

**Implementar:**
- `pino` o `winston` en el backend para logs JSON estructurados
- Niveles: `error`, `warn`, `info`, `debug`
- En producción: integrar con servicio como Logtail o Datadog

---

### 8. Caché con Redis (para producción)
El `authMiddleware` ya tiene un caché en memoria (TTL 60s), pero se resetea con cada deploy.

**Mejora:**
- Redis para caché de usuario (persiste entre deploys)
- Caché de productos y categorías por tienda (TTL 5 min, invalidar en mutations)
- Especialmente útil cuando muchos clientes acceden a la misma tienda simultáneamente

---

### 9. Stripe Connect (pagos reales)
Actualmente el pago es "manual" (el cliente declara que pagó, el admin confirma). No hay procesamiento real de pagos.

**Roadmap:**
1. Stripe Connect para onboarding de comerciantes (cada tienda conecta su cuenta Stripe)
2. TWINT via Stripe (disponible en Suiza)
3. Webhooks para confirmar pagos automáticamente
4. Split de comisión Vendly/comerciante automático

**Esto es el cambio más grande y de mayor impacto en el negocio.**

---

### 10. Rate limiting más granular
El rate limiting actual es global (500 req/min). Necesita ser más inteligente.

**Mejorar:**
```javascript
// Por endpoint crítico
authLimiter: 10 req/min por IP (signup/signin)
orderLimiter: 30 req/min por usuario (crear órdenes)
publicLimiter: 100 req/min por IP (rutas públicas /store/:slug)
```

---

## 🟢 Prioridad baja

### 11. Error tracking en producción
Sin Sentry ni similar, los errores en producción son invisibles hasta que un usuario reporta.

**Instalar:** Sentry en frontend (`@sentry/nextjs`) y backend (`@sentry/node`).

---

### 12. Internacionalización (i18n)
El texto del sistema está mezclado: algunos en alemán (`Warenkorb`, `Bezahlen`), algunos en español (comentarios), algunos en inglés (código).

**Para una app suiza, soportar:** Deutsch, Français, Italiano, English.

**Librería:** `next-intl` para Next.js.

---

### 13. Notificaciones push (PWA)
La app es PWA pero no usa notificaciones push.

**Casos de uso:**
- Admin recibe notificación cuando hay una orden nueva
- Cliente recibe confirmación de pago

**Implementar con:** Web Push API + service worker.

---

### 14. Optimización del `OrderService`
El archivo tiene ~41KB lo que indica que maneja demasiadas responsabilidades.

**Refactor:**
- Extraer `StockService` (validación y actualización de stock)
- Extraer `PromoService` (aplicación de descuentos)
- `OrderService` solo coordina, no implementa

---

### 15. Variables de entorno tipadas
El acceso a `process.env` en el backend no tiene validación. Una variable faltante causa un crash oscuro.

**Implementar:**
```javascript
// config/env.js
import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  DATABASE_URL: z.string(),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)
```

---

## Estado actual resumido

| Área | Estado |
|------|--------|
| Tests | ❌ Sin tests |
| TypeScript Backend | ❌ JavaScript puro |
| Paginación | ❌ Sin paginación |
| Índices DB | ⚠️ Básicos |
| Imágenes | ⚠️ URLs externas |
| Logging | ⚠️ Solo Morgan |
| Pagos reales | ❌ Manual |
| Error tracking | ❌ Sin Sentry |
| Caché Redis | ❌ Solo en memoria |
| i18n | ❌ Sin implementar |
| Rutas legacy | ⚠️ Pendiente de eliminar |
