import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import ProfileOverview from './ProfileOverview';

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      status: true,
      name: true,
      gender: true,
      age: true,
      height: true,
      city: true,
      region: {
        select: {
          name: true,
        },
      },
      education: true,
      occupation: true,
      religionLevel: true,
      aboutMe: true,
      photoUrls: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return <ProfileOverview profile={{ ...user, photoUrls: user.photoUrls.slice(0, 5), regionName: user.region?.name ?? null }} />;
}
