import { NextResponse, type NextRequest } from 'next/server';
import {
  clearRoleCookie,
  resolveUserRole,
  setRoleCookie,
  updateSession,
} from '@/lib/supabase/middleware';

/** Admin store paths: /store/settings — not buyer /store/:slug */
const ADMIN_STORE_SEGMENTS = new Set([
  'settings',
  'profile',
  'customers',
  'discounts',
  'payment-methods',
  'notifications',
  'invoice',
  'qr-barcodes',
  'printer',
  'backups',
  'help',
]);

const ADMIN_ONLY_PREFIXES = [
  '/dashboard',
  '/products',
  '/my-qr',
  '/sales',
  '/charge',
  '/products_list',
  '/categories',
];

const SUPER_ADMIN_PREFIX = '/super-admin';

function isPublicPath(pathname: string): boolean {
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/check-email') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/scan') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/invoice/public/') ||
    pathname.startsWith('/~offline')
  ) {
    return true;
  }
  return isBuyerStorefront(pathname);
}

function isBuyerStorefront(pathname: string): boolean {
  if (!pathname.startsWith('/store/')) return false;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return false;
  const segment = parts[1];
  return !ADMIN_STORE_SEGMENTS.has(segment);
}

function requiresAdmin(pathname: string): boolean {
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname === '/store') return true;
  if (pathname.startsWith('/store/')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && ADMIN_STORE_SEGMENTS.has(parts[1])) return true;
  }
  return false;
}

function requiresSuperAdmin(pathname: string): boolean {
  return pathname === SUPER_ADMIN_PREFIX || pathname.startsWith(`${SUPER_ADMIN_PREFIX}/`);
}

function loginRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  const needsAdmin = requiresAdmin(pathname);
  const needsSuperAdmin = requiresSuperAdmin(pathname);

  if (!needsAdmin && !needsSuperAdmin) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  const sessionResult = await updateSession(request);
  const { supabaseResponse, user } = sessionResult;

  if (!user) {
    clearRoleCookie(supabaseResponse);
    return loginRedirect(request);
  }

  const role = await resolveUserRole(request, user, sessionResult.session?.access_token);
  const effectiveRole = role || 'ADMIN';

  if (needsSuperAdmin) {
    if (effectiveRole !== 'SUPER_ADMIN') {
      return loginRedirect(request);
    }
  } else if (needsAdmin) {
    if (effectiveRole !== 'ADMIN' && effectiveRole !== 'SUPER_ADMIN') {
      return loginRedirect(request);
    }
  }

  setRoleCookie(supabaseResponse, effectiveRole);
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
