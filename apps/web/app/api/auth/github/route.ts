import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';

interface GitHubUserResponse {
  id: number;
  login: string;
  email: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to exchange code for token');
    }

    // Fetch user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData: GitHubUserResponse = await userResponse.json();

    if (!userData.id || !userData.email) {
      throw new Error('Failed to fetch user info');
    }

    const result = await AuthService.loginGitHub(
      userData.id.toString(),
      userData.email,
      userData.login
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
    const message = error instanceof Error ? error.message : 'GitHub login failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
