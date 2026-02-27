'use client';

import { useMemo, useState } from 'react';

interface ProfileOverviewProps {
  profile: {
    status: string;
    name: string | null;
    gender: string | null;
    age: number | null;
    height: number | null;
    city: string | null;
    regionName: string | null;
    education: string | null;
    occupation: string | null;
    religionLevel: string | null;
    aboutMe: string | null;
    photoUrls: string[];
  };
}

const statusConfig = {
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    colorClass: 'bg-amber-100 text-amber-800',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    colorClass: 'bg-blue-100 text-blue-800',
  },
  ACTIVE: {
    label: 'Active',
    colorClass: 'bg-green-100 text-green-800',
  },
  REJECTED: {
    label: 'Rejected',
    colorClass: 'bg-red-100 text-red-800',
  },
  SUSPENDED: {
    label: 'Suspended',
    colorClass: 'bg-gray-200 text-gray-700',
  },
};

function displayValue(value: string | number | null | undefined, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return `${value}${suffix}`;
}

export default function ProfileOverview({ profile }: ProfileOverviewProps) {
  const photos = useMemo(() => profile.photoUrls.slice(0, 5), [profile.photoUrls]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const selectedPhoto = photos[selectedPhotoIndex] || null;
  const status = statusConfig[profile.status as keyof typeof statusConfig] || statusConfig.PENDING_VERIFICATION;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.colorClass}`}>{status.label}</span>
        </div>
        <p className="text-gray-600">Your profile preview is read-only. Use the buttons below to edit your data.</p>
      </div>

      <section className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
        <div className="aspect-[4/5] w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          {selectedPhoto ? (
            <img src={selectedPhoto} alt="Selected profile photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No photos uploaded yet</div>
          )}
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {photos.map((photoUrl, index) => {
              const isSelected = index === selectedPhotoIndex;

              return (
                <button
                  key={`${photoUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`aspect-square rounded-md overflow-hidden border ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img src={photoUrl} alt={`Profile thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Biodata</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.name)}</p>
          </div>
          <div>
            <p className="text-gray-500">Gender</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.gender)}</p>
          </div>
          <div>
            <p className="text-gray-500">Age</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.age, ' years')}</p>
          </div>
          <div>
            <p className="text-gray-500">Height</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.height, ' cm')}</p>
          </div>
          <div>
            <p className="text-gray-500">City</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.city)}</p>
          </div>
          <div>
            <p className="text-gray-500">Region</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.regionName)}</p>
          </div>
          <div>
            <p className="text-gray-500">Education</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.education)}</p>
          </div>
          <div>
            <p className="text-gray-500">Occupation</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.occupation)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">Religious Practice Level</p>
            <p className="text-gray-900 font-medium">{displayValue(profile.religionLevel)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">About Me</p>
            <p className="text-gray-900 font-medium whitespace-pre-wrap">{displayValue(profile.aboutMe)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" className="inline-flex items-center justify-center rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:bg-primary-dark transition-colors">
            Edit Picture
          </button>
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-50 transition-colors">
            Edit Biodata
          </button>
        </div>
      </section>
    </div>
  );
}
