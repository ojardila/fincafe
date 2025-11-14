'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CropInfo {
  id: string;
  cropType: {
    id: string;
    name: string;
  };
  variety?: {
    id: string;
    name: string;
  } | null;
}

interface Plot {
  id: string;
  name: string;
  totalArea: number;
  department: string;
  municipality: string;
  crops: CropInfo[];
  createdAt: string;
}

export default function PlotsPage() {
  const params = useParams();
  const farmCode = params?.farmCode as string;

  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchPlots = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots`);
      if (!response.ok) throw new Error('Failed to fetch plots');
      const data = await response.json();
      setPlots(data.plots);
    } catch (err) {
      setError('Failed to load plots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmCode) {
      fetchPlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmCode]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete plot');

      setPlots(plots.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete plot');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading plots...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Plot Management</h1>
        <Link
          href={`/farm/${farmCode}/plots/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Plot
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {plots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No plots found</p>
          <Link
            href={`/farm/${farmCode}/plots/new`}
            className="text-blue-600 hover:underline"
          >
            Create your first plot
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plot Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Area (ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plots.map((plot) => (
                <tr key={plot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {plot.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plot.totalArea.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plot.municipality}, {plot.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {plot.crops.length === 0 ? (
                        <span className="text-gray-400">No crops</span>
                      ) : (
                        <div className="space-y-1">
                          {plot.crops.map((crop) => (
                            <div key={crop.id}>
                              {crop.cropType.name}
                              {crop.variety && (
                                <span className="text-gray-500">
                                  {' '}
                                  - {crop.variety.name}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/farm/${farmCode}/plots/${plot.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(plot.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this plot? This action will mark the plot as inactive.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
