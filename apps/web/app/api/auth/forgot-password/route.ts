import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await AuthService.requestPasswordReset(email);

    // Send email with reset code (in production)
    if (result.code && process.env.EMAIL_SERVICE === 'enabled') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or your email service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@meetsync.com',
          to: email,
          subject: 'Reset your MeetSync password',
          html: `
            <h1>Password Reset</h1>
            <p>Your password reset code is:</p>
            <h2>${result.code}</h2>
            <p>This code expires in 1 hour.</p>
            <p>If you didn't request this, ignore this email.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    // Return safe response (don't expose code in production)
    return NextResponse.json({
      success: true,
      message: 'If email exists, password reset code has been sent',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
