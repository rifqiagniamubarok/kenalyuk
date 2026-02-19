/**
 * User login page
 * /auth/login
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthForm, { AuthInput } from "@/components/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show success message if just verified email
  const successMessage = verified
    ? "Email verified successfully! You can now log in."
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Successful login - redirect to callback URL or home
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome Back"
      subtitle={successMessage || "Sign in to your account"}
      onSubmit={handleSubmit}
      submitText="Sign In"
      loading={loading}
      error={error}
      footerLinks={[
        {
          text: "Don't have an account?",
          linkText: "Sign up",
          href: "/auth/register",
        },
        {
          text: "Need to verify your email?",
          linkText: "Resend verification",
          href: "/auth/verify-email",
        },
      ]}
    >
      <AuthInput
        id="email"
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />

      <AuthInput
        id="password"
        name="password"
        type="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />
    </AuthForm>
  );
}
