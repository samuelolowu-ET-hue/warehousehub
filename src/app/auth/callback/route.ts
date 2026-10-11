import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || errorDescription) {
    const message = encodeURIComponent(errorDescription || error || 'Authentication failed');
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    const message = encodeURIComponent(exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  return NextResponse.redirect(`${origin}/`);
}
