/**
 * SupervisorManager component - manage supervisor role assignments
 * Used by SUPERADMIN to assign/revoke supervisor roles and manage region assignments
 */

'use client';

import { useState, useEffect } from 'react';

interface Region {
  id: string;
  name: string;
  description: string | null;
}

interface Supervisor {
  id: string;
  name: string | null;
  email: string;
  supervisorRegion: Region | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function SupervisorManager() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load supervisors and users
      const supervisorsResponse = await fetch('/api/supervisors');
      const supervisorsData = await supervisorsResponse.json();

      if (!supervisorsResponse.ok) {
        throw new Error(supervisorsData.error || 'Failed to load supervisors');
      }

      // Load regions
      const regionsResponse = await fetch('/api/regions');
      const regionsData = await regionsResponse.json();

      if (!regionsResponse.ok) {
        throw new Error(regionsData.error || 'Failed to load regions');
      }

      setSupervisors(supervisorsData.supervisors);
      setUsers(supervisorsData.users);
      setRegions(regionsData.regions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const response = await fetch('/api/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          regionId: selectedRegion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign supervisor');
      }

      // Update local state
      setSupervisors([...supervisors, data.supervisor]);
      setUsers(users.filter((u) => u.id !== selectedUser));

      setShowAssignModal(false);
      setSelectedUser('');
      setSelectedRegion('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to assign supervisor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateRegion = async (supervisorId: string, newRegionId: string) => {
    if (!confirm("Are you sure you want to change this supervisor's region assignment?")) {
      return;
    }

    try {
      const response = await fetch('/api/supervisors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: supervisorId,
          regionId: newRegionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update supervisor');
      }

      // Update local state
      setSupervisors(supervisors.map((s) => (s.id === supervisorId ? data.supervisor : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update supervisor');
    }
  };

  const handleRevokeSupervisor = async (supervisor: Supervisor) => {
    if (!confirm(`Are you sure you want to revoke supervisor role from ${supervisor.name || supervisor.email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/supervisors?userId=${supervisor.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke supervisor');
      }

      // Update local state
      setSupervisors(supervisors.filter((s) => s.id !== supervisor.id));
      setUsers([...users, { id: data.user.id, name: data.user.name, email: data.user.email }]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to revoke supervisor');
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter((user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Group supervisors by region
  const supervisorsByRegion = regions.map((region) => ({
    region,
    supervisors: supervisors.filter((s) => s.supervisorRegion?.id === region.id),
  }));

  const unassignedSupervisors = supervisors.filter((s) => !s.supervisorRegion);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading supervisors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={loadData} className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supervisors</h2>
          <p className="text-gray-600 mt-1">{supervisors.length} active supervisors</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          disabled={users.length === 0 || regions.length === 0}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Assign Supervisor
        </button>
      </div>

      {/* Supervisors by Region */}
      <div className="space-y-6">
        {supervisorsByRegion.map(({ region, supervisors: regionalSupervisors }) => (
          <div key={region.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {region.name} <span className="text-sm font-normal text-gray-500">({regionalSupervisors.length} supervisors)</span>
            </h3>

            {regionalSupervisors.length === 0 ? (
              <p className="text-gray-500 text-sm">No supervisors assigned to this region</p>
            ) : (
              <div className="space-y-3">
                {regionalSupervisors.map((supervisor) => (
                  <div key={supervisor.id} className="flex items-center justify-between bg-gray-50 rounded-md p-4">
                    <div>
                      <p className="font-medium text-gray-900">{supervisor.name || 'Unnamed user'}</p>
                      <p className="text-sm text-gray-600">{supervisor.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={supervisor.supervisorRegion?.id || ''}
                        onChange={(e) => handleUpdateRegion(supervisor.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      >
                        <option value={supervisor.supervisorRegion?.id || ''}>{supervisor.supervisorRegion?.name}</option>
                        {regions
                          .filter((r) => r.id !== supervisor.supervisorRegion?.id)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                      <button onClick={() => handleRevokeSupervisor(supervisor)} className="px-4 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Unassigned Supervisors */}
        {unassignedSupervisors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Unassigned Supervisors <span className="text-sm font-normal text-yellow-700">({unassignedSupervisors.length})</span>
            </h3>
            <div className="space-y-3">
              {unassignedSupervisors.map((supervisor) => (
                <div key={supervisor.id} className="flex items-center justify-between bg-white rounded-md p-4">
                  <div>
                    <p className="font-medium text-gray-900">{supervisor.name || 'Unnamed user'}</p>
                    <p className="text-sm text-gray-600">{supervisor.email}</p>
                  </div>
                  <p className="text-sm text-yellow-700">No region assigned</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assign Supervisor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Supervisor Role</h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAssignSupervisor} className="space-y-4">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                  Select User *
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                />
                <select
                  id="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  required
                  size={5}
                >
                  <option value="">-- Select a user --</option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || 'Unnamed'} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">{users.length} active users available</p>
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Region *
                </label>
                <select
                  id="region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  required
                >
                  <option value="">-- Select a region --</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                      {region.description && ` - ${region.description}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Assigning...' : 'Assign Supervisor'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUser('');
                    setSelectedRegion('');
                    setSearchTerm('');
                    setFormError('');
                  }}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
