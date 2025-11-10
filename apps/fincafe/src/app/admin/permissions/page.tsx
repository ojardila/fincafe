'use client';

import { useState, useEffect } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  _count: {
    roles: number;
  };
  createdAt: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
        <p className="mt-2 text-sm text-gray-700">
          View all available permissions in the system
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <div key={resource} className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {resource}
              </h2>
            </div>
            <div className="px-6 py-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                      Permission
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                      Action
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                      Description
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                      Roles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {perms.map((perm) => (
                    <tr key={perm.id} className="hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium text-gray-900">
                        {perm.name}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {perm.action}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {perm.description || 'N/A'}
                      </td>
                      <td className="py-3 text-sm text-gray-500 text-right">
                        {perm._count.roles} role(s)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
