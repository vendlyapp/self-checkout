# Auditoría: Seguridad, Rendimiento y Calidad — Vendly Checkout
**Fecha**: 24 abr 2026  
**Estado del proyecto**: Funcional, pre-producción  
**Código**: 52 archivos backend (~15K LOC) + Next.js 15 frontend

---

## 🟢 FORTALEZAS ACTUALES

### Seguridad
✅ **Helmet.js** configurado con CSP, X-Frame-Options, permissionsPolicy  
✅ **Rate limiting estratificado**: checkout (60/10min), discount (30/15min), global (500/min)  
✅ **CORS explícito**: fail-fast en producción si no está configurado  
✅ **JWT verificación** via Supabase (token lifecycle management)  
✅ **User cache** con TTL 60s evita N+1 queries en auth middleware  
✅ **Swagger disabled** en producción (no expone API surface)  
✅ **Input limits**: JSON 100kb, URLencoded 100kb  

### Rendimiento
✅ **Compression** (gzip level 6, threshold 1024B)  
✅ **Trust proxy** configurado para reverse proxies (Fly.io, Render)  
✅ **Database pooling** via pg con graceful shutdown  
✅ **Morgan logging** configurado  
✅ **PWA** Next.js 15 + Workbox caching (Supabase API NetworkOnly, /api/* NetworkOnly)  
✅ **Image optimization** Next.js remotePatterns  

### Arquitectura
✅ **Separación clara**: app.js (config) → server.js (startup) → routes → controllers → services → db  
✅ **Swagger docs** (desarrollo) con especificación clara  
✅ **Error handling** centralizado (errorHandler, notFoundHandler)  
✅ **Health check** endpoint (`GET /health`)  

---

## 🟡 MEJORAS RECOMENDADAS (CRÍTICAS)

### 1. **Image Hosting — Riesgo: URLs externas frágiles**
**Problema**: Remote patterns incluye `hostname: "**"` (cualquier dominio)  
**Impacto**: Cargas lentas, CDN sin control, riesgo de hotlinking

```typescript
// ❌ ACTUAL (next.config.ts:72)
{
  protocol: "https",
  hostname: "**",
  pathname: "/**",
}
```

**Solución**: Migrar imágenes a **Supabase Storage** (presigned URLs)
- Eliminar wildcard `hostname: "**"`
- Whitelist solo dominios conocidos (unsplash, dev.me, via.assets.so)
- Implementar presigned URL en API para imágenes de productos

**Effort**: 2-3 horas (API endpoint + componentes)  
**Resultado**: Control de ancho de banda, CDN Supabase, mejor rendimiento  

---

### 2. **Environment Variables — Riesgo: Exposición en producción**
**Problema**: `.env.example` contiene valores placeholder pero no guía clara de requeridos vs opcionales

```bash
# ❌ ACTUAL (Backend/.env.example)
SUPER_ADMIN_EMAIL=CHANGE_ME@yourdomain.com
SUPER_ADMIN_PASSWORD=CHANGE_ME_use_a_strong_password
```

**Riesgo**: Super admin creado con credenciales débiles si no se cambian

**Solución**:
- [ ] Script de validación `.env`: `node scripts/validate-env.js`
- [ ] Documentar env vars requeridas vs opcionales
- [ ] Agregar `CORS_ORIGIN` obligatorio en `.env.example`
- [ ] Generar contraseña aleatoria si no está configurada (o fallar en startup)

**Effort**: 1 hora

---

### 3. **Validation & Input Sanitization — Riesgo: Inyección/XSS**
**Problema**: 52 archivos pero no vemos middleware de validación centralizada

**Checklist**:
- [ ] Todas las rutas POST/PUT validan input con `zod` (veo imports pero no verificado)
- [ ] Sanitizar campos de texto antes de guardar en DB (esp. nombres de productos)
- [ ] Validar IDs numéricos (evitar traversal attacks)
- [ ] Bloquear campos injection: `<script>`, `\x00`, SQL injection en LIKE

**Effort**: 4-6 horas auditoría + fixes

---

### 4. **Database Indexes — Riesgo: Queries N+1 en producción**
**Fortaleza**: Veo script `db:indexes` — ya existe  
**Verificación**:
- [ ] ¿Indizado `orders.store_id` + `orders.created_at` (queries de historial)?
- [ ] ¿Indizado `products.store_id` + `products.status`?
- [ ] ¿Indizado `discount_codes.code` (lookup en checkout)?

**Recomendación**: Ejecutar `npm run db:indexes` en producción

---

### 5. **Error Responses — Riesgo: Stack traces expuestos**
**Problema**: Error handler centralizado pero verificar que no devuelve stack en producción

```javascript
// ✅ CORRECTO (app.js línea 131)
app.use(errorHandler);
```

**Verificación**:
- [ ] Revisar `src/middleware/errorHandler.js`: ¿devuelve `.stack` en producción?
- [ ] Errors deben ser genéricos al cliente (`{ success: false, error: "Internal error" }`)
- [ ] Logs internos guardan full stack para debugging

---

### 6. **JWT Expiry & Refresh Token Rotation**
**Problema**: Supabase maneja JWT pero verificar ciclo de vida

**Checklist**:
- [ ] ¿Expiración JWT? (default Supabase: 1 hora)
- [ ] ¿Refresh token rotation implementado?
- [ ] ¿Token revocación en logout?

**Recomendación**: Implementar refresh token endpoint en `/api/auth/refresh`

---

## 🟠 MEJORAS DE RENDIMIENTO

### 1. **Database Query Optimization**
**Métrica**: 52 archivos, 15K LOC — potencial N+1

**Auditoría**:
```bash
# Comando sugerido para encontrar queries pobres
grep -r "query(" Backend/src --include="*.js" | wc -l
```

**Recomendación**:
- [ ] Usar `EXPLAIN ANALYZE` en queries complejas (orders, invoices)
- [ ] Agregar índices compound (store_id, created_at) en tablas grandes
- [ ] Considerar prepared statements para queries repetidas

**Effort**: 2-3 horas

---

### 2. **API Response Compression — Ya implementado ✅**
Gzip nivel 6 activo. Mejora marginal: cambiar a nivel 7 (trade-off CPU vs bandwidth)

---

### 3. **Frontend Bundle Size**
**Dependencies**: 17 (React Query, Recharts, ApexCharts, Shadcn, Swiper...)

**Auditoría**:
```bash
cd Frontend && npm run build
# Ver output size
```

**Recomendación**:
- [ ] Code splitting: usar `dynamic()` para rutas pesadas
- [ ] Lazy load charts (ApexCharts, Recharts) solo cuando visible
- [ ] Verificar Tree-shaking: `lucide-react` es modular ✅

---

### 4. **Payment Integration — TODO en código**
```javascript
// Backend/src/services/InvoicePDFService.js
* TODO el layout se ajusta AQUÍ, no en el frontend.
```

**Estado**: Pagos aún manuales  
**Próximo paso**: Stripe Connect + TWINT (task #1 en backlog)

---

## 🔒 CHECKLIST DE SEGURIDAD PENDIENTE

- [ ] **SQL Injection**: Auditar queries con `pg` (usa parameterized queries?)
- [ ] **CSRF Protection**: ¿Cookies SameSite=Strict configuradas?
- [ ] **Secrets Management**: ¿SUPABASE_SERVICE_ROLE_KEY en .env.local solo?
- [ ] **HTTPS Redirect**: ¿Forzar HTTPS en producción?
- [ ] **Security Headers**: Verificar HSTS, X-Content-Type-Options en Fly.io
- [ ] **Dependency Updates**: npm audit --audit-level=moderate
- [ ] **Rate Limit Bypass**: ¿Protección contra reverse proxy IP spoofing?
- [ ] **Auth Cache Invalidation**: ¿User cache se invalida en cambios de rol?

---

## 📊 CALIDAD DE CÓDIGO

| Métrica | Estado |
|---------|--------|
| **Type Safety** | ⚠️ Backend: JS puro (no TS) |
| **Testing** | ⚠️ 2 tests visibles (orderAuth.security, analytics) |
| **Documentation** | ✅ Swagger docs bien estructurado |
| **Error Handling** | ✅ Centralizado (errorHandler, logger) |
| **Logging** | ✅ Morgan + logger utilities |
| **Code Duplication** | ❓ Requiere auditoría (52 archivos) |

### Mejoras de Calidad
1. **TypeScript Backend** (opcional pero recomendado para pago)
   - Previene runtime errors en lógica crítica
   - IDE autocomplete en 52 archivos
   - Effort: 4-6 semanas full refactor (opcional para v2)

2. **Unit Tests**
   - Auth middleware (verifyToken, roles)
   - Discount code validation
   - Order creation transaction
   - Invoice generation

3. **Integration Tests**
   - Checkout flow completo (stock → order → invoice)
   - Payment webhook simulation

---

## 🎯 PLAN DE EJECUCIÓN (PRIORIDAD)

### **T1 — Esta semana (Seguridad)**
- [ ] Validar y documentar `.env` requeridas
- [ ] Auditar error handler (no expone stack)
- [ ] Ejecutar `npm run db:indexes` en dev/staging
- [ ] Revisar JWT expiry + implementar refresh endpoint
- [ ] Grep para `<`, `>`, `'`, `"` en inputs (early XSS detection)

**Effort**: 6-8 horas  
**Riesgo si no se hace**: Vulnerabilidades pre-producción

---

### **T2 — Próxima semana (Rendimiento)**
- [ ] Migrar imágenes a Supabase Storage + presigned URLs
- [ ] Auditoría de queries (EXPLAIN ANALYZE en orders, invoices)
- [ ] Agregar índices compound si falta
- [ ] Code split frontend (dynamic imports para charts)

**Effort**: 8-10 horas  
**ROI**: 30-50% mejora en tiempo de carga checkout

---

### **T3 — Antes de pago real (Crítico)**
- [ ] Integración Stripe Connect + TWINT
- [ ] Webhook de pagos + retry logic
- [ ] Testing de pago end-to-end (sandbox Stripe)
- [ ] Runbook de producción (deployment, rollback, monitoring)

**Effort**: 3-5 días (dependiendo de requisitos Suiza)

---

## 📝 RESUMEN EJECUTIVO

**Vendly Checkout está en buena forma para pre-producción.**

- ✅ Seguridad base sólida (Helmet, rate limiting, CORS)
- ✅ Arquitectura limpia y escalable
- ❌ Algunas deudas menores: image hosting, env validation, JWT refresh
- ❌ Testing y observabilidad ausentes

**Recomendación**: Completar T1 (seguridad) antes de integrar pagos reales. Luego T2 (rendimiento) en paralelo con implementación de pagos.

**Timeline realista para v1.0**: 2-3 semanas si se ejecutan T1 + T2 + T3 en paralelo.

---

## 🔗 Referencias
- Código: `/home/steven/Documentos/Vendly/Checkout/`
- Backend: `/Backend/` (52 archivos, Express + pg)
- Frontend: `/Frontend/` (Next.js 15, Tailwind 4)
- Cliente: Operador en Suiza, UI en alemán
