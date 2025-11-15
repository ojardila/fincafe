'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), { ssr: false });

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface OverallStats {
  totalKg: number;
  totalCollections: number;
  averageKgPerCollection: number;
  uniqueplotsCount: number;
  uniqueCropTypesCount: number;
  firstCollection: string | null;
  lastCollection: string | null;
}

interface CropTypeStat {
  cropTypeId: string;
  cropTypeName: string;
  totalKg: number;
  collectionsCount: number;
  averageKgPerCollection: number;
  plotsCount: number;
}

interface PlotStat {
  plotId: string;
  plotName: string;
  totalKg: number;
  collectionsCount: number;
  averageKgPerCollection: number;
  cropTypesCount: number;
}

interface WeeklyStat {
  weekLabel: string;
  totalKg: number;
  collectionsCount: number;
  averageKgPerCollection: number;
}

interface RecentCollection {
  id: string;
  collectionDate: string;
  kilograms: number;
  plotName: string;
  cropTypeName: string;
}

export default function EmployeeProfilePage({ 
  params 
}: { 
  params: Promise<{ farmCode: string; employeeId: string }> 
}) {
  const { farmCode, employeeId } = use(params);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [cropTypeStats, setCropTypeStats] = useState<CropTypeStat[]>([]);
  const [plotStats, setPlotStats] = useState<PlotStat[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [recentCollections, setRecentCollections] = useState<RecentCollection[]>([]);

  useEffect(() => {
    fetchEmployeeProfile();
  }, [farmCode, employeeId]);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/farm/${farmCode}/employees/${employeeId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data.employee);
        setOverallStats(data.overallStats);
        setCropTypeStats(data.cropTypeStats || []);
        setPlotStats(data.plotStats || []);
        setWeeklyStats(data.weeklyStats || []);
        setRecentCollections(data.recentCollections || []);
      }
    } catch (error) {
      console.error('Error fetching employee profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading employee profile...</div>
      </div>
    );
  }

  if (!employee || !overallStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Employee not found or no data available.</p>
        <Link
          href={`/farm/${farmCode}/employees`}
          className="text-green-600 hover:text-green-700 mt-4 inline-block"
        >
          ← Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/farm/${farmCode}/employees`}
          className="text-green-600 hover:text-green-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Employees
        </Link>
        <Link
          href={`/farm/${farmCode}/users/${employeeId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit Employee
        </Link>
      </div>

      {/* Employee Profile Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                <span className="text-green-600 font-bold text-4xl">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-6 text-white">
              <h1 className="text-3xl font-bold">{employee.name}</h1>
              <p className="text-green-100 mt-1">{employee.role}</p>
              <p className="text-green-100 text-sm mt-1">{employee.email}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Employee Since</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {new Date(employee.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            {overallStats.firstCollection && (
              <div>
                <p className="text-sm text-gray-600">First Harvest</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(overallStats.firstCollection).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
            {overallStats.lastCollection && (
              <div>
                <p className="text-sm text-gray-600">Last Harvest</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(overallStats.lastCollection).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Harvested</div>
          <div className="text-3xl font-bold text-green-600 mt-1">
            {overallStats.totalKg.toFixed(2)} kg
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Collections</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">
            {overallStats.totalCollections}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Avg per Collection</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">
            {overallStats.averageKgPerCollection.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Plots Worked</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">
            {overallStats.uniqueplotsCount}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Crop Types</div>
          <div className="text-3xl font-bold text-teal-600 mt-1">
            {overallStats.uniqueCropTypesCount}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Line Chart */}
        {weeklyStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance (Last 12 Weeks)</h3>
            <div className="h-80">
              <Line
                data={{
                  labels: weeklyStats.map(s => s.weekLabel),
                  datasets: [
                    {
                      label: 'Total Kg',
                      data: weeklyStats.map(s => s.totalKg),
                      borderColor: 'rgba(34, 197, 94, 1)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                      yAxisID: 'y',
                    },
                    {
                      label: 'Collections',
                      data: weeklyStats.map(s => s.collectionsCount),
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Kilograms'
                      },
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Collections'
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Crop Type Distribution */}
        {cropTypeStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution by Crop Type</h3>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: cropTypeStats.map(s => s.cropTypeName),
                  datasets: [
                    {
                      label: 'Total Kg',
                      data: cropTypeStats.map(s => s.totalKg),
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
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

        {/* Plot Performance Bar Chart */}
        {plotStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Plot</h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: plotStats.map(s => s.plotName),
                  datasets: [
                    {
                      label: 'Total Kg',
                      data: plotStats.map(s => s.totalKg),
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

      {/* Detailed Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Type Stats Table */}
        {cropTypeStats.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Statistics by Crop Type</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Kg
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collections
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Kg
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cropTypeStats.map((stat, index) => (
                    <tr key={stat.cropTypeId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.cropTypeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.totalKg.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.collectionsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.averageKgPerCollection.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plot Stats Table */}
        {plotStats.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Statistics by Plot</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Kg
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collections
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Kg
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plotStats.map((stat, index) => (
                    <tr key={stat.plotId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.plotName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.totalKg.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.collectionsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.averageKgPerCollection.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Collections */}
      {recentCollections.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Collections</h2>
            <p className="text-sm text-gray-600 mt-1">Last 10 harvest collections</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kilograms
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCollections.map((collection, index) => (
                  <tr key={collection.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(collection.collectionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.plotName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.cropTypeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {collection.kilograms.toFixed(2)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {overallStats.totalCollections === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No harvest data yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            This employee hasn't recorded any harvest collections yet.
          </p>
        </div>
      )}
    </div>
  );
}
