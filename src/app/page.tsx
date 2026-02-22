import Link from 'next/link';
import { auth } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-5xl w-full">
        {/* Header with Auth Actions */}
        <div className="flex justify-end mb-8">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">Welcome, {session.user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="px-6 py-3 text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-all duration-200">
                Sign In
              </Link>
              <Link href="/register" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <h1 className="text-5xl font-bold text-center mb-4 text-text-primary">Kenalyuk</h1>
        <p className="text-center text-text-secondary mb-12 text-lg">Calm, Respectful, Syariah-Compliant Matchmaking</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card card-hover">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text-primary">Thoughtful Experience</h2>
            <p className="text-sm text-text-secondary">Intuitive interface for discovering marriage-minded profiles with care and respect</p>
          </div>
          <div className="card card-hover">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text-primary">Regional Supervision</h2>
            <p className="text-sm text-text-secondary">Local supervisors ensure syariah-compliant interactions and serious intentions</p>
          </div>
          <div className="card card-hover">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text-primary">Trust Network</h2>
            <p className="text-sm text-text-secondary">Build meaningful connections with profiles approved by your regional community</p>
          </div>
        </div>

        {!session && (
          <div className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-primary text-white text-lg font-medium rounded-md hover:bg-primary-dark transition-colors duration-200"
            >
              Get Started Today
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
