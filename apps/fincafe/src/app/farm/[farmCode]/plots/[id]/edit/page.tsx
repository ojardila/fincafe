'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlotForm from '../../PlotForm';

interface PlotFormData {
  name: string;
  totalArea: string;
  department: string;
  municipality: string;
  map: string;
  crops: Array<{
    cropTypeId: string;
    varietyId?: string;
  }>;
}

export default function EditPlotPage() {
  const params = useParams();
  const router = useRouter();
  const farmCode = params?.farmCode as string;
  const plotId = params?.id as string;

  const [initialData, setInitialData] = useState<PlotFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farmCode && plotId) {
      fetchPlot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmCode, plotId]);

  const fetchPlot = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots/${plotId}`);
      if (!response.ok) throw new Error('Failed to fetch plot');
      
      const data = await response.json();
      setInitialData({
        name: data.plot.name,
        totalArea: data.plot.totalArea.toString(),
        department: data.plot.department,
        municipality: data.plot.municipality,
        map: data.plot.map || '',
        crops: data.plot.crops.map((crop: { cropType: { id: string }; variety?: { id: string } | null }) => ({
          cropTypeId: crop.cropType.id,
          varietyId: crop.variety?.id || '',
        })),
      });
    } catch (error) {
      console.error('Error fetching plot:', error);
      alert('Failed to load plot data');
      router.push(`/farm/${farmCode}/plots`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PlotFormData) => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots/${plotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update plot');
      }

      router.push(`/farm/${farmCode}/plots`);
    } catch (error) {
      console.error('Error updating plot:', error);
      alert('Failed to update plot');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading plot data...</div>
      </div>
    );
  }

  if (!initialData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Plot</h1>
        <p className="text-gray-600 mt-2">
          Update plot information in your farm management system
        </p>
      </div>

      <PlotForm
        farmCode={farmCode}
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="Update Plot"
      />
    </div>
  );
}
