/**
 * User dashboard page
 * Shows profile completion status and navigation to biodata/photos
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
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
  const profileComplete = emailVerified && biodataComplete && photosComplete;

  // Status information
  const statusConfig = {
    PENDING_VERIFICATION: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳',
      message: 'Please verify your email address to continue.',
    },
    PENDING_APPROVAL: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '👀',
      message: 'Your profile is being reviewed by a supervisor. This usually takes 1-2 days.',
    },
    ACTIVE: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
      message: 'Your profile is approved! You can now start discovering matches.',
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      message: 'Your profile was not approved. Please update your information and submit for review again.',
    },
    SUSPENDED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '🚫',
      message: 'Your account has been suspended. Please contact support for assistance.',
    },
  };

  const currentStatus = statusConfig[user.status];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome{user.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-gray-600">Complete your profile to start your journey.</p>
      </div>

      {/* Status Card */}
      <div className={`border-2 rounded-lg p-6 mb-6 ${currentStatus.color}`}>
        <div className="flex items-start gap-4">
          <div className="text-3xl">{currentStatus.icon}</div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Status: {user.status.replace(/_/g, ' ')}</h2>
            <p>{currentStatus.message}</p>
          </div>
        </div>
      </div>

      {/* Profile Completion Checklist */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Completion</h2>

        <div className="space-y-4">
          {/* Email Verification */}
          <div className="flex items-center gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                emailVerified ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {emailVerified ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-white text-sm">1</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Email Verification</h3>
              <p className="text-sm text-gray-600">
                {emailVerified ? 'Email verified ✓' : 'Please verify your email address'}
              </p>
            </div>
            {!emailVerified && (
              <Link
                href="/verify-email"
                className="px-4 py-2 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Verify
              </Link>
            )}
          </div>

          {/* Biodata Completion */}
          <div className="flex items-center gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                biodataComplete ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {biodataComplete ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-white text-sm">2</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Complete Biodata</h3>
              <p className="text-sm text-gray-600">
                {biodataComplete
                  ? 'Profile information complete ✓'
                  : 'Fill in your profile information'}
              </p>
            </div>
            <Link
              href="/biodata"
              className="px-4 py-2 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              {biodataComplete ? 'Edit' : 'Complete'}
            </Link>
          </div>

          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                photosComplete ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              {photosComplete ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-white text-sm">3</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Upload Photos</h3>
              <p className="text-sm text-gray-600">
                {photosComplete
                  ? `${user.photoUrls?.length} photos uploaded ✓`
                  : 'Upload 5-9 photos of yourself'}
              </p>
            </div>
            <Link
              href="/photos"
              className="px-4 py-2 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              {photosComplete ? 'Edit' : 'Upload'}
            </Link>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Profile Completion</span>
            <span>
              {[emailVerified, biodataComplete, photosComplete].filter(Boolean).length}/3
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-600 h-2 rounded-full transition-all"
              style={{
                width: `${
                  ([emailVerified, biodataComplete, photosComplete].filter(Boolean).length / 3) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Profile Summary (if complete) */}
      {biodataComplete && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{user.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 font-medium">{user.gender}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-medium">{user.age} years</span>
            </div>
            <div>
              <span className="text-gray-600">Height:</span>
              <span className="ml-2 font-medium">{user.height} cm</span>
            </div>
            <div>
              <span className="text-gray-600">City:</span>
              <span className="ml-2 font-medium">{user.city}</span>
            </div>
            <div>
              <span className="text-gray-600">Region:</span>
              <span className="ml-2 font-medium">{user.region?.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Education:</span>
              <span className="ml-2 font-medium">{user.education}</span>
            </div>
            <div>
              <span className="text-gray-600">Occupation:</span>
              <span className="ml-2 font-medium">{user.occupation}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Religion Level:</span>
              <span className="ml-2 font-medium">{user.religionLevel}</span>
            </div>
          </div>

          {user.aboutMe && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm">About Me:</span>
              <p className="mt-1 text-sm text-gray-900">{user.aboutMe}</p>
            </div>
          )}
        </div>
      )}

      {/* Photos Preview (if uploaded) */}
      {photosComplete && user.photoUrls && user.photoUrls.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Photos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {user.photoUrls.map((url, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {!profileComplete && (
        <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-4">
          <h3 className="font-medium text-pink-900 mb-2">Next Steps</h3>
          <p className="text-sm text-pink-700">
            {!emailVerified && 'Please verify your email address to continue.'}
            {emailVerified && !biodataComplete && 'Complete your biodata to proceed.'}
            {emailVerified && biodataComplete && !photosComplete &&
              'Upload your photos to submit for approval.'}
          </p>
        </div>
      )}

      {profileComplete && user.status === 'PENDING_APPROVAL' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Under Review</h3>
          <p className="text-sm text-blue-700">
            Your profile has been submitted for review. You'll be notified once a supervisor
            approves your profile.
          </p>
        </div>
      )}

      {user.status === 'ACTIVE' && (
        <div className="mt-6 text-center">
          <Link
            href="/discover"
            className="inline-block px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium"
          >
            Start Discovering Matches
          </Link>
        </div>
      )}
    </div>
  );
}
