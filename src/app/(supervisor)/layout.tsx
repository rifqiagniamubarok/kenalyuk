/**
 * Supervisor layout wrapper - sidebar navigation
 * Enforces supervisor authentication and role check
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import SidebarNavigation from '@/components/SidebarNavigation';

const supervisorMenuItems = [
  { label: 'Dashboard', href: '/supervisor/dashboard', icon: '📊' },
  { label: 'Pending Users', href: '/supervisor/pending', icon: '⏳' },
  { label: 'History', href: '/supervisor/history', icon: '📜' },
];

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect to dashboard if not supervisor
  if (session.user?.role !== UserRole.SUPERVISOR) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNavigation user={{ name: session.user.name, email: session.user.email }} menuItems={supervisorMenuItems} role="supervisor" />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
