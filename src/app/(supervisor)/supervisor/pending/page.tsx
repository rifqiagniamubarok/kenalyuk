'use client';

/**
 * Pending Users Review Page
 * Displays all users pending approval in supervisor's region
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PendingUserCard from '@/components/PendingUserCard';

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

export default function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supervisor/pending');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pending users');
      }

      setUsers(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch('/api/supervisor/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve user');
      }

      // Remove user from list
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert('User approved successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      const response = await fetch('/api/supervisor/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject user');
      }

      // Remove user from list
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert('User rejected successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-text-secondary">Loading pending users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 font-semibold mb-4">Error: {error}</div>
        <button onClick={fetchPendingUsers} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 shadow-soft">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending User Approvals</h1>
        <p className="text-gray-600">Review and approve/reject user profiles in your region</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h2>
          <p className="text-gray-600">There are no pending users to review at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <PendingUserCard key={user.id} user={user} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  );
}
