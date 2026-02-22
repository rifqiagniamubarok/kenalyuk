/**
 * Supervisor Approval History Page
 * Shows supervisor's past approval/rejection decisions
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AuditAction } from '@/lib/audit';

export default async function HistoryPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized</h1>
        <p className="text-gray-600">Please log in to view this page.</p>
      </div>
    );
  }

  // Fetch approval/rejection history
  const history = await prisma.auditLog.findMany({
    where: {
      userId: session.user?.id || '',
      action: {
        in: [AuditAction.APPROVE_USER, AuditAction.REJECT_USER],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Last 50 actions
  });

  // Parse JSON details
  const parsedHistory = history.map((log) => ({
    ...log,
    parsedDetails: log.details ? JSON.parse(log.details) : null,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Approval History</h1>
        <p className="text-gray-600">Your past approval and rejection decisions</p>
      </div>

      {parsedHistory.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No History Yet</h2>
          <p className="text-gray-600">You haven't made any approval or rejection decisions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedHistory.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${log.action === AuditAction.APPROVE_USER ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {log.action === AuditAction.APPROVE_USER ? 'Approved' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{log.parsedDetails?.userName || 'Unknown'}</div>
                      <div className="text-gray-500">{log.parsedDetails?.userEmail || log.target}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.action === AuditAction.REJECT_USER && log.parsedDetails?.reason ? (
                        <div className="max-w-md">
                          <div className="text-xs text-gray-500 mb-1">Rejection reason:</div>
                          <div className="italic">{log.parsedDetails.reason}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
