'use client';

import { useState, useEffect, useCallback } from 'react';
import FarmUserForm from '../FarmUserForm';

interface User {
  id: string;
  email: string;
  name: string | null;
  roleId?: string | null;
}

export default function EditFarmUserPage({
  params,
}: {
  params: { farmCode: string; id: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/farm/${params.farmCode}/users/${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [params.farmCode, params.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return <div className="p-6">Loading user...</div>;
  }

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <FarmUserForm farmCode={params.farmCode} initialData={user} />
    </div>
  );
}
