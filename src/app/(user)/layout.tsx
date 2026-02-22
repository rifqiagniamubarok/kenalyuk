/**
 * User layout - wraps all user-facing pages
 * Ensures user is authenticated and redirects if not
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Navigation from '@/components/Navigation';

// User navigation menu items
// Note: Chat rooms are accessed via /matches page (no separate Chat menu item)
// Each match card has a "Chat" button linking to /chat/[matchId]
const userMenuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'Discovery', href: '/discovery', icon: '💕' },
  { label: 'Matches', href: '/matches', icon: '👥' },
  { label: 'Likes', href: '/likes', icon: '🕐' },
  { label: 'My Biodata', href: '/biodata', icon: '📝' },
  { label: 'Photos', href: '/photos', icon: '📸' },
];

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect('/login');
  }

  // Only allow regular users (not supervisors or superadmins)
  if (session.user?.role !== 'USER') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: session.user.name, email: session.user.email }} menuItems={userMenuItems} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
