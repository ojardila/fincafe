'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Plot {
  id: string;
  name: string;
}

interface CropType {
  id: string;
  name: string;
}

interface HarvestCollection {
  id: string;
  plotId: string;
  cropTypeId: string;
  pickerName: string;
  kilograms: number;
  collectionDate: string;
  notes?: string;
  plot: Plot;
  cropType: CropType;
  createdAt: string;
}

export default function HarvestsPage({ params }: { params: Promise<{ farmCode: string }> }) {
  const { farmCode } = use(params);
  const router = useRouter();
  const [harvests, setHarvests] = useState<HarvestCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlot, setFilterPlot] = useState('');
  const [filterCrop, setFilterCrop] = useState('');

  useEffect(() => {
    fetchHarvests();
  }, [farmCode]);

  const fetchHarvests = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/harvests`);
      if (response.ok) {
        const data = await response.json();
        setHarvests(data);
      }
    } catch (error) {
      console.error('Error fetching harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this harvest collection?')) {
      return;
    }

    try {
      const response = await fetch(`/api/farm/${farmCode}/harvests/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHarvests();
      } else {
        alert('Failed to delete harvest collection');
      }
    } catch (error) {
      console.error('Error deleting harvest:', error);
      alert('Error deleting harvest collection');
    }
  };

  const filteredHarvests = harvests.filter((harvest) => {
    const matchesSearch = 
      harvest.pickerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.plot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.cropType.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlot = !filterPlot || harvest.plotId === filterPlot;
    const matchesCrop = !filterCrop || harvest.cropTypeId === filterCrop;
    
    return matchesSearch && matchesPlot && matchesCrop;
  });

  // Get unique plots and crop types for filters
  const uniquePlots = Array.from(new Set(harvests.map(h => h.plot.id)))
    .map(id => harvests.find(h => h.plot.id === id)!.plot);
  
  const uniqueCrops = Array.from(new Set(harvests.map(h => h.cropType.id)))
    .map(id => harvests.find(h => h.cropType.id === id)!.cropType);

  // Calculate totals
  const totalKilograms = filteredHarvests.reduce((sum, h) => sum + h.kilograms, 0);
  const totalCollections = filteredHarvests.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading harvests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harvest Collections</h1>
          <p className="text-gray-600 mt-1">Track coffee pickups by plot and picker</p>
        </div>
        <Link
          href={`/farm/${farmCode}/harvests/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + New Collection
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Collections</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalCollections}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Kilograms</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {totalKilograms.toFixed(2)} kg
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Average per Collection</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {totalCollections > 0 ? (totalKilograms / totalCollections).toFixed(2) : '0'} kg
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by picker, plot, or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filterPlot}
            onChange={(e) => setFilterPlot(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Plots</option>
            {uniquePlots.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.name}
              </option>
            ))}
          </select>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Crops</option>
            {uniqueCrops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Harvests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Picker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kilograms
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHarvests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No harvest collections found. Create your first collection to get started.
                </td>
              </tr>
            ) : (
              filteredHarvests.map((harvest) => (
                <tr key={harvest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(harvest.collectionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {harvest.pickerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {harvest.plot.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {harvest.cropType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {harvest.kilograms.toFixed(2)} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link
                      href={`/farm/${farmCode}/harvests/${harvest.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(harvest.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
