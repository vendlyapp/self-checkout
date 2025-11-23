# 📚 Índice de Documentación - Vendly Checkout Backend

Guía rápida para encontrar toda la documentación del proyecto.

---

## 🚀 Inicio Rápido

### Para Desarrollo Local
👉 **[README.md](./README.md)** - Guía completa de instalación y desarrollo

### Para Despliegue en Producción
👉 **[FLY_DEPLOY.md](./FLY_DEPLOY.md)** - Guía paso a paso para Fly.io

---

## 📖 Documentación Principal

### [README.md](./README.md)
**Documentación principal del proyecto**
- Instalación y configuración
- Estructura del proyecto
- API endpoints
- Scripts disponibles
- Variables de entorno
- Guía de autenticación

### [FLY_DEPLOY.md](./FLY_DEPLOY.md)
**Guía completa de despliegue en Fly.io**
- Paso a paso desde cero
- Configuración de variables
- Troubleshooting
- Monitoreo y escalado

### [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
**Checklist completo para producción**
- Verificaciones pre-deploy
- Checklist de Fly.io
- Verificaciones post-deploy
- Plan de rollback

---

## 🔧 Archivos de Configuración

### [fly.toml](./fly.toml)
Configuración de Fly.io para despliegue
- Configuración de máquinas
- Health checks
- Región preferida

---


---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con nodemon

# Producción
npm start                # Servidor de producción
npm run verify:production  # Verificar configuración

# Base de datos
npm run db:setup         # Configurar base de datos
npm run db:check         # Verificar base de datos
npm run db:seed          # Seed de datos de prueba

# Testing
npm test                 # Ejecutar tests
```

---

## 🔗 Enlaces Útiles

### Plataformas
- [Fly.io Dashboard](https://fly.io/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)

### Documentación Externa
- [Fly.io Docs](https://fly.io/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com)

---

## 📝 Estructura de Archivos

```
Backend/
├── README.md                    # 📖 Documentación principal
├── FLY_DEPLOY.md               # 🚀 Guía de despliegue Fly.io
├── PRODUCTION_CHECKLIST.md     # ✅ Checklist de producción
├── DOCUMENTACION.md            # 📚 Este archivo (índice)
│
├── fly.toml                    # ⚙️ Config Fly.io
├── Dockerfile                  # 🐳 Docker configuration
├── .dockerignore              # 🚫 Docker ignore
│
├── package.json                # 📦 Dependencias
├── server.js                   # 🚀 Punto de entrada
├── app.js                      # ⚙️ Config Express
│
└── src/                        # 💻 Código fuente
    ├── controllers/
    ├── services/
    ├── routes/
    └── middleware/
```

---

## 🎯 Flujo de Trabajo Recomendado

### 1. Desarrollo Local
1. Leer [README.md](./README.md)
2. Configurar `.env` local
3. Ejecutar `npm install` y `npm run dev`

### 2. Preparación para Producción
1. Revisar [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
2. Ejecutar `npm run verify:production`
3. Verificar todas las variables de entorno

### 3. Despliegue
1. Seguir [FLY_DEPLOY.md](./FLY_DEPLOY.md)
2. Configurar Fly.io
3. Verificar deploy con checklist

### 4. Post-Deploy
1. Verificar health checks
2. Probar endpoints principales
3. Configurar monitoreo

---

## ❓ ¿Necesitas Ayuda?

### Problemas Comunes
- Ver sección **Troubleshooting** en [README.md](./README.md)
- Ver sección **Solución de Problemas** en [FLY_DEPLOY.md](./FLY_DEPLOY.md)

### Preguntas sobre Despliegue
- Consultar [FLY_DEPLOY.md](./FLY_DEPLOY.md)

### Preguntas sobre Configuración
- Consultar [README.md](./README.md) sección Variables de Entorno
- Consultar [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

**Última actualización**: Noviembre 2025  
**Versión Backend**: 2.0.0

