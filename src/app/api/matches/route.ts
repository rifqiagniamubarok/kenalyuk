/**
 * Matches API route
 * Returns list of active matches for current user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus, MatchStatus } from '@prisma/client';

/**
 * GET /api/matches - Get current user's matches
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Account must be active to view matches' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Find matches where current user is either user1 or user2
    const matches = await prisma.match.findMany({
      where: {
        status: MatchStatus.ACTIVE,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            age: true,
            city: true,
            photoUrls: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            age: true,
            city: true,
            photoUrls: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const matchIds = matches.map((match) => match.id);

    const [unreadCounts, totalMessageCounts] = await Promise.all([
      matchIds.length > 0
        ? prisma.message.groupBy({
            by: ['matchId'],
            where: {
              matchId: {
                in: matchIds,
              },
              senderId: {
                not: userId,
              },
              isRead: false,
            },
            _count: {
              _all: true,
            },
          })
        : Promise.resolve([]),
      matchIds.length > 0
        ? prisma.message.groupBy({
            by: ['matchId'],
            where: {
              matchId: {
                in: matchIds,
              },
            },
            _count: {
              _all: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const unreadCountByMatchId = unreadCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.matchId] = item._count._all;
      return acc;
    }, {});

    const totalMessageCountByMatchId = totalMessageCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.matchId] = item._count._all;
      return acc;
    }, {});

    const latestMessagesByMatchId = await Promise.all(
      matches.map(async (match) => {
        const latestMessage = await prisma.message.findFirst({
          where: {
            matchId: match.id,
          },
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          matchId: match.id,
          latestMessage,
        };
      }),
    );

    const lastMessageByMatchId = latestMessagesByMatchId.reduce<
      Record<string, { content: string; createdAt: Date; senderId: string } | null>
    >((acc, item) => {
      acc[item.matchId] = item.latestMessage;
      return acc;
    }, {});

    // Transform matches to include the matched user (not current user)
    const formattedMatches = matches.map((match) => {
      const matchedUser = match.user1Id === userId ? match.user2 : match.user1;
      const unreadCount = unreadCountByMatchId[match.id] ?? 0;
      const totalMessageCount = totalMessageCountByMatchId[match.id] ?? 0;
      const hasNoMessages = totalMessageCount === 0;
      const lastMessage = lastMessageByMatchId[match.id] ?? null;
      
      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          age: matchedUser.age,
          city: matchedUser.city,
          region: matchedUser.region?.name || '',
          photos: matchedUser.photoUrls,
        },
        unreadCount,
        hasNoMessages,
        lastMessage,
      };
    });

    const totalUnreadCount = unreadCounts.reduce((sum, item) => sum + item._count._all, 0);
    const newMatchesWithoutMessages = matches.length - totalMessageCounts.length;
    const chatTabCount = totalUnreadCount + newMatchesWithoutMessages;

    return NextResponse.json({
      matches: formattedMatches,
      summary: {
        totalUnreadCount,
        newMatchesWithoutMessages,
        chatTabCount,
      },
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
