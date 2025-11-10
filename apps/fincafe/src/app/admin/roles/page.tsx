'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  _count: {
    users: number;
  };
  createdAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete role');
      }
      
      setRoles(roles.filter((role) => role.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

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
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage roles and their permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/roles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Role
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No roles found
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role.name}
                  </h3>
                  {role.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{role._count.users}</span>{' '}
                  user(s) • {' '}
                  <span className="font-medium">{role.permissions.length}</span>{' '}
                  permission(s)
                </div>
              </div>

              {role.permissions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Permissions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700"
                      >
                        {perm.name}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/admin/roles/${role.id}`}
                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                >
                  Edit
                </Link>
                {deleteConfirm === role.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(role.id)}
                    disabled={role._count.users > 0}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      role._count.users > 0
                        ? 'Cannot delete role with assigned users'
                        : 'Delete role'
                    }
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
