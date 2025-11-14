'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface CropType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  varieties: Array<{ id: string; name: string }>;
}

export default function CropTypesPage({ params }: { params: Promise<{ farmCode: string }> }) {
  const { farmCode } = use(params);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCropType, setShowNewCropType] = useState(false);
  const [newCropTypeName, setNewCropTypeName] = useState('');
  const [newCropTypeDesc, setNewCropTypeDesc] = useState('');

  useEffect(() => {
    fetchCropTypes();
  }, [farmCode]);

  const fetchCropTypes = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`);
      if (response.ok) {
        const data = await response.json();
        setCropTypes(data.cropTypes || []);
      }
    } catch (error) {
      console.error('Error fetching crop types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCropTypeName.trim()) return;

    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCropTypeName,
          description: newCropTypeDesc || undefined
        }),
      });

      if (response.ok) {
        fetchCropTypes();
        setNewCropTypeName('');
        setNewCropTypeDesc('');
        setShowNewCropType(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create crop type');
      }
    } catch (error) {
      console.error('Error creating crop type:', error);
      alert('Error creating crop type');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCropTypes();
      } else {
        const error = await response.json();
        alert(error.details || error.error || 'Failed to delete crop type');
      }
    } catch (error) {
      console.error('Error deleting crop type:', error);
      alert('Error deleting crop type');
    }
  };

  const filteredCropTypes = cropTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading crop types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop Types</h1>
          <p className="text-gray-600 mt-1">Manage crop types and their varieties</p>
        </div>
        <button
          onClick={() => setShowNewCropType(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + New Crop Type
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search crop types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Crop Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCropTypes.length === 0 ? (
          <div className="col-span-full bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No crop types found. Create your first crop type to get started.</p>
          </div>
        ) : (
          filteredCropTypes.map((cropType) => (
            <div
              key={cropType.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{cropType.name}</h3>
                <button
                  onClick={() => handleDelete(cropType.id, cropType.name)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="Delete crop type"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {cropType.description && (
                <p className="text-sm text-gray-600 mt-2">{cropType.description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {cropType.varieties?.length || 0} varieties
                  </span>
                  <Link
                    href={`/farm/${farmCode}/varieties?cropType=${cropType.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Varieties →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Crop Type Modal */}
      {showNewCropType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Crop Type</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCropTypeName}
                  onChange={(e) => setNewCropTypeName(e.target.value)}
                  placeholder="Enter crop type name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newCropTypeDesc}
                  onChange={(e) => setNewCropTypeDesc(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNewCropType(false);
                  setNewCropTypeName('');
                  setNewCropTypeDesc('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
