'use client';

/**
 * Supervisor Dashboard Client Component with NextUI
 */

import Link from 'next/link';
import { Card, CardBody, CardHeader, Chip, Divider, Button } from '@nextui-org/react';

interface DashboardClientProps {
  region: {
    name: string;
  } | null;
  stats: {
    pendingCount: number;
    activeCount: number;
    rejectedCount: number;
    totalUsers: number;
  };
  recentApprovals: Array<{
    id: string;
    action: string;
    target: string | null;
    createdAt: Date;
  }>;
}

export default function DashboardClient({ region, stats, recentApprovals }: DashboardClientProps) {
  const { pendingCount, activeCount, rejectedCount, totalUsers } = stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
        <p className="text-default-500 mt-2">
          Managing region: <span className="font-semibold text-secondary">{region?.name || 'Unknown'}</span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className={pendingCount > 0 ? 'border-l-4 border-warning' : ''}>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Pending Approval</p>
                <p className="text-3xl font-bold text-warning mt-2">{pendingCount}</p>
                {pendingCount > 0 && (
                  <Link href="/supervisor/pending">
                    <Button size="sm" color="secondary" variant="flat" className="mt-3">
                      Review now →
                    </Button>
                  </Link>
                )}
              </div>
              <div className="h-12 w-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Active Users</p>
                <p className="text-3xl font-bold text-success mt-2">{activeCount}</p>
              </div>
              <div className="h-12 w-12 bg-success-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Rejected</p>
                <p className="text-3xl font-bold text-danger mt-2">{rejectedCount}</p>
              </div>
              <div className="h-12 w-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-default-500">Total Users</p>
                <p className="text-3xl font-bold text-secondary mt-2">{totalUsers}</p>
              </div>
              <div className="h-12 w-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-xs text-default-400">Your latest approval decisions</p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-0 pt-4">
          {recentApprovals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-default-400 italic">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApprovals.map((log) => (
                <div key={log.id} className="flex items-center justify-between pb-3 border-b border-divider last:border-0">
                  <div className="flex items-center gap-3">
                    <Chip size="sm" color={log.action === 'APPROVE_USER' ? 'success' : 'danger'} variant="flat">
                      {log.action === 'APPROVE_USER' ? 'Approved' : 'Rejected'}
                    </Chip>
                    <span className="text-sm text-default-600">User {log.target}</span>
                  </div>
                  <div className="text-xs text-default-400">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
        {recentApprovals.length > 0 && (
          <>
            <Divider />
            <CardBody className="pt-3 pb-3">
              <Link href="/supervisor/history">
                <Button size="sm" color="secondary" variant="light" className="w-full">
                  View full history →
                </Button>
              </Link>
            </CardBody>
          </>
        )}
      </Card>
    </div>
  );
}
