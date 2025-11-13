'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Role {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
  permissionCount: number;
  permissions: Array<{
    id: string;
    name: string;
  }>;
}

export default function FarmRolesPage({
  params,
}: {
  params: { farmCode: string };
}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch(`/api/farm/${params.farmCode}/roles`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  }, [params.farmCode]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (id: string, name: string, userCount: number) => {
    if (userCount > 0) {
      alert(`Cannot delete role "${name}". It is assigned to ${userCount} user(s).`);
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/farm/${params.farmCode}/roles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRoles(roles.filter((role) => role.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    }
  };

  if (loading) {
    return <div className="p-6">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Roles Management</h1>
            <p className="text-lg text-gray-600">Manage access levels and permissions for your team</p>
          </div>
          <Link
            href={`/farm/${params.farmCode}/roles/new`}
            className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create New Role</span>
          </Link>
        </div>
      </div>

      {roles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No roles found</h3>
            <p className="text-gray-600 mb-6 text-lg">Get started by creating your first role to manage team permissions</p>
            <Link
              href={`/farm/${params.farmCode}/roles/new`}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Your First Role</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-green-300 transition-all flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{role.name}</h2>
                  {role.description && (
                    <p className="text-gray-600 text-base leading-relaxed">{role.description}</p>
                  )}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ml-4">
                  {role.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-700 font-medium text-lg">Users</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{role.userCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-gray-700 font-medium text-lg">Permissions</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{role.permissionCount}</span>
                </div>
              </div>

              {role.permissions.length > 0 && (
                <div className="mb-6 flex-grow">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center bg-green-100 text-green-800 text-sm px-4 py-2 rounded-lg font-medium"
                      >
                        {perm.name}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg font-medium">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-auto pt-6 border-t-2 border-gray-100">
                <Link
                  href={`/farm/${params.farmCode}/roles/${role.id}`}
                  className="flex-1 text-center bg-green-600 text-white px-4 py-3 rounded-xl text-base font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Edit Role
                </Link>
                <button
                  onClick={() => handleDelete(role.id, role.name, role.userCount)}
                  disabled={role.userCount > 0}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl text-base font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                  title={
                    role.userCount > 0
                      ? `Cannot delete: ${role.userCount} user(s) assigned`
                      : 'Delete role'
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
