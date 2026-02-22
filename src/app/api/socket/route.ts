/**
 * Server-Sent Events (SSE) API route
 * Provides real-time updates for messages
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';

/**
 * GET /api/socket - SSE endpoint for real-time message updates
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Account must be active' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();
    let lastChecked = new Date();

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
        );

        // Polling interval for new messages
        const interval = setInterval(async () => {
          try {
            // Get user's matches
            const matches = await prisma.match.findMany({
              where: {
                OR: [{ user1Id: userId }, { user2Id: userId }],
              },
              select: {
                id: true,
              },
            });

            const matchIds = matches.map((m) => m.id);

            // Check for new messages since last check
            const newMessages = await prisma.message.findMany({
              where: {
                matchId: { in: matchIds },
                senderId: { not: userId }, // Only messages from other users
                createdAt: { gt: lastChecked },
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    photoUrls: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            });

            // Send each new message as SSE event
            for (const message of newMessages) {
              const data = {
                type: 'message',
                matchId: message.matchId,
                message,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            }

            // Update last checked timestamp
            if (newMessages.length > 0) {
              lastChecked = new Date();
            }

            // Send heartbeat ping every cycle
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`)
            );
          } catch (error) {
            console.error('Error in SSE polling:', error);
          }
        }, 2000); // Poll every 2 seconds

        // Cleanup on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    // Return SSE stream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return NextResponse.json(
      { error: 'Failed to establish connection' },
      { status: 500 }
    );
  }
}
