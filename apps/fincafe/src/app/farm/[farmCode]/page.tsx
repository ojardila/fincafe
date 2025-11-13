'use client';

import { useEffect, useState, useCallback } from 'react';

export default function FarmDashboard({
  params,
}: {
  params: { farmCode: string };
}) {
  const [stats, setStats] = useState({
    userCount: 0,
    loading: true,
    needsInitialization: false,
  });

  const fetchStats = useCallback(async () => {
    try {
      const usersResponse = await fetch(`/api/farm/${params.farmCode}/users`);
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        setStats({
          userCount: users.length,
          loading: false,
          needsInitialization: false,
        });
      } else if (usersResponse.status === 503) {
        const data = await usersResponse.json();
        setStats({
          userCount: 0,
          loading: false,
          needsInitialization: data.needsInitialization || false,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [params.farmCode]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (stats.loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (stats.needsInitialization) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Farm Dashboard</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong className="font-medium text-yellow-800">
                  Database Not Initialized
                </strong>
                <br />
                This farm&apos;s database needs to be initialized before you can use it.
                Please return to the admin panel and click &quot;Initialize DB&quot; on this
                farm.
              </p>
              <div className="mt-3">
                <a
                  href="/admin/farms"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Go to Farms Management
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-lg text-gray-600">Here&apos;s an overview of your farm operations</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2 opacity-90">Total Users</h3>
          <p className="text-5xl font-bold">{stats.userCount}</p>
          <p className="text-sm opacity-75 mt-2">Active team members</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2 opacity-90">Farm Code</h3>
          <p className="text-3xl font-bold break-all">{params.farmCode}</p>
          <p className="text-sm opacity-75 mt-2">Unique identifier</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2 opacity-90">Database</h3>
          <p className="text-2xl font-bold break-all">customer_{params.farmCode}</p>
          <p className="text-sm opacity-75 mt-2">Isolated storage</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2 opacity-90">Status</h3>
          <p className="text-4xl font-bold">Active</p>
          <p className="text-sm opacity-75 mt-2">Fully operational</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-500 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Your Farm!</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              This is your farm-specific workspace with complete isolation and security. 
              Each farm has its own database and user management system. Use the navigation 
              menu to manage users, roles, and permissions for your team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
