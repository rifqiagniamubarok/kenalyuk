import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { hashPasswordResetToken } from '@/lib/password-reset';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Token, new password, and confirm password are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const hashedPassword = await hashPassword(newPassword);

    const result = await prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.passwordResetToken.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
        },
      });

      if (!resetToken) {
        return { status: 400, error: 'Invalid or expired password reset token' };
      }

      if (resetToken.expiresAt < new Date()) {
        await transaction.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
        return { status: 400, error: 'Invalid or expired password reset token' };
      }

      await transaction.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
        },
      });

      await transaction.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return { status: 200 };
    });

    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
