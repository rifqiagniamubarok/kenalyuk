/**
 * Email verification API endpoint
 * POST /api/auth/verify-email
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyEmailToken, resendVerificationEmail } from "@/lib/email";
import { UserStatus } from "@prisma/client";

/**
 * POST handler for email verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    // Handle resend verification email
    if (action === "resend") {
      const { email } = body;

      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      const result = await resendVerificationEmail(email);

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Verification email sent successfully",
      });
    }

    // Handle email verification
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify token
    const { userId, error } = await verifyEmailToken(token);

    if (error || !userId) {
      return NextResponse.json(
        { error: error || "Invalid verification token" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email already verified",
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Update user - mark email as verified and change status to PENDING_APPROVAL
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        status: UserStatus.PENDING_APPROVAL,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Email verified successfully! Your account is now pending approval from a supervisor.",
        nextStep: "biodata",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification. Please try again." },
      { status: 500 }
    );
  }
}
