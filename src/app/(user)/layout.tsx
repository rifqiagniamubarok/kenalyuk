/**
 * User layout - wraps all user-facing pages
 * Ensures user is authenticated and redirects if not
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Navigation from '@/components/Navigation';
import { Heart, MessageCircle, User } from 'lucide-react';

// User navigation menu items
const userMenuItems = [
  { label: 'Profile', href: '/profile', icon: <User className="w-5 h-5 text-current" /> },
  { label: 'Discovery', href: '/discovery', icon: <Heart className="w-5 h-5 text-current" /> },
  { label: 'Chat', href: '/chat', icon: <MessageCircle className="w-5 h-5 text-current" /> },
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
