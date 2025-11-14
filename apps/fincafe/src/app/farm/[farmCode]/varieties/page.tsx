'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface CropType {
  id: string;
  name: string;
}

interface Variety {
  id: string;
  name: string;
  cropTypeId: string;
  description?: string;
  cropType: CropType;
  createdAt: string;
}

export default function VarietiesPage({ params }: { params: Promise<{ farmCode: string }> }) {
  const { farmCode } = use(params);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCropType, setFilterCropType] = useState('');

  useEffect(() => {
    fetchVarieties();
    fetchCropTypes();
  }, [farmCode]);

  const fetchVarieties = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/varieties`);
      if (response.ok) {
        const data = await response.json();
        setVarieties(data.varieties || []);
      }
    } catch (error) {
      console.error('Error fetching varieties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropTypes = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`);
      if (response.ok) {
        const data = await response.json();
        setCropTypes(data.cropTypes || []);
      }
    } catch (error) {
      console.error('Error fetching crop types:', error);
    }
  };

  const handleDelete = async (id: string, varietyName: string) => {
    if (!confirm(`Are you sure you want to delete the variety "${varietyName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/farm/${farmCode}/varieties/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVarieties();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete variety');
      }
    } catch (error) {
      console.error('Error deleting variety:', error);
      alert('Error deleting variety');
    }
  };

  const filteredVarieties = varieties.filter((variety) => {
    const matchesSearch = 
      variety.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variety.cropType.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCropType = !filterCropType || variety.cropTypeId === filterCropType;
    
    return matchesSearch && matchesCropType;
  });

  // Group varieties by crop type
  const varietiesByCropType = filteredVarieties.reduce((acc, variety) => {
    const cropTypeName = variety.cropType.name;
    if (!acc[cropTypeName]) {
      acc[cropTypeName] = [];
    }
    acc[cropTypeName].push(variety);
    return acc;
  }, {} as Record<string, Variety[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading varieties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Varieties</h1>
          <p className="text-gray-600 mt-1">Manage crop varieties</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search varieties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filterCropType}
            onChange={(e) => setFilterCropType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Crop Types</option>
            {cropTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Varieties by Crop Type */}
      <div className="space-y-6">
        {Object.entries(varietiesByCropType).length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No varieties found.</p>
          </div>
        ) : (
          Object.entries(varietiesByCropType).map(([cropTypeName, cropVarieties]) => (
            <div key={cropTypeName} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{cropTypeName}</h3>
                <p className="text-sm text-gray-600">{cropVarieties.length} varieties</p>
              </div>
              <div className="divide-y divide-gray-200">
                {cropVarieties.map((variety) => (
                  <div
                    key={variety.id}
                    className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{variety.name}</h4>
                      {variety.description && (
                        <p className="text-sm text-gray-600 mt-1">{variety.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(variety.id, variety.name)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
