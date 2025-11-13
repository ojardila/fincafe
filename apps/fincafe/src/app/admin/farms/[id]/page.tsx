'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import FarmForm from '../FarmForm';

interface Farm {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export default function EditFarmPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFarm = useCallback(async () => {
    try {
      const response = await fetch(`/api/farms/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFarm(data);
      }
    } catch (error) {
      console.error('Error fetching farm:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchFarm();
  }, [fetchFarm]);

  if (loading) {
    return <div className="p-6">Loading farm...</div>;
  }

  if (!farm || !user) {
    return <div className="p-6">Farm not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Farm</h1>
      <FarmForm initialData={farm} createdById={user.id} />
    </div>
  );
}
