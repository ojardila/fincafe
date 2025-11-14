'use client';

import { use, useState, useEffect } from 'react';

interface HarvestCollection {
  id: string;
  plotId: string;
  cropTypeId: string;
  pickerName: string;
  kilograms: number;
  collectionDate: string;
  notes?: string;
  plot: {
    id: string;
    name: string;
  };
  cropType: {
    id: string;
    name: string;
  };
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayNum: number;
}

export default function HarvestSeasonPage({ params }: { params: Promise<{ farmCode: string }> }) {
  const { farmCode } = use(params);
  const [harvests, setHarvests] = useState<HarvestCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterPlot, setFilterPlot] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState<HarvestCollection | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [plots, setPlots] = useState<Array<{ id: string; name: string }>>([]);
  const [cropTypes, setCropTypes] = useState<Array<{ id: string; name: string }>>([]);
  
  // Autocomplete states for Add Modal
  const [plotSearchTerm, setPlotSearchTerm] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [showPlotDropdown, setShowPlotDropdown] = useState(false);
  const [cropTypeSearchTerm, setCropTypeSearchTerm] = useState('');
  const [selectedCropTypeId, setSelectedCropTypeId] = useState('');
  const [showCropTypeDropdown, setShowCropTypeDropdown] = useState(false);

  useEffect(() => {
    fetchHarvests();
    fetchPlots();
    fetchCropTypes();
  }, [farmCode, selectedWeek]);

  const fetchPlots = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots`);
      if (response.ok) {
        const data = await response.json();
        setPlots(data.plots || []);
      }
    } catch (error) {
      console.error('Error fetching plots:', error);
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

  const fetchHarvests = async () => {
    try {
      const { startDate, endDate } = getWeekRange(selectedWeek);
      const response = await fetch(
        `/api/farm/${farmCode}/harvests?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setHarvests(data.harvests || []);
      }
    } catch (error) {
      console.error('Error fetching harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { startDate: start, endDate: end };
  };

  const getWeekDays = (): WeekDay[] => {
    const { startDate } = getWeekRange(selectedWeek);
    const days: WeekDay[] = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date,
        dayName: dayNames[i],
        dayNum: date.getDate(),
      });
    }

    return days;
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction * 7));
    setSelectedWeek(newDate);
  };

  const handleCellClick = (employee: string, date: Date, harvest?: HarvestCollection) => {
    if (harvest) {
      // Edit existing harvest
      setSelectedHarvest(harvest);
      setShowEditModal(true);
    } else {
      // Add new harvest - reset autocomplete states
      setSelectedEmployee(employee);
      setSelectedDate(date);
      setPlotSearchTerm('');
      setSelectedPlotId('');
      setShowPlotDropdown(false);
      setCropTypeSearchTerm('');
      setSelectedCropTypeId('');
      setShowCropTypeDropdown(false);
      setShowAddModal(true);
    }
  };

  const handleDeleteHarvest = async (harvestId: string) => {
    if (!confirm('Are you sure you want to delete this harvest collection?')) {
      return;
    }

    try {
      const response = await fetch(`/api/farm/${farmCode}/harvests/${harvestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHarvests();
        setShowEditModal(false);
      } else {
        alert('Failed to delete harvest');
      }
    } catch (error) {
      console.error('Error deleting harvest:', error);
      alert('Error deleting harvest');
    }
  };

  // Group harvests by employee
  const groupedByEmployee = harvests.reduce((acc, harvest) => {
    if (!acc[harvest.pickerName]) {
      acc[harvest.pickerName] = [];
    }
    acc[harvest.pickerName].push(harvest);
    return acc;
  }, {} as Record<string, HarvestCollection[]>);

  const employees = Object.keys(groupedByEmployee).sort();
  
  // Apply filters
  const filteredHarvests = harvests.filter(harvest => {
    if (filterEmployee && !harvest.pickerName.toLowerCase().includes(filterEmployee.toLowerCase())) return false;
    if (filterPlot && !harvest.plot.name.toLowerCase().includes(filterPlot.toLowerCase())) return false;
    return true;
  });

  // Regroup after filtering
  const filteredGroupedByEmployee = filteredHarvests.reduce((acc, harvest) => {
    if (!acc[harvest.pickerName]) {
      acc[harvest.pickerName] = [];
    }
    acc[harvest.pickerName].push(harvest);
    return acc;
  }, {} as Record<string, HarvestCollection[]>);

  const filteredEmployees = Object.keys(filteredGroupedByEmployee).sort();
  const weekDays = getWeekDays();

  // Get harvest data for a specific employee, day, and plot
  const getHarvestData = (employeeName: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredHarvests.filter(
      (h) =>
        h.pickerName === employeeName &&
        h.collectionDate.split('T')[0] === dateStr
    );
  };

  // Calculate column totals (per day)
  const getColumnTotal = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredHarvests
      .filter((h) => h.collectionDate.split('T')[0] === dateStr)
      .reduce((sum, h) => sum + h.kilograms, 0);
  };

  // Calculate row totals (per employee)
  const getRowTotal = (employeeName: string) => {
    return filteredGroupedByEmployee[employeeName].reduce((sum, h) => sum + h.kilograms, 0);
  };

  // Calculate grand total
  const grandTotal = filteredHarvests.reduce((sum, h) => sum + h.kilograms, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading harvest data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harvest Season</h1>
          <p className="text-gray-600 mt-1">Weekly harvest collections by employee</p>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeWeek(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Previous Week
          </button>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {weekDays[0].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600">
              Week of {weekDays[0].date.toLocaleDateString()} - {weekDays[6].date.toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => changeWeek(1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Employee
            </label>
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="Type employee name..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
            {filterEmployee && (
              <div className="text-xs text-gray-500 mt-1">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Plot
            </label>
            <input
              type="text"
              value={filterPlot}
              onChange={(e) => setFilterPlot(e.target.value)}
              placeholder="Type plot name..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
            {filterPlot && (
              <div className="text-xs text-gray-500 mt-1">
                Filtering by plot name
              </div>
            )}
          </div>
          {(filterEmployee || filterPlot) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterEmployee('');
                  setFilterPlot('');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Harvest Matrix */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No harvest collections found for this week.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Employee
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.date.toISOString()}
                      className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                    >
                      <div className="font-semibold text-gray-700">{day.dayName}</div>
                      <div className="text-gray-400 font-normal text-lg">{day.dayNum}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {employee}
                    </td>
                    {weekDays.map((day) => {
                      const dayHarvests = getHarvestData(employee, day.date);
                      return (
                        <td
                          key={day.date.toISOString()}
                          className="px-2 py-3 text-sm text-gray-900 align-top relative group"
                        >
                          {dayHarvests.length > 0 ? (
                            <div className="space-y-2">
                              {dayHarvests.map((harvest, index) => (
                                <button
                                  key={harvest.id}
                                  onClick={() => handleCellClick(employee, day.date, harvest)}
                                  className="w-full bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer text-left"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-medium text-gray-800 text-xs">
                                        {harvest.plot.name}
                                      </span>
                                    </div>
                                    <span className="text-green-700 font-bold text-sm">
                                      {harvest.kilograms.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 ml-4">
                                    {harvest.cropType.name}
                                  </div>
                                </button>
                              ))}
                              {dayHarvests.length > 1 && (
                                <div className="pt-2 border-t-2 border-blue-300 bg-blue-50 rounded px-2 py-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-blue-700">
                                      {dayHarvests.length} crops
                                    </span>
                                    <span className="text-sm font-bold text-blue-700">
                                      {dayHarvests.reduce((sum, h) => sum + h.kilograms, 0).toFixed(1)} kg
                                    </span>
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => handleCellClick(employee, day.date)}
                                className="w-full text-center text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded py-1 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                + Add more
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCellClick(employee, day.date)}
                              className="w-full text-gray-400 hover:text-green-600 hover:bg-green-50 text-center text-xs py-2 rounded transition-colors"
                            >
                              + Add
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center font-semibold text-blue-600 bg-blue-50">
                      {getRowTotal(employee).toFixed(2)} kg
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-4 text-sm text-gray-900 sticky left-0 bg-gray-100">
                    Daily Total
                  </td>
                  {weekDays.map((day) => (
                    <td
                      key={day.date.toISOString()}
                      className="px-4 py-4 text-center text-sm text-gray-900"
                    >
                      {getColumnTotal(day.date).toFixed(2)} kg
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-sm text-white bg-green-600">
                    {grandTotal.toFixed(2)} kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{filteredEmployees.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Collections</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{filteredHarvests.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Kilograms</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{grandTotal.toFixed(2)} kg</div>
          </div>
        </div>
      )}

      {/* Edit Harvest Modal */}
      {showEditModal && selectedHarvest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Harvest Collection</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600"><span className="font-medium">Employee:</span> {selectedHarvest.pickerName}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Plot:</span> {selectedHarvest.plot.name}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Crop Type:</span> {selectedHarvest.cropType.name}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {new Date(selectedHarvest.collectionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilograms</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={selectedHarvest.kilograms}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  id="edit-kilograms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  defaultValue={selectedHarvest.notes || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  id="edit-notes"
                />
              </div>
              <div className="flex justify-between space-x-3 pt-4">
                <button
                  onClick={() => handleDeleteHarvest(selectedHarvest.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const kilograms = (document.getElementById('edit-kilograms') as HTMLInputElement).value;
                      const notes = (document.getElementById('edit-notes') as HTMLTextAreaElement).value;
                      try {
                        const response = await fetch(`/api/farm/${farmCode}/harvests/${selectedHarvest.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ kilograms: parseFloat(kilograms), notes }),
                        });
                        if (response.ok) {
                          fetchHarvests();
                          setShowEditModal(false);
                        } else {
                          alert('Failed to update harvest');
                        }
                      } catch (error) {
                        console.error('Error updating harvest:', error);
                        alert('Error updating harvest');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Harvest Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Harvest Collection</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600"><span className="font-medium">Employee:</span> {selectedEmployee}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {selectedDate.toLocaleDateString()}</p>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot *</label>
                <input
                  type="text"
                  value={plotSearchTerm}
                  onChange={(e) => {
                    setPlotSearchTerm(e.target.value);
                    setShowPlotDropdown(true);
                    setSelectedPlotId('');
                  }}
                  onFocus={() => setShowPlotDropdown(true)}
                  placeholder="Search for a plot..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                {showPlotDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowPlotDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {plots
                        .filter(plot => 
                          plot.name.toLowerCase().includes(plotSearchTerm.toLowerCase())
                        )
                        .map((plot) => (
                          <button
                            key={plot.id}
                            type="button"
                            onClick={() => {
                              setPlotSearchTerm(plot.name);
                              setSelectedPlotId(plot.id);
                              setShowPlotDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
                          >
                            {plot.name}
                          </button>
                        ))}
                      {plots.filter(plot => 
                        plot.name.toLowerCase().includes(plotSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-sm">No plots found</div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                <input
                  type="text"
                  value={cropTypeSearchTerm}
                  onChange={(e) => {
                    setCropTypeSearchTerm(e.target.value);
                    setShowCropTypeDropdown(true);
                    setSelectedCropTypeId('');
                  }}
                  onFocus={() => setShowCropTypeDropdown(true)}
                  placeholder="Search for a crop type..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                {showCropTypeDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowCropTypeDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {cropTypes
                        .filter(type => 
                          type.name.toLowerCase().includes(cropTypeSearchTerm.toLowerCase())
                        )
                        .map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setCropTypeSearchTerm(type.name);
                              setSelectedCropTypeId(type.id);
                              setShowCropTypeDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
                          >
                            {type.name}
                          </button>
                        ))}
                      {cropTypes.filter(type => 
                        type.name.toLowerCase().includes(cropTypeSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-sm">No crop types found</div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilograms *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  id="add-kilograms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  id="add-notes"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const kilograms = (document.getElementById('add-kilograms') as HTMLInputElement).value;
                    const notes = (document.getElementById('add-notes') as HTMLTextAreaElement).value;
                    
                    if (!selectedPlotId || !selectedCropTypeId || !kilograms) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    
                    try {
                      const response = await fetch(`/api/farm/${farmCode}/harvests`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          plotId: selectedPlotId,
                          cropTypeId: selectedCropTypeId,
                          pickerName: selectedEmployee,
                          kilograms: parseFloat(kilograms),
                          collectionDate: selectedDate.toISOString(),
                          notes: notes || undefined,
                        }),
                      });
                      if (response.ok) {
                        fetchHarvests();
                        setShowAddModal(false);
                      } else {
                        alert('Failed to create harvest');
                      }
                    } catch (error) {
                      console.error('Error creating harvest:', error);
                      alert('Error creating harvest');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
