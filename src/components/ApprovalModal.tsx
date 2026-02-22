'use client';

/**
 * ApprovalModal component
 * Reusable modal for approval confirmation and rejection reason input
 */

import { useState } from 'react';

interface ApprovalModalProps {
  type: 'approve' | 'reject';
  userName: string;
  onConfirm: (reason?: string) => Promise<void>;
  onCancel: () => void;
}

export default function ApprovalModal({ type, userName, onConfirm, onCancel }: ApprovalModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (type === 'reject' && reason.length < 20) {
      alert('Rejection reason must be at least 20 characters');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(type === 'reject' ? reason : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {type === 'approve' ? (
          <>
            <h3 className="text-xl font-bold mb-4">Approve User Profile</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve <span className="font-semibold">{userName}</span>? This will change their status to ACTIVE and allow them to use the platform.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Approving...' : 'Confirm Approval'}
              </button>
              <button onClick={onCancel} disabled={loading} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 disabled:cursor-not-allowed">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4">Reject User Profile</h3>
            <p className="text-gray-600 mb-4">
              You are rejecting <span className="font-semibold">{userName}</span>. Please provide a reason for rejection (minimum 20 characters):
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4 h-32"
              placeholder="Enter rejection reason..."
              disabled={loading}
            />
            <div className="text-sm text-gray-500 mb-4">{reason.length} / 20 characters minimum</div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading || reason.length < 20}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button onClick={onCancel} disabled={loading} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 disabled:cursor-not-allowed">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
