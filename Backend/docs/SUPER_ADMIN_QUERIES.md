# Super Admin Database Queries Structure

## Current Implementation ✅

All queries are correctly structured with proper relationships:

### 1. Stores Query (✅ Working)
```sql
SELECT 
  s.id, s.name, s.slug, s.logo, s."isActive", s."isOpen", s."createdAt",
  u.id as "ownerId",        -- User (owner) info
  u.name as "ownerName",
  u.email as "ownerEmail",
  COUNT(DISTINCT p.id) as "productCount",
  COUNT(DISTINCT o.id) as "orderCount",
  COALESCE(SUM(o.total), 0) as "totalRevenue"
FROM "Store" s
  LEFT JOIN "User" u ON s."ownerId" = u.id          -- Link store to owner
  LEFT JOIN "Product" p ON p."ownerId" = u.id       -- Count products
  LEFT JOIN "Order" o ON o."userId" = u.id          -- Count orders
GROUP BY s.id, s.name, s.slug, s.logo, s."isActive", s."isOpen", s."createdAt", u.id, u.name, u.email
```

### 2. Users Query (✅ Working)
```sql
SELECT 
  u.id, u.email, u.name, u.role, u."createdAt",
  s.id as "storeId",        -- Store info for admin users
  s.name as "storeName",
  s.slug as "storeSlug",
  s."isActive" as "storeActive"
FROM "User" u
  LEFT JOIN "Store" s ON s."ownerId" = u.id         -- Link user to their store
```

### 3. Products Query (✅ Working)
```sql
SELECT 
  p.id, p."name", p.description, p.price, p."originalPrice", p.sku, p.stock, p."isActive", p.image, p.category, p."createdAt",
  s.id as "storeId",        -- Store info
  s.name as "storeName",
  s.slug as "storeSlug",
  u.name as "ownerName",    -- Owner info
  u.email as "ownerEmail"
FROM "Product" p
  LEFT JOIN "User" u ON p."ownerId" = u.id          -- Link product to owner
  LEFT JOIN "Store" s ON s."ownerId" = u.id         -- Link owner to store
```

## Relationship Model

```
User (OWNER)
  └── Store (one user can have one store)
       ├── Products (belong to the store owner)
       └── Orders (placed by customers, tracked per store owner)
```

## Key Points

1. **Stores belong to Users**: `s."ownerId" = u.id`
2. **Products belong to Users**: `p."ownerId" = u.id`
3. **Orders belong to Users**: `o."userId" = u.id`
4. **Stores are linked via owner**: User owns Store → Store has Products

## All queries are correctly implemented! ✅

