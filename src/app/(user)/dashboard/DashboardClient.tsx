'use client';

import { Card, CardHeader, CardBody, Chip, Progress, Button, Divider } from '@nextui-org/react';
import Link from 'next/link';

interface DashboardClientProps {
  user: {
    name: string | null;
    email: string;
    emailVerified: Date | null;
    status: string;
    gender: string | null;
    age: number | null;
    height: number | null;
    city: string | null;
    regionId: string | null;
    education: string | null;
    occupation: string | null;
    religionLevel: string | null;
    aboutMe: string | null;
    photoUrls: string[];
    region: {
      name: string;
    } | null;
  };
  emailVerified: boolean;
  biodataComplete: boolean;
  photosComplete: boolean;
}

const statusConfig = {
  PENDING_VERIFICATION: {
    color: 'warning' as const,
    icon: '⏳',
    message: 'Please verify your email address to continue.',
  },
  PENDING_APPROVAL: {
    color: 'primary' as const,
    icon: '👀',
    message: 'Your profile is being reviewed by a supervisor. This usually takes 1-2 days.',
  },
  ACTIVE: {
    color: 'success' as const,
    icon: '✅',
    message: 'Your profile is approved! You can now start discovering matches.',
  },
  REJECTED: {
    color: 'danger' as const,
    icon: '❌',
    message: 'Your profile was not approved. Please update your information and submit for review again.',
  },
  SUSPENDED: {
    color: 'default' as const,
    icon: '🚫',
    message: 'Your account has been suspended. Please contact support for assistance.',
  },
};

export default function DashboardClient({ user, emailVerified, biodataComplete, photosComplete }: DashboardClientProps) {
  const currentStatus = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.PENDING_VERIFICATION;
  const completionSteps = [emailVerified, biodataComplete, photosComplete].filter(Boolean).length;
  const completionPercentage = (completionSteps / 3) * 100;
  const profileComplete = completionSteps === 3;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome{user.name ? `, ${user.name}` : ''}!</h1>
        <p className="text-text-secondary text-lg">Complete your profile to start your journey.</p>
      </div>

      {/* Status Card */}
      <Card className="mb-6 border border-gray-100 shadow-soft">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{currentStatus.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-text-primary">Account Status</h2>
                <Chip color={currentStatus.color} variant="flat" size="sm">
                  {user.status.replace(/_/g, ' ')}
                </Chip>
              </div>
              <p className="text-text-secondary">{currentStatus.message}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Profile Completion Checklist */}
      <Card className="mb-6 shadow-soft">
        <CardHeader className="pb-0">
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Profile Completion</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">Overall Progress</span>
              <span className="text-sm font-semibold text-primary">{completionSteps}/3 Complete</span>
            </div>
            <Progress value={completionPercentage} color="success" className="mb-4" classNames={{
              indicator: 'bg-primary'
            }} />
          </div>
        </CardHeader>
        <CardBody className="pt-4">
          <div className="space-y-4">
            {/* Email Verification */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                emailVerified ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {emailVerified ? '✓' : '1'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Email Verification</h3>
                <p className="text-sm text-text-secondary">{emailVerified ? 'Email verified ✓' : 'Please verify your email address'}</p>
              </div>
              {!emailVerified && (
                <Button as={Link} href="/verify-email" className="bg-primary hover:bg-primary-dark text-white" size="sm">
                  Verify
                </Button>
              )}
              {emailVerified && (
                <Chip color="success" variant="flat" size="sm">
                  Done
                </Chip>
              )}
            </div>

            {/* Biodata Completion */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                biodataComplete ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {biodataComplete ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Complete Biodata</h3>
                <p className="text-sm text-text-secondary">{biodataComplete ? 'Profile information complete ✓' : 'Fill in your profile information'}</p>
              </div>
              <Button as={Link} href="/biodata" className="bg-primary hover:bg-primary-dark text-white" size="sm">
                {biodataComplete ? 'Edit' : 'Complete'}
              </Button>
            </div>

            {/* Photo Upload */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                photosComplete ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {photosComplete ? '✓' : '3'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Upload Photos</h3>
                <p className="text-sm text-text-secondary">{photosComplete ? `${user.photoUrls?.length || 0} photos uploaded ✓` : 'Upload 5-9 photos of yourself'}</p>
              </div>
              <Button as={Link} href="/photos" className="bg-primary hover:bg-primary-dark text-white" size="sm">
                {photosComplete ? 'Edit' : 'Upload'}}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Profile Summary (if complete) */}
      {biodataComplete && (
        <Card className="mb-6" shadow="sm">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Your Profile</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Gender</span>
                <span className="font-medium">{user.gender}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Age</span>
                <span className="font-medium">{user.age} years</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Height</span>
                <span className="font-medium">{user.height} cm</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">City</span>
                <span className="font-medium">{user.city}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Region</span>
                <span className="font-medium">{user.region?.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Education</span>
                <span className="font-medium">{user.education}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Occupation</span>
                <span className="font-medium">{user.occupation}</span>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm text-gray-500">Religion Level</span>
                <span className="font-medium">{user.religionLevel}</span>
              </div>
            </div>

            {user.aboutMe && (
              <>
                <Divider className="my-4" />
                <div>
                  <span className="text-sm text-gray-500 block mb-2">About Me</span>
                  <p className="text-gray-700">{user.aboutMe}</p>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Photos Preview (if uploaded) */}
      {photosComplete && user.photoUrls && user.photoUrls.length > 0 && (
        <Card className="mb-6" shadow="sm">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Your Photos</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {user.photoUrls.map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      {user.status === 'ACTIVE' && profileComplete && (
        <div className="text-center">
          <Button as={Link} href="/discover" color="secondary" size="lg" className="font-semibold px-8">
            Start Discovering Matches 💕
          </Button>
        </div>
      )}
    </div>
  );
}
