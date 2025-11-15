'use client';

import { use, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface EmployeeStats {
  pickerName: string;
  totalKg: number;
  collectionsCount: number;
  averageKgPerCollection: number;
  plotsCount: number;
  lastCollectionDate: string;
}

interface CropTypeStats {
  cropTypeName: string;
  totalKg: number;
  collectionsCount: number;
  averageKgPerCollection: number;
  plotsCount: number;
  employeesCount: number;
}

interface OverviewStats {
  totalKg: number;
  totalCollections: number;
  totalEmployees: number;
  totalCropTypes: number;
  totalPlots: number;
  averageKgPerCollection: number;
}

export default function HarvestStatsPage({ params }: { params: Promise<{ farmCode: string }> }) {
  const { farmCode } = use(params);
  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [cropTypeStats, setCropTypeStats] = useState<CropTypeStats[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [sortEmployeeBy, setSortEmployeeBy] = useState<'kg' | 'collections' | 'name'>('kg');
  const [sortCropBy, setSortCropBy] = useState<'kg' | 'collections' | 'name'>('kg');
  
  // Date filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Crop filter states
  const [cropTypes, setCropTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCropTypeId, setSelectedCropTypeId] = useState<string>('');
  
  // Plot filter states
  const [plots, setPlots] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');

  useEffect(() => {
    fetchCropTypes();
    fetchPlots();
  }, [farmCode]);

  useEffect(() => {
    fetchStats();
  }, [farmCode, startDate, endDate, selectedCropTypeId, selectedPlotId]);

  const fetchCropTypes = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`);
      if (response.ok) {
        const data = await response.json();
        setCropTypes(data.cropTypes || data || []);
      }
    } catch (error) {
      console.error('Error fetching crop types:', error);
    }
  };

  const fetchPlots = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots`);
      if (response.ok) {
        const data = await response.json();
        setPlots(data.plots || data || []);
      }
    } catch (error) {
      console.error('Error fetching plots:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedCropTypeId) params.append('cropTypeId', selectedCropTypeId);
      if (selectedPlotId) params.append('plotId', selectedPlotId);
      
      const response = await fetch(`/api/farm/${farmCode}/harvest-stats?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeStats(data.employeeStats || []);
        setCropTypeStats(data.cropTypeStats || []);
        setOverviewStats(data.overviewStats || null);
      }
    } catch (error) {
      console.error('Error fetching harvest stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCropTypeId('');
    setSelectedPlotId('');
  };

  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = '';

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split('T')[0];
        break;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split('T')[0];
        break;
      }
      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        start = yearAgo.toISOString().split('T')[0];
        break;
      }
    }

    setStartDate(start);
    setEndDate(end);
  };

  const sortedEmployeeStats = [...employeeStats].sort((a, b) => {
    if (sortEmployeeBy === 'kg') return b.totalKg - a.totalKg;
    if (sortEmployeeBy === 'collections') return b.collectionsCount - a.collectionsCount;
    return a.pickerName.localeCompare(b.pickerName);
  });

  const sortedCropTypeStats = [...cropTypeStats].sort((a, b) => {
    if (sortCropBy === 'kg') return b.totalKg - a.totalKg;
    if (sortCropBy === 'collections') return b.collectionsCount - a.collectionsCount;
    return a.cropTypeName.localeCompare(b.cropTypeName);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Harvest Statistics</h1>
        <p className="text-gray-600 mt-2">Overview of harvest metrics by employee and crop type</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Quick filters:</span>
            <button
              onClick={() => setDatePreset('today')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setDatePreset('week')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setDatePreset('month')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setDatePreset('year')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Last year
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
              <select
                value={selectedCropTypeId}
                onChange={(e) => setSelectedCropTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Crop Types</option>
                {cropTypes.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plot</label>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Plots</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
            {(startDate || endDate || selectedCropTypeId || selectedPlotId) && (
              <div className="text-sm text-gray-600 w-full">
                Showing data {startDate && `from ${new Date(startDate).toLocaleDateString()}`}
                {startDate && endDate && ' '}
                {endDate && `to ${new Date(endDate).toLocaleDateString()}`}
                {selectedCropTypeId && (
                  <span>
                    {' • '}Crop: {cropTypes.find(c => c.id === selectedCropTypeId)?.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Kilograms</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{overviewStats.totalKg.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Collections</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{overviewStats.totalCollections}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Employees</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">{overviewStats.totalEmployees}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Crop Types</div>
            <div className="text-3xl font-bold text-orange-600 mt-1">{overviewStats.totalCropTypes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Plots Used</div>
            <div className="text-3xl font-bold text-indigo-600 mt-1">{overviewStats.totalPlots}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Avg per Collection</div>
            <div className="text-3xl font-bold text-teal-600 mt-1">{overviewStats.averageKgPerCollection.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Performance Bar Chart */}
        {sortedEmployeeStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers by Total Kg</h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: sortedEmployeeStats.slice(0, 10).map(s => s.pickerName),
                  datasets: [
                    {
                      label: 'Total Kg',
                      data: sortedEmployeeStats.slice(0, 10).map(s => s.totalKg),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgba(34, 197, 94, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value + ' kg';
                        }
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Crop Type Distribution Doughnut Chart */}
        {sortedCropTypeStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Distribution by Crop Type</h3>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: sortedCropTypeStats.map(s => s.cropTypeName),
                  datasets: [
                    {
                      label: 'Total Kg',
                      data: sortedCropTypeStats.map(s => s.totalKg),
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(251, 146, 60, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(14, 165, 233, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value.toFixed(2)} kg (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Collections Count by Employee */}
        {sortedEmployeeStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Collections Count by Employee</h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: sortedEmployeeStats.slice(0, 10).map(s => s.pickerName),
                  datasets: [
                    {
                      label: 'Collections',
                      data: sortedEmployeeStats.slice(0, 10).map(s => s.collectionsCount),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Average Kg per Collection Comparison */}
        {sortedEmployeeStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Efficiency (Kg per Collection)</h3>
            <div className="h-80">
              <Line
                data={{
                  labels: sortedEmployeeStats.slice(0, 10).map(s => s.pickerName),
                  datasets: [
                    {
                      label: 'Avg Kg/Collection',
                      data: sortedEmployeeStats.slice(0, 10).map(s => s.averageKgPerCollection),
                      borderColor: 'rgba(168, 85, 247, 1)',
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value + ' kg';
                        }
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Employee Stats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employee Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Harvest metrics by employee</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortEmployeeBy('kg')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sortEmployeeBy === 'kg'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sort by Kg
            </button>
            <button
              onClick={() => setSortEmployeeBy('collections')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sortEmployeeBy === 'collections'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sort by Collections
            </button>
            <button
              onClick={() => setSortEmployeeBy('name')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sortEmployeeBy === 'name'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sort by Name
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Kg
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collections
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Kg/Collection
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plots Worked
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Collection
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEmployeeStats.map((stat, index) => (
                <tr key={stat.pickerName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold">{stat.pickerName.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stat.pickerName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-green-600">{stat.totalKg.toFixed(2)} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.collectionsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.averageKgPerCollection.toFixed(1)} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.plotsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600">
                      {new Date(stat.lastCollectionDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedEmployeeStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No employee data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop Type Stats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Crop Type Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Harvest metrics by crop type</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortCropBy('kg')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sortCropBy === 'kg'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sort by Kg
            </button>
            <button
              onClick={() => setSortCropBy('collections')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sortCropBy === 'collections'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sort by Collections
            </button>
            <button
              onClick={() => setSortCropBy('name')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                sortCropBy === 'name'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sort by Name
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Kg
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collections
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Kg/Collection
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plots
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCropTypeStats.map((stat, index) => (
                <tr key={stat.cropTypeName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stat.cropTypeName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-green-600">{stat.totalKg.toFixed(2)} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.collectionsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.averageKgPerCollection.toFixed(1)} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.plotsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{stat.employeesCount}</div>
                  </td>
                </tr>
              ))}
              {sortedCropTypeStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No crop type data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
