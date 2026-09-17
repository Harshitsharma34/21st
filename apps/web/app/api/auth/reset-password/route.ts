import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, reset code, and new password are required' },
        { status: 400 }
      );
    }

    const result = await AuthService.resetPassword(email, code, newPassword);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
