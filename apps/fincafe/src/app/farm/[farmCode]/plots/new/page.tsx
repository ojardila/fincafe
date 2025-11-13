'use client';

import { useParams, useRouter } from 'next/navigation';
import PlotForm from '../PlotForm';

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

export default function NewPlotPage() {
  const params = useParams();
  const router = useRouter();
  const farmCode = params?.farmCode as string;

  const handleSubmit = async (data: PlotFormData) => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create plot');
      }

      router.push(`/farm/${farmCode}/plots`);
    } catch (error) {
      console.error('Error creating plot:', error);
      alert('Failed to create plot');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Plot</h1>
        <p className="text-gray-600 mt-2">
          Add a new plot to your farm management system
        </p>
      </div>

      <PlotForm
        farmCode={farmCode}
        onSubmit={handleSubmit}
        submitLabel="Create Plot"
      />
    </div>
  );
}
