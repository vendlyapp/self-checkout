-- Migration: Add SUPER_ADMIN role to UserRole enum
-- Description: Adds SUPER_ADMIN role for platform administrators who manage all stores
-- Author: System
-- Date: 2024

-- Add SUPER_ADMIN to the UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Add comment to document the role
COMMENT ON TYPE "UserRole" IS 'User roles: CUSTOMER (store customers), ADMIN (store owners), SUPER_ADMIN (platform administrators)';

