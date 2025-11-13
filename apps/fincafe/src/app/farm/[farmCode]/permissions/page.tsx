'use client';

import { useState, useEffect, useCallback } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  roles: Array<{
    id: string;
    name: string;
  }>;
}

export default function FarmPermissionsPage({
  params,
}: {
  params: { farmCode: string };
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/farm/${params.farmCode}/permissions`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [params.farmCode]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return <div className="p-6">Loading permissions...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <p className="text-gray-600 mt-2">
          View all available permissions in this farm. Permissions are assigned through roles.
        </p>
      </div>

      {Object.keys(groupedPermissions).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No permissions found in this farm</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="bg-white border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 capitalize">{resource}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Permission
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Roles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {perms.map((perm) => (
                      <tr key={perm.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {perm.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                            {perm.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {perm.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {perm.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {perm.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                                >
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No roles</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
