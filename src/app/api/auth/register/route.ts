/**
 * User registration API endpoint
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { sendVerificationEmail } from '@/lib/email';
import { UserStatus } from '@prisma/client';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST handler for user registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with PENDING_VERIFICATION status
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        status: UserStatus.PENDING_VERIFICATION,
        role: 'USER', // Default role
      },
    });

    // // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.id);

    if (!emailResult.success) {
      // User created but email failed - return warning
      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully, but verification email could not be sent. Please check your email configuration.',
          userId: user.id,
          emailSent: false,
          emailError: emailResult.message,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        userId: user.id,
        emailSent: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An error occurred during registration. Please try again.' }, { status: 500 });
  }
}
