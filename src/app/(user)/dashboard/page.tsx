/**
 * User dashboard page with Hero UI
 * Shows profile completion status and navigation to biodata/photos
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      emailVerified: true,
      status: true,
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
      region: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Calculate profile completion
  const emailVerified = !!user.emailVerified;
  const biodataComplete = !!(
    user.name &&
    user.gender &&
    user.age &&
    user.height &&
    user.city &&
    user.regionId &&
    user.education &&
    user.occupation &&
    user.religionLevel &&
    user.aboutMe
  );
  const photosComplete = user.photoUrls && user.photoUrls.length >= 5;

  return <DashboardClient user={user} emailVerified={emailVerified} biodataComplete={biodataComplete} photosComplete={photosComplete} />;
}
