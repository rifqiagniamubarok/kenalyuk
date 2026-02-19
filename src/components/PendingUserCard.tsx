'use client';

/**
 * PendingUserCard component
 * Displays user profile for supervisor review with approve/reject actions
 */

import { useState } from 'react';
import Image from 'next/image';

interface PendingUser {
  id: string;
  name: string | null;
  email: string;
  gender: string | null;
  age: number | null;
  height: number | null;
  city: string | null;
  education: string | null;
  occupation: string | null;
  religionLevel: string | null;
  aboutMe: string | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  region?: {
    id: string;
    name: string;
  } | null;
}

interface PendingUserCardProps {
  user: PendingUser;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
}

export default function PendingUserCard({ user, onApprove, onReject }: PendingUserCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(user.id);
    setLoading(false);
  };

  const handleReject = async () => {
    if (rejectReason.length < 20) {
      alert('Rejection reason must be at least 20 characters');
      return;
    }
    setLoading(true);
    await onReject(user.id, rejectReason);
    setLoading(false);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % user.photoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + user.photoUrls.length) % user.photoUrls.length);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Photo Gallery */}
        {user.photoUrls.length > 0 && (
          <div className="relative h-64 bg-gray-200">
            <Image src={user.photoUrls[currentPhotoIndex]} alt={user.name || 'User photo'} fill className="object-cover" />
            {user.photoUrls.length > 1 && (
              <>
                <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70">
                  ←
                </button>
                <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70">
                  →
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentPhotoIndex + 1} / {user.photoUrls.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* User Information */}
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">{user.name || 'No Name'}</h3>

          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <span className="text-gray-600">Gender:</span> <span className="font-medium">{user.gender || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span> <span className="font-medium">{user.age || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Height:</span> <span className="font-medium">{user.height ? `${user.height} cm` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">City:</span> <span className="font-medium">{user.city || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Education:</span> <span className="font-medium">{user.education || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Occupation:</span> <span className="font-medium">{user.occupation || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Religion Level:</span> <span className="font-medium">{user.religionLevel || 'N/A'}</span>
            </div>
          </div>

          {user.aboutMe && (
            <div className="mb-3">
              <div className="text-gray-600 text-sm mb-1">About:</div>
              <p className="text-sm italic bg-gray-50 p-2 rounded">{user.aboutMe}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 mb-3">
            <div>Email: {user.email}</div>
            <div>Region: {user.region?.name || 'N/A'}</div>
            <div>Submitted: {new Date(user.updatedAt).toLocaleDateString()}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
              {loading ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject User Profile</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection (minimum 20 characters):</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4 h-32"
              placeholder="Enter rejection reason..."
            />
            <div className="text-sm text-gray-500 mb-4">{rejectReason.length} / 20 characters minimum</div>
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={loading || rejectReason.length < 20} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button onClick={() => setShowRejectModal(false)} disabled={loading} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 disabled:cursor-not-allowed">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
