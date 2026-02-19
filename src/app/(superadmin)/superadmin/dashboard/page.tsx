/**
 * Superadmin Dashboard Page - system overview and statistics
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRecentAuditLogs } from '@/lib/audit';
import { UserRole, UserStatus } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== UserRole.SUPERADMIN) {
    redirect('/');
  }

  // Fetch statistics
  const [
    totalUsers,
    activeSupervisors,
    pendingApprovals,
    activeUsers,
    pendingVerification,
    rejectedUsers,
    suspendedUsers,
    totalRegions,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { role: UserRole.SUPERVISOR },
    }),
    prisma.user.count({
      where: { status: UserStatus.PENDING_APPROVAL },
    }),
    prisma.user.count({
      where: { status: UserStatus.ACTIVE },
    }),
    prisma.user.count({
      where: { status: UserStatus.PENDING_VERIFICATION },
    }),
    prisma.user.count({
      where: { status: UserStatus.REJECTED },
    }),
    prisma.user.count({
      where: { status: UserStatus.SUSPENDED },
    }),
    prisma.region.count(),
    getRecentAuditLogs(20),
  ]);

  // Get pending approvals by region
  const pendingByRegion = await prisma.region.findMany({
    include: {
      _count: {
        select: {
          users: {
            where: {
              status: UserStatus.PENDING_APPROVAL,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get user registration trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRegistrations = await prisma.user.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  // Calculate approval rate
  const totalProcessed = activeUsers + rejectedUsers;
  const approvalRate = totalProcessed > 0 ? Math.round((activeUsers / totalProcessed) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and activity monitoring</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">+{recentRegistrations} in last 30 days</p>
        </div>

        {/* Active Supervisors */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Supervisors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeSupervisors}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Across {totalRegions} regions</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingApprovals}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Requires supervisor review</p>
        </div>

        {/* Approval Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{approvalRate}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {activeUsers} active / {totalProcessed} processed
          </p>
        </div>
      </div>

      {/* User Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Status Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Active</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Pending Approval</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{pendingApprovals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Pending Verification</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{pendingVerification}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Rejected</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{rejectedUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Suspended</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{suspendedUsers}</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals by Region */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals by Region</h2>
          {pendingByRegion.length === 0 ? (
            <p className="text-sm text-gray-500">No regions configured</p>
          ) : (
            <div className="space-y-3">
              {pendingByRegion.map((region) => (
                <div key={region.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{region.name}</span>
                  <span
                    className={`text-sm font-semibold ${region._count.users > 0 ? 'text-yellow-600' : 'text-gray-400'}`}
                  >
                    {region._count.users} pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {recentAuditLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                  {log.details && (
                    <p className="text-xs text-gray-600 mt-1">
                      {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
