'use client';

import { use, useState, useEffect } from 'react';

interface HarvestCollection {
  id: string;
  plotId: string;
  cropTypeId: string;
  pickerName: string;
  kilograms: number;
  collectionDate: string;
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

  useEffect(() => {
    fetchHarvests();
  }, [farmCode, selectedWeek]);

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

  // Group harvests by employee
  const groupedByEmployee = harvests.reduce((acc, harvest) => {
    if (!acc[harvest.pickerName]) {
      acc[harvest.pickerName] = [];
    }
    acc[harvest.pickerName].push(harvest);
    return acc;
  }, {} as Record<string, HarvestCollection[]>);

  const employees = Object.keys(groupedByEmployee).sort();
  const weekDays = getWeekDays();

  // Get harvest data for a specific employee, day, and plot
  const getHarvestData = (employeeName: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return harvests.filter(
      (h) =>
        h.pickerName === employeeName &&
        h.collectionDate.split('T')[0] === dateStr
    );
  };

  // Calculate column totals (per day)
  const getColumnTotal = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return harvests
      .filter((h) => h.collectionDate.split('T')[0] === dateStr)
      .reduce((sum, h) => sum + h.kilograms, 0);
  };

  // Calculate row totals (per employee)
  const getRowTotal = (employeeName: string) => {
    return groupedByEmployee[employeeName].reduce((sum, h) => sum + h.kilograms, 0);
  };

  // Calculate grand total
  const grandTotal = harvests.reduce((sum, h) => sum + h.kilograms, 0);

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

      {/* Harvest Matrix */}
      {employees.length === 0 ? (
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
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                    >
                      <div>{day.dayName}</div>
                      <div className="text-gray-400 font-normal">{day.dayNum}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {employee}
                    </td>
                    {weekDays.map((day) => {
                      const dayHarvests = getHarvestData(employee, day.date);
                      return (
                        <td
                          key={day.date.toISOString()}
                          className="px-4 py-4 text-sm text-gray-900 align-top"
                        >
                          {dayHarvests.length > 0 ? (
                            <div className="space-y-1">
                              {dayHarvests.map((harvest) => (
                                <div key={harvest.id} className="text-xs">
                                  <div className="font-medium text-gray-700">
                                    {harvest.plot.name}
                                  </div>
                                  <div className="text-green-600 font-semibold">
                                    {harvest.kilograms.toFixed(2)} kg
                                  </div>
                                </div>
                              ))}
                              {dayHarvests.length > 1 && (
                                <div className="pt-1 border-t border-gray-200 text-xs font-semibold text-blue-600">
                                  {dayHarvests.reduce((sum, h) => sum + h.kilograms, 0).toFixed(2)} kg
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-300 text-center">-</div>
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
      {employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{employees.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Collections</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{harvests.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Kilograms</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{grandTotal.toFixed(2)} kg</div>
          </div>
        </div>
      )}
    </div>
  );
}
