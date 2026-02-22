/**
 * Authentication type definitions for next-auth
 */

import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * User role enum - defines access levels in the system
 */
export enum UserRole {
  USER = 'USER',
  SUPERVISOR = 'SUPERVISOR',
  SUPERADMIN = 'SUPERADMIN',
}

/**
 * User status enum - lifecycle states for user accounts
 */
export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Match status enum - lifecycle states for matches
 */
export enum MatchStatus {
  ACTIVE = 'ACTIVE',
  UNMATCHED = 'UNMATCHED',
  CLOSED = 'CLOSED',
}

/**
 * Extended session user type with role and region
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: UserRole;
      status: UserStatus;
      regionId?: string | null;
      supervisorRegionId?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    status: UserStatus;
    regionId?: string | null;
    supervisorRegionId?: string | null;
  }
}

/**
 * Extended JWT token type
 */
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    regionId?: string | null;
    supervisorRegionId?: string | null;
  }
}

/**
 * Login credentials type
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data type
 */
export interface RegistrationData {
  email: string;
  password: string;
  name: string;
}
