/**
 * Biodata API route
 * Handles saving and retrieving user profile information
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Gender, UserStatus } from '@prisma/client';

/**
 * GET /api/biodata - Retrieve current user's biodata
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        gender: true,
        age: true,
        height: true,
        city: true,
        regionId: true,
        education: true,
        occupation: true,
        religionLevel: true,
        aboutMe: true,
        photoUrls: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ biodata: user });
  } catch (error) {
    console.error('Error fetching biodata:', error);
    return NextResponse.json({ error: 'Failed to fetch biodata' }, { status: 500 });
  }
}

/**
 * POST /api/biodata - Save/update user biodata
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const { name, gender, age, height, city, regionId, education, occupation, religionLevel, aboutMe, lookingFor } = body;

    if (!name || !gender || !age || !height || !city || !regionId || !education || !occupation || !religionLevel || !aboutMe) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (typeof aboutMe !== 'string' || aboutMe.trim().length < 5) {
      return NextResponse.json({ error: 'About me must be at least 5 characters' }, { status: 400 });
    }

    // Validate gender
    if (gender !== 'MALE' && gender !== 'FEMALE') {
      return NextResponse.json({ error: 'Invalid gender value' }, { status: 400 });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      return NextResponse.json({ error: 'Age must be between 18 and 100' }, { status: 400 });
    }

    // Validate height
    const heightNum = parseInt(height);
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      return NextResponse.json({ error: 'Height must be between 100 and 250 cm' }, { status: 400 });
    }

    // Verify region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
    }

    // Check if user already has photos uploaded
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { photoUrls: true, status: true },
    });

    // Determine new status
    // If biodata is being updated and user has photos, status should remain or reset to PENDING_APPROVAL
    // Status becomes PENDING_APPROVAL only when BOTH biodata AND photos are complete
    let newStatus = currentUser?.status;

    // If editing profile after rejection or as active user, reset to PENDING_APPROVAL
    if (currentUser?.status === UserStatus.REJECTED || currentUser?.status === UserStatus.ACTIVE) {
      if (currentUser.photoUrls && currentUser.photoUrls.length === 5) {
        newStatus = UserStatus.PENDING_APPROVAL;
      }
    }

    // If user has completed biodata and has exactly 5 photos, set to PENDING_APPROVAL
    if (currentUser?.photoUrls && currentUser.photoUrls.length === 5) {
      newStatus = UserStatus.PENDING_APPROVAL;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        gender: gender as Gender,
        age: ageNum,
        height: heightNum,
        city,
        regionId,
        education,
        occupation,
        religionLevel,
        aboutMe,
        status: newStatus,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Biodata saved successfully',
    });
  } catch (error) {
    console.error('Error saving biodata:', error);
    return NextResponse.json({ error: 'Failed to save biodata' }, { status: 500 });
  }
}
