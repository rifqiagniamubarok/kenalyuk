/**
 * File upload API endpoint
 * Handles photo uploads with validation and storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveUploadedFile, generateUniqueFilename, validateFileBuffer } from '@/lib/upload';
import { prisma } from '@/lib/db';
import { UserStatus } from '@prisma/client';

/**
 * POST /api/upload - Upload a single photo file
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG and PNG images are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file size
    const sizeError = validateFileBuffer(buffer, 10);
    if (sizeError) {
      return NextResponse.json({ error: sizeError }, { status: 400 });
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);

    // Save file
    const publicUrl = await saveUploadedFile(buffer, filename);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/upload - Update user photos and status
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { photoUrls } = body;

    if (!Array.isArray(photoUrls)) {
      return NextResponse.json(
        { error: 'photoUrls must be an array' },
        { status: 400 }
      );
    }

    if (photoUrls.length < 5 || photoUrls.length > 9) {
      return NextResponse.json(
        { error: 'Must provide 5-9 photos' },
        { status: 400 }
      );
    }

    // Get current user to check biodata completion
    const currentUser = await prisma.user.findUnique({
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
        status: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if biodata is complete
    const biodataComplete = !!(
      currentUser.name &&
      currentUser.gender &&
      currentUser.age &&
      currentUser.height &&
      currentUser.city &&
      currentUser.regionId &&
      currentUser.education &&
      currentUser.occupation &&
      currentUser.religionLevel &&
      currentUser.aboutMe
    );

    // Determine new status
    // If both biodata AND photos are complete, set to PENDING_APPROVAL
    let newStatus = currentUser.status;
    if (biodataComplete && photoUrls.length >= 5) {
      newStatus = UserStatus.PENDING_APPROVAL;
    }

    // If editing profile after rejection or as active user, reset to PENDING_APPROVAL
    if (currentUser.status === UserStatus.REJECTED || currentUser.status === UserStatus.ACTIVE) {
      if (biodataComplete) {
        newStatus = UserStatus.PENDING_APPROVAL;
      }
    }

    // Update user photos and status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        photoUrls,
        status: newStatus,
      },
      select: {
        id: true,
        photoUrls: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Photos saved successfully',
    });
  } catch (error) {
    console.error('Error updating photos:', error);
    return NextResponse.json(
      { error: 'Failed to update photos' },
      { status: 500 }
    );
  }
}
