/**
 * Supervisor Dashboard - Server Component
 * Fetches data and passes to client component
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserStatus, UserRole } from '@/types/auth';
import DashboardClient from './DashboardClient';

export default async function SupervisorDashboard() {
  const session = await getServerSession();

  if (!session?.user?.supervisorRegionId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h1 className="text-2xl font-bold mb-2">No Region Assigned</h1>
            <p className="text-gray-600">Please contact a superadmin to assign you to a region.</p>
          </div>
        </div>
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
      userId: session.user?.id || '',
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
    <DashboardClient
      region={region}
      stats={{
        pendingCount,
        activeCount,
        rejectedCount,
        totalUsers,
      }}
      recentApprovals={recentApprovals}
    />
  );
}
