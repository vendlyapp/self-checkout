# Supabase migrations — Vendly Checkout

## Setup

```bash
# Install Supabase CLI if needed
npm install -g supabase

# From repo root
cd /path/to/Checkout
supabase init   # already done if supabase/ exists
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Migrations

| File | Purpose |
|------|---------|
| `20250602000001_enable_rls_multi_tenant.sql` | RLS policies for multi-tenant tables |
| `20250602000002_consolidated_indexes.sql` | Performance indexes (from `Backend/src/migrations/`) |
| `20250602000003_add_trgm_indexes.sql` | pg_trgm GIN indexes for product/customer search |

## Run from Backend (recommended)

```bash
cd Backend
npm run db:supabase    # RLS + consolidated indexes + trgm
npm run db:indexes     # Extended performance indexes (idempotent)
```

Legacy ad-hoc scripts remain in `Backend/scripts/` for reference; new schema changes should go here.

## Note on RLS

The Express backend connects with `DATABASE_URL` (often service role / pooler) and bypasses RLS. RLS protects **direct** Supabase client access to Postgres tables.
