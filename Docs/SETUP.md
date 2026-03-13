# Vendly Checkout - Setup

## Backend

```bash
cd Backend
npm install
node scripts/run_multi_tenant_migration.js
npm run dev
```

**Variables de entorno (.env):**
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL
- FRONTEND_URL
- PORT

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

**Variables de entorno (.env.local):**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_GOOGLE_CLIENT_ID

## Google OAuth

1. Google Cloud Console → Crear proyecto
2. OAuth 2.0 Client ID → Web application
3. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://[PROJECT].supabase.co/auth/v1/callback`
4. Copiar Client ID → Supabase Dashboard
5. Habilitar Google provider en Supabase

## Sistema Multi-Tenant

- Cada admin → 1 tienda automática
- Cada tienda → QR único
- Productos filtrados por ownerId
- Carritos independientes por tienda

