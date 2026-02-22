/**
 * Passes API route
 * Handles pass actions to skip profiles
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';

/**
 * POST /api/passes - Create a pass record
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ACTIVE
    if (session.user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ error: 'Account must be active to pass on profiles' }, { status: 403 });
    }

    const body = await request.json();
    const { passedUserId } = body;

    if (!passedUserId) {
      return NextResponse.json({ error: 'passedUserId is required' }, { status: 400 });
    }

    const userId = session.user.id;

    // Validate: can't pass yourself
    if (userId === passedUserId) {
      return NextResponse.json({ error: 'Cannot pass yourself' }, { status: 400 });
    }

    // Validate: passed user exists
    const passedUser = await prisma.user.findUnique({
      where: { id: passedUserId },
      select: { id: true },
    });

    if (!passedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already passed
    const existingPass = await prisma.pass.findUnique({
      where: {
        userId_passedUserId: {
          userId,
          passedUserId,
        },
      },
    });

    if (existingPass) {
      return NextResponse.json({ error: 'You have already passed this user' }, { status: 400 });
    }

    // Create pass record
    await prisma.pass.create({
      data: {
        userId,
        passedUserId,
      },
    });

    return NextResponse.json({ passed: true });
  } catch (error) {
    console.error('Pass API error:', error);
    return NextResponse.json({ error: 'Failed to process pass' }, { status: 500 });
  }
}
