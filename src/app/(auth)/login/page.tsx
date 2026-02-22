/**
 * Login page with Hero UI components
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Link, Divider } from '@nextui-org/react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Fetch session to get user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        // Redirect based on role
        if (session?.user?.role === 'SUPERADMIN') {
          router.push('/superadmin/dashboard');
        } else if (session?.user?.role === 'SUPERVISOR') {
          router.push('/supervisor/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            {verified ? <p className="text-sm text-success">Email verified successfully! You can now log in.</p> : <p className="text-sm text-gray-600">Sign in to your account</p>}
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
                isRequired
                autoComplete="current-password"
              />

              <Button type="submit" size="lg" isLoading={loading} className="w-full font-semibold bg-primary hover:bg-primary-dark text-white transition-colors duration-200">
                Sign In
              </Button>
            </form>
          </CardBody>

          <Divider />

          <CardFooter className="flex flex-col gap-2 px-6 pb-6">
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-text-secondary">Don't have an account?</span>
              <Link href="/register" size="sm" className="text-primary hover:text-primary-dark">
                Sign up
              </Link>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-text-secondary">Need to verify your email?</span>
              <Link href="/verify-email" size="sm" className="text-primary hover:text-primary-dark">
                Resend verification
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
