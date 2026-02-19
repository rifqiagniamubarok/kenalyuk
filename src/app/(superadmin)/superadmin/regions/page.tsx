/**
 * Superadmin Regions Page - CRUD interface for region management
 */

import RegionManager from '@/components/RegionManager';

export default function RegionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Region Management</h1>
        <p className="text-gray-600 mt-2">Create and manage geographical regions for supervisor assignments</p>
      </div>

      <RegionManager />
    </div>
  );
}
