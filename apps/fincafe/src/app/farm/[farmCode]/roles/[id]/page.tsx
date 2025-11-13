'use client';

import { useState, useEffect, useCallback } from 'react';
import FarmRoleForm from '../FarmRoleForm';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    id: string;
    name: string;
    resource: string;
    action: string;
    description: string | null;
  }>;
}

export default function EditFarmRolePage({
  params,
}: {
  params: { farmCode: string; id: string };
}) {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/farm/${params.farmCode}/roles/${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setRole(data);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    } finally {
      setLoading(false);
    }
  }, [params.farmCode, params.id]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  if (loading) {
    return <div className="p-6">Loading role...</div>;
  }

  if (!role) {
    return <div className="p-6">Role not found</div>;
  }

  return <FarmRoleForm farmCode={params.farmCode} role={role} />;
}
