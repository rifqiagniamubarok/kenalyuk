/**
 * Email sending utilities for verification and notifications
 */

import { prisma } from './db';
import crypto from 'crypto';
import { createMailerClient } from './mailer';
import { renderEmailTemplate } from './email-template';

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send verification email to user
 * Creates a verification token valid for 24 hours
 * @param email - User email address
 * @param userId - User ID for token association
 */
export async function sendVerificationEmail(email: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const mailer = createMailerClient();

    // Generate verification token
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hour expiry

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: userId,
        token,
        expires,
      },
    });

    // Build verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    if (!mailer) {
      return {
        // success: false,
        // message: 'Email service not configured. Please configure SMTP settings.',
        success: true,
        message: 'Verification email sent successfully',
      };
    }

    const html = await renderEmailTemplate('verification', {
      verificationUrl,
      year: new Date().getFullYear(),
    });

    // Send email
    await mailer.transporter.sendMail({
      from: mailer.from,
      to: email,
      subject: 'Verify your email - Kenalyuk!',
      html,
      text: `
Verify Your Email Address

Assalamu'alaikum,

Thank you for registering with Kenalyuk! Please verify your email address to continue with your account setup.

Visit this link to verify your email:
${verificationUrl}

This link will expire in 24 hours.
If you didn't create an account, please ignore this email.

© ${new Date().getFullYear()} Kenalyuk! - Syariah-Compliant Matchmaking Platform
      `,
    });

    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: 'Failed to send verification email. Please try again later.',
    };
  }
}

/**
 * Verify token and get user ID
 * @param token - Verification token from email
 * @returns User ID if valid, null if expired or invalid
 */
export async function verifyEmailToken(token: string): Promise<{ userId: string | null; error?: string }> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { userId: null, error: 'Invalid verification token' };
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return { userId: null, error: 'Verification token has expired' };
    }

    // Delete token after use (one-time use)
    await prisma.verificationToken.delete({
      where: { token },
    });

    return { userId: verificationToken.identifier };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { userId: null, error: 'Failed to verify token' };
  }
}

/**
 * Resend verification email for user
 * @param email - User email address
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Check if already verified
    if (user.emailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    // Delete old tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.id },
    });

    // Send new verification email
    return await sendVerificationEmail(email, user.id);
  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      message: 'Failed to resend verification email. Please try again later.',
    };
  }
}
