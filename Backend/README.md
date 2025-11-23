# Vendly Checkout Backend API

Backend API para el sistema de checkout de Vendly.

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` con las siguientes variables:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Scripts Disponibles

```bash
npm start              # Iniciar servidor
npm run dev            # Desarrollo con nodemon
npm run verify:production  # Verificar configuración
npm run db:setup       # Configurar base de datos
```

## API Endpoints

- Documentación Swagger: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`

## Estructura

```
Backend/
├── src/
│   ├── controllers/   # Controladores
│   ├── services/      # Lógica de negocio
│   ├── routes/        # Rutas
│   └── middleware/    # Middlewares
├── lib/               # Utilidades (DB, Supabase)
├── config/            # Configuración
└── scripts/           # Scripts de utilidad
```
