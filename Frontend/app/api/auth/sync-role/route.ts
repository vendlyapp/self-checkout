import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ROLE_COOKIE } from '@/lib/supabase/middleware';
import { buildApiUrl } from '@/lib/config/api';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  let role = session.user?.user_metadata?.role as string | undefined;

  try {
    const res = await fetch(buildApiUrl('/api/auth/profile'), {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      role = json?.data?.user?.role ?? json?.data?.role ?? role;
    }
  } catch {
    // fallback to metadata
  }

  const effectiveRole = typeof role === 'string' && role ? role : 'ADMIN';
  const cookieStore = await cookies();
  cookieStore.set(ROLE_COOKIE, effectiveRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true, role: effectiveRole });
}
