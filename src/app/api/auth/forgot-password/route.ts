import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPasswordResetToken, sendPasswordResetEmail } from '@/lib/password-reset';

const GENERIC_SUCCESS_MESSAGE = 'If an account exists for that email, a password reset link has been sent.';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (user) {
      const { token } = await createPasswordResetToken(user.id);
      const emailResult = await sendPasswordResetEmail(user.email, token);

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: GENERIC_SUCCESS_MESSAGE,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: true,
        message: GENERIC_SUCCESS_MESSAGE,
      },
      { status: 200 },
    );
  }
}
