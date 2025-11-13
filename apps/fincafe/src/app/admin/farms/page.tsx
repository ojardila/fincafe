'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Farm {
  id: string;
  name: string;
  code: string;
  databaseName: string;
  description: string | null;
  isActive: boolean;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms');
      if (response.ok) {
        const data = await response.json();
        setFarms(data);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete farm "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/farms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFarms(farms.filter((farm) => farm.id !== id));
      } else {
        alert('Failed to delete farm');
      }
    } catch (error) {
      console.error('Error deleting farm:', error);
      alert('Failed to delete farm');
    }
  };

  const handleInitialize = async (id: string, databaseName: string) => {
    if (
      !confirm(
        `Are you sure you want to initialize database "${databaseName}"? This will create the database and run migrations.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/farms/${id}/initialize`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Farm database initialized successfully!');
      } else {
        const data = await response.json();
        alert(`Failed to initialize: ${data.error}`);
      }
    } catch (error) {
      console.error('Error initializing farm:', error);
      alert('Failed to initialize farm database');
    }
  };

  if (loading) {
    return <div className="p-6">Loading farms...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Farms</h1>
        <Link
          href="/admin/farms/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Farm
        </Link>
      </div>

      {farms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No farms found</p>
          <Link
            href="/admin/farms/new"
            className="text-blue-600 hover:text-blue-800"
          >
            Create your first farm
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{farm.name}</h2>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {farm.code}
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    farm.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {farm.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {farm.description && (
                <p className="text-gray-600 text-sm mb-4">{farm.description}</p>
              )}

              <div className="mb-4 text-sm">
                <p className="text-gray-500">
                  <span className="font-medium">Database:</span> {farm.databaseName}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">Created by:</span>{' '}
                  {farm.createdBy.name || farm.createdBy.email}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(farm.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/farm/${farm.code}`}
                  className="flex-1 text-center bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                >
                  Open Farm
                </Link>
                <Link
                  href={`/admin/farms/${farm.id}`}
                  className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </Link>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleInitialize(farm.id, farm.databaseName)}
                  className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                >
                  Initialize DB
                </button>
                <button
                  onClick={() => handleDelete(farm.id, farm.name)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
