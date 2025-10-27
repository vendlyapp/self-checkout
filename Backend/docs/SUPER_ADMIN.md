# Super Admin System

Complete system for platform administrator to manage all stores, users, and products.

## Features

- View platform-wide statistics
- Manage all stores (activate/deactivate)
- View all users and their roles
- View all products across all stores
- Search and filter functionality

## API Endpoints

All endpoints require authentication with `SUPER_ADMIN` role:

- `GET /api/super-admin/stats` - Platform statistics
- `GET /api/super-admin/stores` - List all stores
- `GET /api/super-admin/users` - List all users
- `GET /api/super-admin/products` - List all products
- `GET /api/super-admin/stores/:id` - Store details
- `PUT /api/super-admin/stores/:id/status` - Toggle store status

## Setup

### 1. Create Super Admin User

```bash
cd Backend
node scripts/create_super_admin.js
```

### 2. Login

- Email: `superadmin@vendly.ch`
- Password: `SuperAdmin123!`

### 3. Access Dashboard

```
http://localhost:3000/super-admin/dashboard
```

## Architecture

### Backend
- **Service**: `src/services/SuperAdminService.js`
- **Controller**: `src/controllers/SuperAdminController.js`
- **Routes**: `src/routes/superAdminRoutes.js`

### Frontend
- **Service**: `lib/services/superAdminService.ts`
- **Store**: `lib/stores/superAdminStore.ts` (Zustand with 5min cache)
- **Pages**: 
  - `/super-admin/dashboard` - Statistics overview
  - `/super-admin/stores` - Store management
  - `/super-admin/users` - User management
  - `/super-admin/products` - Product overview

## Cache System

Zustand store implements 5-minute cache to reduce API calls:
- Automatic cache invalidation
- Manual refresh available
- Loading states only when no cached data
- Smooth navigation between pages

## Role Hierarchy

```
SUPER_ADMIN → Manage entire platform
ADMIN → Manage their own store
CUSTOMER → Browse and purchase
```

