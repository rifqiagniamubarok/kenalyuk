/**
 * RegionManager component - manage regions with CRUD operations
 * Used by SUPERADMIN to create, edit, and delete regions
 */

'use client';

import { useState, useEffect } from 'react';

interface Region {
  id: string;
  name: string;
  description: string | null;
  _count?: {
    users: number;
    supervisors: number;
  };
}

export default function RegionManager() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load regions
  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/regions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load regions');
      }

      setRegions(data.regions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load regions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', description: '' });
    setEditingRegion(null);
    setFormError('');
    setShowCreateModal(true);
  };

  const handleEdit = (region: Region) => {
    setFormData({ name: region.name, description: region.description || '' });
    setEditingRegion(region);
    setFormError('');
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const url = '/api/regions';
      const method = editingRegion ? 'PUT' : 'POST';
      const body = editingRegion ? { id: editingRegion.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save region');
      }

      // Optimistic UI update
      if (editingRegion) {
        setRegions(regions.map((r) => (r.id === editingRegion.id ? { ...r, ...data.region } : r)));
      } else {
        setRegions([...regions, data.region]);
      }

      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save region');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (region: Region) => {
    if (!confirm(`Are you sure you want to delete "${region.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/regions?id=${region.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete region');
      }

      // Optimistic UI update
      setRegions(regions.filter((r) => r.id !== region.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete region');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading regions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={loadRegions} className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
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
          <h2 className="text-2xl font-bold text-gray-900">Regions</h2>
          <p className="text-gray-600 mt-1">{regions.length} regions configured</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
        >
          + Create Region
        </button>
      </div>

      {/* Regions List */}
      <div className="grid gap-4">
        {regions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No regions configured yet</p>
            <button onClick={handleCreate} className="mt-4 text-purple-600 hover:text-purple-700 font-medium">
              Create your first region
            </button>
          </div>
        ) : (
          regions.map((region) => (
            <div key={region.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{region.name}</h3>
                  {region.description && <p className="text-gray-600 mt-1">{region.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{region._count?.users || 0} users</span>
                    <span>•</span>
                    <span>{region._count?.supervisors || 0} supervisors</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(region)}
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-md transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(region)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingRegion ? 'Edit Region' : 'Create Region'}</h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Region Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="e.g., Jakarta, Bandung"
                  required
                  minLength={3}
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-gray-500">3-50 characters, must be unique</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Saving...' : editingRegion ? 'Update Region' : 'Create Region'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
