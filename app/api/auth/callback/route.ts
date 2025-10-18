import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  // In production, exchange code for tokens and store in session/cookie
  // For demo, we'll just redirect back
  return NextResponse.redirect(new URL('/?authenticated=true', request.url));
}
