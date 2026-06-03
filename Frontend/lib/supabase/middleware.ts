import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ROLE_COOKIE = 'vendly-user-role';

export function getRoleFromCookie(request: NextRequest): string | null {
  return request.cookies.get(ROLE_COOKIE)?.value ?? null;
}

export function setRoleCookie(response: NextResponse, role: string) {
  response.cookies.set(ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearRoleCookie(response: NextResponse) {
  response.cookies.delete(ROLE_COOKIE);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabaseResponse, user: null, session: null, supabase: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { supabaseResponse, user, session, supabase };
}

export async function resolveUserRole(
  request: NextRequest,
  user: { user_metadata?: Record<string, unknown> } | null,
  accessToken?: string
): Promise<string | null> {
  const cookieRole = getRoleFromCookie(request);
  if (cookieRole) return cookieRole;

  const metaRole = user?.user_metadata?.role;
  if (typeof metaRole === 'string' && metaRole) return metaRole;

  if (!accessToken) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.user?.role ?? json?.data?.role ?? null;
  } catch {
    return null;
  }
}

export { ROLE_COOKIE };
