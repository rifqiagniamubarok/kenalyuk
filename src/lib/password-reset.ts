import crypto from 'crypto';
import { prisma } from './db';
import { createMailerClient } from './mailer';
import { renderEmailTemplate } from './email-template';

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.upsert({
    where: { userId },
    update: {
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    },
    create: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function validatePasswordResetToken(token: string): Promise<{ userId: string } | null> {
  const tokenHash = hashPasswordResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  });

  if (!resetToken) {
    return null;
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return null;
  }

  return { userId: resetToken.userId };
}

export async function invalidatePasswordResetToken(token: string): Promise<void> {
  const tokenHash = hashPasswordResetToken(token);
  await prisma.passwordResetToken.deleteMany({
    where: { tokenHash },
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const mailer = createMailerClient();

    if (!mailer) {
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const currentYear = new Date().getFullYear();

    const html = await renderEmailTemplate('reset-password', {
      resetUrl,
      year: currentYear,
    });

    await mailer.transporter.sendMail({
      from: mailer.from,
      to: email,
      subject: 'Reset your password - Kenalyuk!',
      html,
      text: `
Reset Your Password

Assalamu'alaikum,

We received a request to reset your Kenalyuk account password.

Open this link to set a new password:
${resetUrl}

This link expires in 1 hour and can only be used once.
If you did not request this reset, please ignore this email.

© ${currentYear} Kenalyuk! - Syariah-Compliant Matchmaking Platform
      `,
    });

    return {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: 'Failed to send password reset email',
    };
  }
}
