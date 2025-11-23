#!/bin/bash

# Script para configurar variables de entorno en Fly.io
# Ejecuta: bash scripts/setup_fly_secrets.sh

echo "🚀 Configurando variables de entorno en Fly.io..."
echo ""

# Verificar que flyctl esté instalado
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl no está instalado"
    echo "   Instala desde: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Verificar que estés autenticado
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Error: No estás autenticado en Fly.io"
    echo "   Ejecuta: flyctl auth login"
    exit 1
fi

echo "✅ flyctl verificado"
echo ""

# Cambiar al directorio del backend (donde está fly.toml)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_DIR" || exit 1

# Verificar si la app existe, si no, crearla
APP_NAME="vendly-checkout-backend"
echo "🔍 Verificando si la app '$APP_NAME' existe..."

# Intentar verificar si la app existe
if flyctl apps show "$APP_NAME" &>/dev/null; then
    echo "✅ App '$APP_NAME' encontrada"
    echo ""
else
    echo "⚠️  La app '$APP_NAME' no existe en Fly.io"
    echo "📦 Creando la app..."
    echo ""
    
    # Crear la app
    if flyctl apps create "$APP_NAME" 2>&1; then
        echo ""
        echo "✅ App creada exitosamente"
        echo ""
    else
        echo ""
        echo "❌ Error al crear la app"
        echo ""
        echo "💡 Intenta manualmente:"
        echo "   cd Backend"
        echo "   flyctl apps create $APP_NAME"
        echo ""
        echo "   O si ya tienes una app, verifica el nombre en fly.toml"
        exit 1
    fi
fi

# Variables de entorno - TODAS como secrets (más seguro)
echo "📝 Configurando secrets en Fly.io para la app '$APP_NAME'..."
echo ""

flyctl secrets set --app "$APP_NAME" \
  DATABASE_URL="postgresql://postgres.dkkvxzigqqvolbyeybgr:BmvKhmXieYSKcu9F@aws-1-eu-central-2.pooler.supabase.com:6543/postgres" \
  DIRECT_URL="postgresql://postgres.dkkvxzigqqvolbyeybgr:BmvKhmXieYSKcu9F@aws-1-eu-central-2.pooler.supabase.com:5432/postgres" \
  NODE_ENV="production" \
  PORT="3000" \
  SUPABASE_URL="https://dkkvxzigqqvolbyeybgr.supabase.co" \
  SUPABASE_ANON_KEY="sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv" \
  FRONTEND_URL="https://self-checkout-kappa.vercel.app" \
  CORS_ORIGIN="https://self-checkout-kappa.vercel.app" \
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="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" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRra3Z4emlncXF2b2xieWV5YmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ4NjcyMiwiZXhwIjoyMDc0MDYyNzIyfQ.fC0kC7or1a1BF6VDr_KwBlymZN7rN5RBu-VJxwUg7Hg" \
  SUPER_ADMIN_EMAIL="admin@vendly.co" \
  SUPER_ADMIN_PASSWORD="SuperAdmin123!"

echo ""
echo "✅ Variables de entorno configuradas exitosamente!"
echo ""
echo "📋 Para verificar los secrets configurados:"
echo "   flyctl secrets list"
echo ""
echo "🚀 Para desplegar:"
echo "   flyctl deploy"
echo ""

