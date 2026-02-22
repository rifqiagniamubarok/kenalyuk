/**
 * Superadmin Dashboard Page - Server Component
 * Fetches data and passes to client component
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRecentAuditLogs } from '@/lib/audit';
import { UserRole, UserStatus } from '@/types/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user || session.user?.role !== UserRole.SUPERADMIN) {
    redirect('/');
  }

  // Fetch statistics
  const [totalUsers, activeSupervisors, pendingApprovals, activeUsers, pendingVerification, rejectedUsers, suspendedUsers, totalRegions, recentAuditLogs] = await Promise.all([
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
    <DashboardClient
      totalUsers={totalUsers}
      activeSupervisors={activeSupervisors}
      pendingApprovals={pendingApprovals}
      activeUsers={activeUsers}
      pendingVerification={pendingVerification}
      rejectedUsers={rejectedUsers}
      suspendedUsers={suspendedUsers}
      totalRegions={totalRegions}
      recentRegistrations={recentRegistrations}
      approvalRate={approvalRate}
      pendingByRegion={pendingByRegion}
      recentAuditLogs={recentAuditLogs}
    />
  );
}
