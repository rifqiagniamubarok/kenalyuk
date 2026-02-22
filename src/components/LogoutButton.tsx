/**
 * Logout button component
 * Can be used anywhere in the app to sign out users
 */

'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'default' | 'icon' | 'text';
  className?: string;
}

export default function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  if (variant === 'icon') {
    return (
      <button onClick={handleLogout} className={`p-2 text-gray-600 hover:text-gray-900 transition ${className}`} title="Sign out">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button onClick={handleLogout} className={`text-sm text-gray-600 hover:text-gray-900 transition ${className}`}>
        Sign out
      </button>
    );
  }

  return (
    <button onClick={handleLogout} className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition ${className}`}>
      Sign out
    </button>
  );
}
