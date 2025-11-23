# ✅ Checklist de Producción - Fly.io

Checklist completo para verificar que todo esté listo antes de desplegar a producción.

---

## 📋 Pre-Deploy Checklist

### Repositorio
- [ ] Código commiteado y pusheado a la rama principal
- [ ] `fly.toml` presente y configurado
- [ ] `Dockerfile` presente y configurado
- [ ] `.dockerignore` presente
- [ ] `.env.example` actualizado con todas las variables
- [ ] `.env` NO está en el repositorio (verificado en `.gitignore`)
- [ ] `package.json` tiene script `start` definido
- [ ] Dependencias actualizadas y sin vulnerabilidades críticas

### Variables de Entorno
- [ ] `NODE_ENV=production` (configurar en Fly.io)
- [ ] `PORT=3000` (configurado en fly.toml)
- [ ] `DATABASE_URL` configurada (Supabase pooler URL)
- [ ] `DIRECT_URL` configurada (Supabase direct URL)
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_ANON_KEY` configurada
- [ ] `FRONTEND_URL` apunta a dominio de producción (https://vendly.ch)
- [ ] `CORS_ORIGIN` apunta a dominio de producción (https://vendly.ch)
- [ ] `CORS_ORIGIN` NO contiene wildcards (*)

### Base de Datos
- [ ] Supabase proyecto creado y configurado
- [ ] Base de datos inicializada (scripts ejecutados)
- [ ] Tablas creadas correctamente
- [ ] Conexión de prueba exitosa localmente
- [ ] Supabase en región europea (eu-central-1 o eu-west-1)

### Código
- [ ] Health check endpoint (`/health`) funcionando
- [ ] Todos los endpoints principales probados localmente
- [ ] Autenticación funcionando correctamente
- [ ] Validación de errores implementada
- [ ] Logs configurados correctamente

### Seguridad
- [ ] Rate limiting implementado (recomendado)
- [ ] Helmet.js configurado (recomendado)
- [ ] CORS configurado solo para dominio de producción
- [ ] Variables sensibles no hardcodeadas
- [ ] Secrets configurados en Fly.io (`flyctl secrets set`)

---

## 🚀 Fly.io Configuration Checklist

### Proyecto
- [ ] `flyctl` instalado
- [ ] Cuenta de Fly.io creada
- [ ] Autenticado en Fly.io (`flyctl auth login`)
- [ ] Aplicación inicializada (`flyctl launch --no-deploy`)

### Build & Deploy
- [ ] `Dockerfile` presente y funcional
- [ ] `.dockerignore` configurado correctamente
- [ ] Health check path: `/health` (configurado en fly.toml)
- [ ] Health check timeout: 5s (configurado en fly.toml)

### Variables de Entorno
- [ ] Todas las variables configuradas con `flyctl secrets set`
- [ ] Variables verificadas (`flyctl secrets list`)
- [ ] Variables de producción diferentes a desarrollo

### Networking
- [ ] Región seleccionada en `fly.toml` (primary_region)
- [ ] Dominio generado o personalizado configurado
- [ ] SSL/HTTPS activo (force_https = true en fly.toml)

### Recursos
- [ ] CPU configurado en fly.toml (cpu_kind, cpus)
- [ ] Memoria configurada en fly.toml (memory_mb)
- [ ] Recursos adecuados para producción

---

## 🚀 Deploy Checklist

### Primer Deploy
- [ ] Deploy iniciado
- [ ] Build exitoso (sin errores)
- [ ] Deploy exitoso
- [ ] Health check pasando
- [ ] Logs sin errores críticos

### Verificación Post-Deploy
- [ ] Health check responde: `curl https://vendly-checkout-backend.fly.dev/health`
- [ ] API Docs accesible: `https://vendly-checkout-backend.fly.dev/api-docs`
- [ ] Endpoint de productos funciona: `GET /api/products`
- [ ] Autenticación funciona: `POST /api/auth/login`
- [ ] CORS configurado correctamente (probar desde frontend)

### Monitoreo
- [ ] Logs visibles (`flyctl logs`)
- [ ] Métricas visibles (`flyctl metrics`)
- [ ] Estado de la app verificado (`flyctl status`)
- [ ] No hay errores en logs
- [ ] Health checks pasando consistentemente

---

## 🔒 Seguridad Post-Deploy

### Verificaciones
- [ ] HTTPS activo (verificar certificado SSL)
- [ ] Variables de entorno no visibles en logs públicos
- [ ] CORS solo permite dominio de producción
- [ ] Rate limiting funcionando (si implementado)
- [ ] Headers de seguridad configurados (Helmet.js)

### Testing de Seguridad
- [ ] Intentar acceso sin token → 401 Unauthorized
- [ ] Intentar acceso con token inválido → 401 Unauthorized
- [ ] CORS bloquea requests de otros dominios
- [ ] Health check no expone información sensible

---

## 📊 Monitoreo Continuo

### Configurar Alertas (Opcional)
- [ ] Alertas para deploy failures
- [ ] Alertas para health check failures
- [ ] Alertas para resource limits

### Métricas a Monitorear
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Response time < 500ms (P95)
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

---

## 🔄 Actualización del Frontend

### Configuración
- [ ] Frontend actualizado con nueva URL de API
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada
- [ ] Frontend probado con backend en producción
- [ ] CORS permite requests del frontend

---

## 📝 Documentación

### Actualizar
- [ ] README.md actualizado con URL de producción
- [ ] Documentación de API actualizada
- [ ] Variables de entorno documentadas
- [ ] Proceso de deploy documentado

---

## ✅ Sign-off Final

Antes de considerar el deploy completo:

- [ ] Todos los checks anteriores completados
- [ ] Pruebas end-to-end exitosas
- [ ] Equipo notificado del deploy
- [ ] Rollback plan documentado (opcional pero recomendado)

---

## 🆘 Rollback Plan

Si algo sale mal:

1. **Ver deployments anteriores:**
   ```bash
   flyctl releases
   ```

2. **Redesplegar versión anterior:**
   ```bash
   flyctl releases rollback <release-id>
   ```

O manualmente:
1. Revertir commit en Git
2. Push a repositorio
3. Redesplegar con `flyctl deploy`

---

## 📞 Contacto y Soporte

- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs/)
- **Fly.io Community**: [community.fly.io](https://community.fly.io)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**Última actualización**: Noviembre 2025

