'use client';

/**
 * Superadmin Dashboard Client Component with NextUI
 */

import { Card, CardBody, CardHeader, Chip, Divider } from '@nextui-org/react';

interface PendingByRegion {
  id: string;
  name: string;
  _count: {
    users: number;
  };
}

interface RecentAuditLog {
  id: string;
  action: string;
  details: string | null | object;
  createdAt: Date;
}

interface DashboardClientProps {
  totalUsers: number;
  activeSupervisors: number;
  pendingApprovals: number;
  activeUsers: number;
  pendingVerification: number;
  rejectedUsers: number;
  suspendedUsers: number;
  totalRegions: number;
  recentRegistrations: number;
  approvalRate: number;
  pendingByRegion: PendingByRegion[];
  recentAuditLogs: RecentAuditLog[];
}

export default function DashboardClient({
  totalUsers,
  activeSupervisors,
  pendingApprovals,
  activeUsers,
  pendingVerification,
  rejectedUsers,
  suspendedUsers,
  totalRegions,
  recentRegistrations,
  approvalRate,
  pendingByRegion,
  recentAuditLogs,
}: DashboardClientProps) {
  const totalProcessed = activeUsers + rejectedUsers;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-default-500 mt-2">System overview and activity monitoring</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Users */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Total Users</p>
                <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                <p className="text-xs text-default-400 mt-3">+{recentRegistrations} in last 30 days</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Supervisors */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Active Supervisors</p>
                <p className="text-3xl font-bold mt-2">{activeSupervisors}</p>
                <p className="text-xs text-default-400 mt-3">Across {totalRegions} regions</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👮</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Pending Approvals</p>
                <p className="text-3xl font-bold mt-2">{pendingApprovals}</p>
                <p className="text-xs text-default-400 mt-3">Requires supervisor review</p>
              </div>
              <div className="h-12 w-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Approval Rate</p>
                <p className="text-3xl font-bold mt-2">{approvalRate}%</p>
                <p className="text-xs text-default-400 mt-3">
                  {activeUsers} active / {totalProcessed} processed
                </p>
              </div>
              <div className="h-12 w-12 bg-success-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* User Status Distribution and Regional Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Status Breakdown */}
        <Card>
          <CardHeader className="pb-0 pt-4 px-4">
            <h2 className="text-lg font-semibold">User Status Distribution</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chip size="sm" color="success" variant="flat">
                  Active
                </Chip>
              </div>
              <span className="text-lg font-semibold">{activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chip size="sm" color="warning" variant="flat">
                  Pending Approval
                </Chip>
              </div>
              <span className="text-lg font-semibold">{pendingApprovals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chip size="sm" color="primary" variant="flat">
                  Pending Verification
                </Chip>
              </div>
              <span className="text-lg font-semibold">{pendingVerification}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chip size="sm" color="danger" variant="flat">
                  Rejected
                </Chip>
              </div>
              <span className="text-lg font-semibold">{rejectedUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chip size="sm" color="default" variant="flat">
                  Suspended
                </Chip>
              </div>
              <span className="text-lg font-semibold">{suspendedUsers}</span>
            </div>
          </CardBody>
        </Card>

        {/* Pending Approvals by Region */}
        <Card>
          <CardHeader className="pb-0 pt-4 px-4">
            <h2 className="text-lg font-semibold">Pending Approvals by Region</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-3 pt-4">
            {pendingByRegion.length === 0 ? (
              <p className="text-sm text-default-400">No regions configured</p>
            ) : (
              pendingByRegion.map((region) => (
                <div key={region.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{region.name}</span>
                  <Chip size="sm" color={region._count.users > 0 ? 'warning' : 'default'} variant="flat">
                    {region._count.users} pending
                  </Chip>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </CardHeader>
        <Divider />
        <CardBody className="gap-0 pt-4">
          {recentAuditLogs.length === 0 ? (
            <p className="text-sm text-default-400">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-divider last:border-0 last:pb-0">
                  <div className="flex-shrink-0 h-10 w-10 bg-secondary-100 rounded-xl flex items-center justify-center mt-0.5">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{log.action.replaceAll('_', ' ')}</p>
                    {log.details && <p className="text-xs text-default-400 mt-1 line-clamp-2">{typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}</p>}
                    <p className="text-xs text-default-400 mt-1.5">
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
        </CardBody>
      </Card>
    </div>
  );
}
