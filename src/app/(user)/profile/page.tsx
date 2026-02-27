import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import BiodataForm from '@/components/BiodataForm';
import ProfilePhotoSection from './ProfilePhotoSection';

const statusConfig = {
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    colorClass: 'bg-amber-100 text-amber-800',
    message: 'Please verify your email address to continue.',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    colorClass: 'bg-blue-100 text-blue-800',
    message: 'Your profile is currently being reviewed by a supervisor.',
  },
  ACTIVE: {
    label: 'Active',
    colorClass: 'bg-green-100 text-green-800',
    message: 'Your profile is approved and ready for discovery and chat.',
  },
  REJECTED: {
    label: 'Rejected',
    colorClass: 'bg-red-100 text-red-800',
    message: 'Your profile was not approved. Update your profile and resubmit.',
  },
  SUSPENDED: {
    label: 'Suspended',
    colorClass: 'bg-gray-200 text-gray-700',
    message: 'Your account is suspended. Contact support for help.',
  },
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      status: true,
      emailVerified: true,
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
    redirect('/login');
  }

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
  const photosComplete = !!user.photoUrls && user.photoUrls.length >= 5;
  const completionSteps = [emailVerified, biodataComplete, photosComplete].filter(Boolean).length;
  const completionPercentage = Math.round((completionSteps / 3) * 100);

  const status = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.PENDING_VERIFICATION;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account status, biodata, and photos in one place.</p>
      </div>

      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Status Summary</h2>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.colorClass}`}>{status.label}</span>
        </div>

        <p className="text-gray-600">{status.message}</p>

        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Profile completion</span>
            <span>
              {completionSteps}/3 ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
          <div className="rounded border border-gray-200 px-3 py-2">Email verification: {emailVerified ? 'Complete' : 'Pending'}</div>
          <div className="rounded border border-gray-200 px-3 py-2">Biodata: {biodataComplete ? 'Complete' : 'Incomplete'}</div>
          <div className="rounded border border-gray-200 px-3 py-2">Photos: {photosComplete ? 'Complete' : 'Incomplete'}</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Biodata</h2>
        <BiodataForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Photos</h2>
        <ProfilePhotoSection />
      </section>
    </div>
  );
}