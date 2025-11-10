'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

interface RoleFormProps {
  role?: {
    id: string;
    name: string;
    description: string | null;
    permissions: Permission[];
  };
}

export default function RoleForm({ role }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissionIds: role?.permissions.map((p) => p.id) || [],
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = role ? `/api/roles/${role.id}` : '/api/roles';
      const method = role ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save role');
      }

      router.push('/admin/roles');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {role ? 'Edit Role' : 'Create New Role'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          {role ? 'Update role information and permissions' : 'Add a new role to the system'}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Role Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="e.g., manager, viewer"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="Describe the role's purpose"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Permissions</h2>
          
          {Object.keys(groupedPermissions).length === 0 ? (
            <p className="text-sm text-gray-500">Loading permissions...</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                    {resource}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {perm.name}
                          </span>
                          {perm.description && (
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-x-4">
          <Link
            href="/admin/roles"
            className="text-sm font-semibold text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
