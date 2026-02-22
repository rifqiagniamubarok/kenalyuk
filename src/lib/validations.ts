/**
 * Validation utilities for authentication and authorization
 */

import { UserRole, UserStatus } from '@/types/auth';
import { Session } from 'next-auth';

/**
 * Check if user has required role
 */
export function hasRole(session: Session | null, requiredRole: UserRole): boolean {
  if (!session?.user) return false;

  const userRole = session.user.role;

  // Role hierarchy: SUPERADMIN > SUPERVISOR > USER
  const roleHierarchy = {
    [UserRole.SUPERADMIN]: 3,
    [UserRole.SUPERVISOR]: 2,
    [UserRole.USER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user is a supervisor
 */
export function isSupervisor(session: Session | null): boolean {
  return hasRole(session, UserRole.SUPERVISOR);
}

/**
 * Check if user is a superadmin
 */
export function isSuperadmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.SUPERADMIN;
}

/**
 * Check if user account is active
 */
export function isActive(session: Session | null): boolean {
  return session?.user?.status === UserStatus.ACTIVE;
}

/**
 * Check if user has access to a specific region
 * Users can only access their own region
 * Supervisors can access their supervised region
 * Superadmins can access all regions
 */
export function hasRegionAccess(session: Session | null, regionId: string): boolean {
  if (!session?.user) return false;

  const user = session.user;

  // Superadmins have access to all regions
  if (user.role === UserRole.SUPERADMIN) return true;

  // Supervisors can access their supervised region
  if (user.role === UserRole.SUPERVISOR) {
    return user.supervisorRegionId === regionId;
  }

  // Users can access their own region
  return user.regionId === regionId;
}

/**
 * Check if user needs to complete profile
 */
export function needsProfileCompletion(session: Session | null): boolean {
  if (!session?.user) return false;

  const status = session.user.status;
  return status === UserStatus.PENDING_VERIFICATION || status === UserStatus.PENDING_APPROVAL;
}

/**
 * Check if user can access dashboard
 * Only active users with completed profiles can access
 */
export function canAccessDashboard(session: Session | null): boolean {
  return session?.user != null && isActive(session);
}

/**
 * Check if user can manage users (approve/reject)
 * Only supervisors and superadmins can manage users
 */
export function canManageUsers(session: Session | null): boolean {
  return isSupervisor(session) || isSuperadmin(session);
}

/**
 * Check if user can manage regions
 * Only superadmins can manage regions
 */
export function canManageRegions(session: Session | null): boolean {
  return isSuperadmin(session);
}
