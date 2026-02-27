import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface ReorderRequestBody {
  photoIds?: string[];
  photoUrls?: string[];
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: ReorderRequestBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const submittedPhotos = body.photoUrls ?? body.photoIds;

    if (!Array.isArray(submittedPhotos) || submittedPhotos.length === 0) {
      return NextResponse.json({ error: 'photoUrls or photoIds must be a non-empty array' }, { status: 400 });
    }

    if (!submittedPhotos.every((photo) => typeof photo === 'string' && photo.trim().length > 0)) {
      return NextResponse.json({ error: 'All photo identifiers must be non-empty strings' }, { status: 400 });
    }

    const normalizedPhotos = submittedPhotos.map((photo) => photo.trim());

    if (new Set(normalizedPhotos).size !== normalizedPhotos.length) {
      return NextResponse.json({ error: 'Duplicate photos are not allowed' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { photoUrls: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentPhotoUrls = user.photoUrls || [];

    if (currentPhotoUrls.length === 0) {
      return NextResponse.json({ error: 'No photos found for user' }, { status: 404 });
    }

    if (normalizedPhotos.length !== currentPhotoUrls.length) {
      return NextResponse.json({ error: 'Photo count mismatch with current profile photos' }, { status: 400 });
    }

    const currentPhotosSet = new Set(currentPhotoUrls);
    const hasForeignPhoto = normalizedPhotos.some((photo) => !currentPhotosSet.has(photo));

    if (hasForeignPhoto) {
      return NextResponse.json({ error: 'Cannot reorder photos you do not own' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { photoUrls: normalizedPhotos },
      select: { photoUrls: true },
    });

    return NextResponse.json({
      success: true,
      photoUrls: updatedUser.photoUrls,
      profilePicture: updatedUser.photoUrls[0] || null,
    });
  } catch (error) {
    console.error('Error reordering photos:', error);
    return NextResponse.json({ error: 'Failed to update photo order' }, { status: 500 });
  }
}