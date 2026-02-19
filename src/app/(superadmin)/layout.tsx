/**
 * Superadmin layout - navigation and structure for superadmin pages
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/superadmin/dashboard" className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Kenalyuk!
                </h1>
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">SUPERADMIN</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/superadmin/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/superadmin/regions"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Regions
                </Link>
                <Link
                  href="/superadmin/supervisors"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  Supervisors
                </Link>
              </nav>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
