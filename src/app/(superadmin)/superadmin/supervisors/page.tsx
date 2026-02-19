/**
 * Superadmin Supervisors Page - interface for supervisor role management
 */

import SupervisorManager from '@/components/SupervisorManager';

export default function SupervisorsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Supervisor Management</h1>
        <p className="text-gray-600 mt-2">Assign and manage supervisor roles for regional oversight</p>
      </div>

      <SupervisorManager />
    </div>
  );
}
