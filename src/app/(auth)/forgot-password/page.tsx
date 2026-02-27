'use client';

import { FormEvent, useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Link, Divider } from '@nextui-org/react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process forgot password request. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'If an account exists for that email, a password reset link has been sent.');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Kenalyuk</h1>
          <p className="text-text-secondary">Syariah-Compliant Matchmaking</p>
        </div>

        <Card className="w-full">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6">
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <p className="text-sm text-gray-600">Enter your email and we&apos;ll send a reset link</p>
          </CardHeader>

          <CardBody className="px-6 py-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-200">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="px-4 py-3 rounded-lg bg-success-50 border border-success-200">
                  <p className="text-sm text-success-700">{successMessage}</p>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                variant="bordered"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                isRequired
                autoComplete="email"
              />

              <Button type="submit" size="lg" isLoading={loading} className="w-full font-semibold bg-primary hover:bg-primary-dark text-white transition-colors duration-200">
                Send Reset Link
              </Button>
            </form>
          </CardBody>

          <Divider />

          <CardFooter className="flex justify-center px-6 pb-6">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-600">Remember your password?</span>
              <Link href="/login" size="sm" color="secondary">
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}