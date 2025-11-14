'use client';

import { use, useEffect, useState } from 'react';
import HarvestForm from '../../HarvestForm';

interface HarvestData {
  id: string;
  plotId: string;
  cropTypeId: string;
  pickerName: string;
  kilograms: number;
  collectionDate: string;
  notes?: string;
}

export default function EditHarvestPage({ 
  params 
}: { 
  params: Promise<{ farmCode: string; id: string }> 
}) {
  const { farmCode, id } = use(params);
  const [harvest, setHarvest] = useState<HarvestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHarvest();
  }, [farmCode, id]);

  const fetchHarvest = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/harvests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setHarvest(data);
      } else {
        alert('Failed to fetch harvest collection');
      }
    } catch (error) {
      console.error('Error fetching harvest:', error);
      alert('Error fetching harvest collection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading harvest...</div>
      </div>
    );
  }

  if (!harvest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Harvest not found</h2>
        <p className="text-gray-600 mt-2">The harvest collection you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Harvest Collection</h1>
        <p className="text-gray-600 mt-1">Update harvest collection details</p>
      </div>

      <HarvestForm farmCode={farmCode} initialData={harvest} />
    </div>
  );
}
