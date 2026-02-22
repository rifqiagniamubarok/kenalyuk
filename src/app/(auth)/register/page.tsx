/**
 * User registration page with Hero UI
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Link, Divider } from '@nextui-org/react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      if (!data.emailSent) {
        setError('Account created, but verification email could not be sent. Please contact support.');
      }

      setTimeout(() => {
        router.push('/verify-email?registered=true');
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 px-4 py-12">
        <Card className="max-w-md w-full text-center">
          <CardBody className="py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500">Please check your inbox and click the verification link to activate your account.</p>
            {error && (
              <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-sm text-warning-800">{error}</p>
              </div>
            )}
            <div className="mt-6 text-sm text-gray-500">Redirecting to verification page...</div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Kenalyuk!</h1>
          <p className="text-gray-600">Syariah-Compliant Matchmaking</p>
        </div>

        <Card className="w-full">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-sm text-gray-600">Join our Syariah-compliant community</p>
          </CardHeader>

          <CardBody className="px-6 py-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-200">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                variant="bordered"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                isRequired
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                variant="bordered"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                description="At least 8 characters with uppercase, lowercase, and number"
                isRequired
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                type="password"
                variant="bordered"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                isRequired
                autoComplete="new-password"
              />

              <Button type="submit" color="secondary" size="lg" isLoading={loading} className="w-full font-semibold">
                Create Account
              </Button>
            </form>

            <p className="mt-4 text-xs text-gray-500 text-center">By creating an account, you agree to our syariah-compliant guidelines and community standards</p>
          </CardBody>

          <Divider />

          <CardFooter className="flex justify-center px-6 pb-6">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-600">Already have an account?</span>
              <Link href="/login" size="sm" color="secondary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
