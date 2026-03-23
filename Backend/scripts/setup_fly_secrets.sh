#!/bin/bash
#
# Push Fly.io secrets from a local env file (never commit real values).
#
# 1. Copy scripts/env.fly.secrets.example to scripts/.env.fly.secrets
# 2. Fill in real values (scripts/.env.fly.secrets is gitignored)
# 3. Run: bash scripts/setup_fly_secrets.sh
#
# If credentials were ever committed to git, rotate them in Supabase / Google / Fly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_FILE="${SCRIPT_DIR}/.env.fly.secrets"

if ! command -v flyctl &> /dev/null; then
  echo "Error: flyctl is not installed. See https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi

if ! flyctl auth whoami &> /dev/null; then
  echo "Error: not logged in to Fly. Run: flyctl auth login"
  exit 1
fi

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "Missing secrets file: $SECRETS_FILE"
  echo "Copy scripts/env.fly.secrets.example to scripts/.env.fly.secrets and set values."
  exit 1
fi

BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_DIR" || exit 1

APP_NAME="${FLY_APP_NAME:-vendly-checkout-backend}"

echo "Loading secrets from $SECRETS_FILE (not printed)"
# shellcheck disable=SC1090
set -a
source "$SECRETS_FILE"
set +a

required_vars=(
  DATABASE_URL
  DIRECT_URL
  SUPABASE_URL
  SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  FRONTEND_URL
  CORS_ORIGIN
)

for v in "${required_vars[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "Error: $v is not set in $SECRETS_FILE"
    exit 1
  fi
done

echo "Setting secrets on Fly app: $APP_NAME"
FLY_SECRETS=(
  DATABASE_URL="$DATABASE_URL"
  DIRECT_URL="$DIRECT_URL"
  NODE_ENV="${NODE_ENV:-production}"
  PORT="${PORT:-3000}"
  SUPABASE_URL="$SUPABASE_URL"
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
  FRONTEND_URL="$FRONTEND_URL"
  CORS_ORIGIN="$CORS_ORIGIN"
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
)
[[ -n "${SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET:-}" ]] && FLY_SECRETS+=(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="$SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET")
[[ -n "${SUPER_ADMIN_EMAIL:-}" ]] && FLY_SECRETS+=(SUPER_ADMIN_EMAIL="$SUPER_ADMIN_EMAIL")
[[ -n "${SUPER_ADMIN_PASSWORD:-}" ]] && FLY_SECRETS+=(SUPER_ADMIN_PASSWORD="$SUPER_ADMIN_PASSWORD")

flyctl secrets set --app "$APP_NAME" "${FLY_SECRETS[@]}"

echo "Done. Verify with: flyctl secrets list --app $APP_NAME"
