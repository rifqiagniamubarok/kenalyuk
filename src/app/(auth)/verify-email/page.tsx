/**
 * Email verification page
 * /auth/verify-email
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type VerificationState =
  | "verifying"
  | "success"
  | "error"
  | "expired"
  | "already-verified"
  | "awaiting";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const registered = searchParams.get("registered");

  const [state, setState] = useState<VerificationState>(
    token ? "verifying" : "awaiting"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  // Verify email on mount if token is present
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("expired")) {
          setState("expired");
          setMessage(data.error);
        } else {
          setState("error");
          setMessage(data.error || "Verification failed");
        }
        return;
      }

      if (data.alreadyVerified) {
        setState("already-verified");
        setMessage(data.message);
      } else {
        setState("success");
        setMessage(data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 3000);
      }
    } catch (err) {
      setState("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    setResending(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "resend", email }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to resend email");
        setResending(false);
        return;
      }

      alert("Verification email sent! Please check your inbox.");
      setEmail("");
      setResending(false);
    } catch (err) {
      alert("An unexpected error occurred. Please try again.");
      setResending(false);
    }
  };

  // Success state
  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500 mb-6">
            You can now log in and complete your profile.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition"
          >
            Continue to Login
          </Link>
          <p className="mt-4 text-xs text-gray-500">Redirecting in 3 seconds...</p>
        </div>
      </div>
    );
  }

  // Already verified state
  if (state === "already-verified") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Already Verified
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/auth/login"
            className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  // Verifying state
  if (state === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Email...
          </h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  // Error or expired state
  if (state === "error" || state === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {state === "expired" ? "Link Expired" : "Verification Failed"}
          </h2>
          <p className="text-gray-600 mb-6 text-center">{message}</p>

          {/* Resend form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resend Verification Email
            </h3>
            <form onSubmit={handleResendEmail} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
              />
              <button
                type="submit"
                disabled={resending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Resend Email"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link
              href="/auth/register"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Back to Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Awaiting verification (just registered)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Check Your Email
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          {registered
            ? "We've sent a verification link to your email address. Please click the link to verify your account."
            : "Enter your email below to receive a new verification link."}
        </p>

        {/* Resend form */}
        <form onSubmit={handleResendEmail} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
          />
          <button
            type="submit"
            disabled={resending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : "Send Verification Email"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link
            href="/auth/login"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
