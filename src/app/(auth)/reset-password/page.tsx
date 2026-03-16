'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Link, Divider } from '@nextui-org/react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }

    if (passwordsMismatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Password has been reset successfully. You can now sign in.');
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
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="text-sm text-gray-600">Set a new password for your account</p>
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
                label="New Password"
                type="password"
                variant="bordered"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter your new password"
                description="At least 8 characters with uppercase, lowercase, and number"
                isRequired
                autoComplete="new-password"
              />

              <Input
                label="Confirm New Password"
                type="password"
                variant="bordered"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your new password"
                isRequired
                autoComplete="new-password"
                isInvalid={passwordsMismatch}
                errorMessage={passwordsMismatch ? 'Passwords do not match' : undefined}
              />

              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                isDisabled={passwordsMismatch || !token || successMessage.length > 0}
                className="w-full font-semibold bg-primary hover:bg-primary-dark text-white transition-colors duration-200"
              >
                Reset Password
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
