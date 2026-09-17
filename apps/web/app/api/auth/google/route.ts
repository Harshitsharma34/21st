import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';
import { jwtDecode } from 'jwt-decode';

interface GoogleToken {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Decode and verify Google token (in production, verify with Google API)
    const decoded = jwtDecode<GoogleToken>(idToken);

    if (!decoded.sub || !decoded.email) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    const result = await AuthService.loginGoogle(
      decoded.sub,
      decoded.email,
      decoded.name
    );

    const response = NextResponse.json(result);
    response.cookies.set('auth_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google login failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
