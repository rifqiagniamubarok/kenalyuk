/**
 * Discovery API route
 * Returns filtered profiles for the discovery feed
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';
import { buildDiscoveryFilters, getExcludedUserIds } from '@/lib/discovery';

/**
 * GET /api/discovery - Get filtered profiles for discovery feed
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
        { error: 'Account must be active to view discovery feed' },
        { status: 403 }
      );
    }

    // Get current user's profile data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        gender: true,
        age: true,
        regionId: true,
      },
    });

    if (!currentUser || !currentUser.gender || !currentUser.age || !currentUser.regionId) {
      return NextResponse.json(
        { error: 'Please complete your biodata first' },
        { status: 400 }
      );
    }

    // Build filters based on user preferences
    const filters = buildDiscoveryFilters(
      currentUser.gender,
      currentUser.age,
      currentUser.regionId
    );

    // Get excluded user IDs (already liked/passed)
    const excludedIds = await getExcludedUserIds(session.user.id);

    // Query profiles with filters
    const profiles = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        gender: filters.gender,
        age: {
          gte: filters.minAge,
          lte: filters.maxAge,
        },
        regionId: filters.regionId,
        status: UserStatus.ACTIVE,
        // Ensure user has completed biodata
        name: { not: null },
      },
      select: {
        id: true,
        name: true,
        age: true,
        height: true,
        city: true,
        education: true,
        occupation: true,
        religionLevel: true,
        aboutMe: true,
        photoUrls: true,
        region: {
          select: {
            name: true,
          },
        },
      },
      take: 20,
    });

    // Randomize order
    const shuffled = profiles.sort(() => Math.random() - 0.5);

    // Format response
    const formattedProfiles = shuffled.map((profile) => ({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      height: profile.height,
      city: profile.city,
      region: profile.region?.name || '',
      education: profile.education,
      occupation: profile.occupation,
      religionLevel: profile.religionLevel,
      about: profile.aboutMe,
      photos: profile.photoUrls || [],
    }));

    return NextResponse.json({ profiles: formattedProfiles });
  } catch (error) {
    console.error('Error fetching discovery profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discovery profiles' },
      { status: 500 }
    );
  }
}
