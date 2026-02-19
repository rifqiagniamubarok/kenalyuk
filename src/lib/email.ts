/**
 * Email sending utilities for verification and notifications
 */

import nodemailer from "nodemailer";
import { prisma } from "./db";
import crypto from "crypto";

/**
 * Create nodemailer transporter with SMTP configuration
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    console.warn(
      "Email configuration incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in .env"
    );
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send verification email to user
 * Creates a verification token valid for 24 hours
 * @param email - User email address
 * @param userId - User ID for token association
 */
export async function sendVerificationEmail(
  email: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return {
        success: false,
        message:
          "Email service not configured. Please configure SMTP settings.",
      };
    }

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
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify your email - Kenalyuk!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Kenalyuk!</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Syariah-Compliant Matchmaking</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
              
              <p>Assalamu'alaikum,</p>
              
              <p>Thank you for registering with Kenalyuk! Please verify your email address to continue with your account setup.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This link will expire in 24 hours.<br>
                If you didn't create an account, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© 2026 Kenalyuk! - Syariah-Compliant Matchmaking Platform</p>
            </div>
          </body>
        </html>
      `,
      text: `
Verify Your Email Address

Assalamu'alaikum,

Thank you for registering with Kenalyuk! Please verify your email address to continue with your account setup.

Visit this link to verify your email:
${verificationUrl}

This link will expire in 24 hours.
If you didn't create an account, please ignore this email.

© 2026 Kenalyuk! - Syariah-Compliant Matchmaking Platform
      `,
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email. Please try again later.",
    };
  }
}

/**
 * Verify token and get user ID
 * @param token - Verification token from email
 * @returns User ID if valid, null if expired or invalid
 */
export async function verifyEmailToken(
  token: string
): Promise<{ userId: string | null; error?: string }> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { userId: null, error: "Invalid verification token" };
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return { userId: null, error: "Verification token has expired" };
    }

    // Delete token after use (one-time use)
    await prisma.verificationToken.delete({
      where: { token },
    });

    return { userId: verificationToken.identifier };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { userId: null, error: "Failed to verify token" };
  }
}

/**
 * Resend verification email for user
 * @param email - User email address
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if already verified
    if (user.emailVerified) {
      return { success: false, message: "Email already verified" };
    }

    // Delete old tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.id },
    });

    // Send new verification email
    return await sendVerificationEmail(email, user.id);
  } catch (error) {
    console.error("Error resending verification email:", error);
    return {
      success: false,
      message: "Failed to resend verification email. Please try again later.",
    };
  }
}
