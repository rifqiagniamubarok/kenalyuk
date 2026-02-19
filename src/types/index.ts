// Global TypeScript type definitions for Kenalyuk! platform

// User types based on Prisma schema
export type UserRole = 'USER' | 'SUPERVISOR' | 'SUPERADMIN';
export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
