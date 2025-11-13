'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function FarmLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ farmCode: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { farmCode } = use(params);
  const [farmInfo, setFarmInfo] = useState<{ name: string; code: string } | null>(
    null
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ 
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Fetch farm information
    fetch(`/api/farms?code=${farmCode}`)
      .then((res) => res.json())
      .then((farms) => {
        const farm = farms.find((f: { code: string }) => f.code === farmCode);
        if (farm) {
          setFarmInfo({ name: farm.name, code: farm.code });
        }
      })
      .catch((error) => console.error('Error fetching farm info:', error));

    // Fetch actual user data from profile API
    fetch(`/api/farm/${farmCode}/profile`)
      .then((res) => res.json())
      .then((data) => {
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          name: data.name,
          email: data.email,
        });
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
        // Fallback to default if API fails
        setUser({
          firstName: null,
          lastName: null,
          name: 'User',
          email: 'user@example.com',
        });
      });
  }, [farmCode]);

  const handleLogout = () => {
    // Clear session and redirect to farm login
    router.push('/farm-login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {farmInfo?.name.charAt(0).toUpperCase() || 'F'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {farmInfo ? farmInfo.name : farmCode}
                  </h1>
                  <span className="text-sm text-gray-500 font-medium">
                    {farmCode}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 transition-colors border-2 border-transparent hover:border-gray-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  {user?.firstName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email || 'user@example.com'}</p>
                    </div>
                    
                    <Link
                      href={`/farm/${farmCode}/profile`}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">My Profile</span>
                    </Link>

                    <Link
                      href={`/farm/${farmCode}/settings`}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          <aside className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Navigation
              </h2>
              <nav className="space-y-2">
                <Link
                  href={`/farm/${farmCode}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(`/farm/${farmCode}`)
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  href={`/farm/${farmCode}/plots`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    pathname?.startsWith(`/farm/${farmCode}/plots`)
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 17a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" />
                  </svg>
                  <span className="font-medium">Plots</span>
                </Link>
                <Link
                  href={`/farm/${farmCode}/users`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    pathname?.startsWith(`/farm/${farmCode}/users`)
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium">Users</span>
                </Link>
                <Link
                  href={`/farm/${farmCode}/roles`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    pathname?.startsWith(`/farm/${farmCode}/roles`)
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Roles</span>
                </Link>
                <Link
                  href={`/farm/${farmCode}/permissions`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    pathname?.startsWith(`/farm/${farmCode}/permissions`)
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Permissions</span>
                </Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
