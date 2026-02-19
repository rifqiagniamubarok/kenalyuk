/**
 * Supervisor layout wrapper
 * Enforces supervisor authentication and role check
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect to dashboard if not supervisor
  if (session.user.role !== UserRole.SUPERVISOR) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Supervisor Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Kenalyuk! - Supervisor</h1>
            </div>
            <div className="flex items-center gap-4">
              <a href="/supervisor/dashboard" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/supervisor/pending" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                Pending Users
              </a>
              <a href="/supervisor/history" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                History
              </a>
              <div className="border-l pl-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
