/**
 * Supervisor Dashboard
 * Shows overview statistics and pending users count
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus, UserRole } from '@/types/auth';
import Link from 'next/link';

export default async function SupervisorDashboard() {
  const session = await getServerSession();

  if (!session?.user?.supervisorRegionId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No Region Assigned</h1>
        <p className="text-gray-600">Please contact a superadmin to assign you to a region.</p>
      </div>
    );
  }

  // Fetch region information
  const region = await prisma.region.findUnique({
    where: { id: session.user.supervisorRegionId },
  });

  // Fetch statistics
  const pendingCount = await prisma.user.count({
    where: {
      status: UserStatus.PENDING_APPROVAL,
      regionId: session.user.supervisorRegionId,
      role: UserRole.USER,
    },
  });

  const activeCount = await prisma.user.count({
    where: {
      status: UserStatus.ACTIVE,
      regionId: session.user.supervisorRegionId,
      role: UserRole.USER,
    },
  });

  const rejectedCount = await prisma.user.count({
    where: {
      status: UserStatus.REJECTED,
      regionId: session.user.supervisorRegionId,
      role: UserRole.USER,
    },
  });

  const totalUsers = pendingCount + activeCount + rejectedCount;

  // Recent approval history
  const recentApprovals = await prisma.auditLog.findMany({
    where: {
      userId: session.user.id,
      action: {
        in: ['APPROVE_USER', 'REJECT_USER'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Supervisor Dashboard</h1>
        <p className="text-gray-600">
          Managing region: <span className="font-semibold text-purple-600">{region?.name || 'Unknown'}</span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">Pending Approval</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          {pendingCount > 0 && (
            <Link href="/supervisor/pending" className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block">
              Review now →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">Active Users</div>
          <div className="text-3xl font-bold text-green-600">{activeCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">Rejected</div>
          <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">Total Users</div>
          <div className="text-3xl font-bold text-purple-600">{totalUsers}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        {recentApprovals.length === 0 ? (
          <p className="text-gray-500 italic">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentApprovals.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className={`font-medium ${log.action === 'APPROVE_USER' ? 'text-green-600' : 'text-red-600'}`}>{log.action === 'APPROVE_USER' ? 'Approved' : 'Rejected'}</span>
                  <span className="text-gray-600 ml-2">user {log.target}</span>
                </div>
                <div className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        <Link href="/supervisor/history" className="text-purple-600 hover:text-purple-700 text-sm mt-4 inline-block">
          View full history →
        </Link>
      </div>
    </div>
  );
}
