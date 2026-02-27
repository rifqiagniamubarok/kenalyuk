/**
 * User layout - wraps all user-facing pages
 * Ensures user is authenticated and redirects if not
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Navigation from '@/components/Navigation';
import { prisma } from '@/lib/db';
import { MatchStatus } from '@prisma/client';
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

  const isApprovedUser = session.user.status === 'ACTIVE';
  const chatMenuIndex = userMenuItems.findIndex((item) => item.href === '/chat');
  let chatBadgeCount = 0;

  if (isApprovedUser) {
    const activeMatches = await prisma.match.findMany({
      where: {
        status: MatchStatus.ACTIVE,
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
      },
      select: {
        id: true,
      },
    });

    const matchIds = activeMatches.map((match) => match.id);

    if (matchIds.length > 0) {
      const [unreadCounts, totalMessageCounts] = await Promise.all([
        prisma.message.groupBy({
          by: ['matchId'],
          where: {
            matchId: {
              in: matchIds,
            },
            senderId: {
              not: session.user.id,
            },
            isRead: false,
          },
          _count: {
            _all: true,
          },
        }),
        prisma.message.groupBy({
          by: ['matchId'],
          where: {
            matchId: {
              in: matchIds,
            },
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      const unreadMessageTotal = unreadCounts.reduce((sum, item) => sum + item._count._all, 0);
      const newMatchesWithoutMessages = matchIds.length - totalMessageCounts.length;
      chatBadgeCount = unreadMessageTotal + newMatchesWithoutMessages;
    }
  }

  const menuItemsWithBadges = userMenuItems.map((item, index) => {
    if (index !== chatMenuIndex || chatBadgeCount <= 0) {
      return item;
    }

    return {
      ...item,
      badgeCount: chatBadgeCount,
    };
  });

  const visibleMenuItems = isApprovedUser ? menuItemsWithBadges : [menuItemsWithBadges[0]];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation menuItems={visibleMenuItems} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
