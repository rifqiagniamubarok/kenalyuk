/**
 * Superadmin layout - sidebar navigation and structure for superadmin pages
 */

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import SidebarNavigation from '@/components/SidebarNavigation';

const superadminMenuItems = [
  { label: 'Dashboard', href: '/superadmin/dashboard', icon: '📊' },
  { label: 'Regions', href: '/superadmin/regions', icon: '🌍' },
  { label: 'Supervisors', href: '/superadmin/supervisors', icon: '👮' },
];

export default async function SuperadminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect to dashboard if not superadmin
  if (session.user?.role !== UserRole.SUPERADMIN) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNavigation user={{ name: session.user.name, email: session.user.email }} menuItems={superadminMenuItems} role="superadmin" />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
