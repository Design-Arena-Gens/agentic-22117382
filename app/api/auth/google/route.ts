import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For demo purposes, we'll use a mock authentication flow
    // In production, this would integrate with Google OAuth
    const mockAuthUrl = `/api/auth/callback?code=mock_auth_code`;

    return NextResponse.json({
      authUrl: mockAuthUrl,
      message: 'In production, this would redirect to Google OAuth'
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
