/**
 * Audit logging utility for tracking supervisor and superadmin actions
 */

import { prisma } from './db';

/**
 * Action types for audit logging
 */
export enum AuditAction {
  // User management
  APPROVE_USER = 'APPROVE_USER',
  REJECT_USER = 'REJECT_USER',
  SUSPEND_USER = 'SUSPEND_USER',
  REACTIVATE_USER = 'REACTIVATE_USER',

  // Role management
  ASSIGN_SUPERVISOR = 'ASSIGN_SUPERVISOR',
  REVOKE_SUPERVISOR = 'REVOKE_SUPERVISOR',

  // Region management
  CREATE_REGION = 'CREATE_REGION',
  UPDATE_REGION = 'UPDATE_REGION',
  DELETE_REGION = 'DELETE_REGION',

  // Chat moderation
  CLOSE_CHATROOM = 'CLOSE_CHATROOM',
  VIEW_CONVERSATION = 'VIEW_CONVERSATION',
}

export interface AuditDetails {
  [key: string]: any;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(userId: string, action: AuditAction, target?: string, details?: AuditDetails): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging failure shouldn't break the main operation
  }
}

/**
 * Get audit history with optional filters
 */
export async function getAuditHistory(options?: { userId?: string; action?: AuditAction; target?: string; limit?: number; offset?: number }) {
  const { userId, action, target, limit = 50, offset = 0 } = options || {};

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(target && { target }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return logs.map((log) => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
  }));
}

/**
 * Get recent audit logs for dashboard
 */
export async function getRecentAuditLogs(limit: number = 20) {
  return getAuditHistory({ limit });
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(timeframe: 'day' | 'week' | 'month' = 'week') {
  const now = new Date();
  const startDate = new Date();

  switch (timeframe) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      action: true,
    },
  });

  // Count actions by type
  const actionCounts = logs.reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    total: logs.length,
    byAction: actionCounts,
  };
}
