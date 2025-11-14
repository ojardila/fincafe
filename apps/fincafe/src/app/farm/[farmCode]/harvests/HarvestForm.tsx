'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Plot {
  id: string;
  name: string;
}

interface CropType {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface HarvestFormProps {
  farmCode: string;
  initialData?: {
    id?: string;
    plotId: string;
    cropTypeId: string;
    pickerName: string;
    kilograms: number;
    collectionDate: string;
    notes?: string;
  };
}

export default function HarvestForm({ farmCode, initialData }: HarvestFormProps) {
  const router = useRouter();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    plotId: initialData?.plotId || '',
    cropTypeId: initialData?.cropTypeId || '',
    pickerName: initialData?.pickerName || '',
    kilograms: initialData?.kilograms?.toString() || '',
    collectionDate: initialData?.collectionDate 
      ? new Date(initialData.collectionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    fetchPlots();
    fetchCropTypes();
    fetchUsers();
  }, [farmCode]);

  const fetchPlots = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/plots`);
      if (response.ok) {
        const data = await response.json();
        // API returns { plots: [...] }
        const plotsList = data.plots || data;
        setPlots(Array.isArray(plotsList) ? plotsList : []);
      } else {
        console.error('Failed to fetch plots');
        setPlots([]);
      }
    } catch (error) {
      console.error('Error fetching plots:', error);
      setPlots([]);
    }
  };

  const fetchCropTypes = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`);
      if (response.ok) {
        const data = await response.json();
        // API returns { cropTypes: [...] }
        const types = data.cropTypes || data;
        setCropTypes(Array.isArray(types) ? types : []);
      } else {
        console.error('Failed to fetch crop types');
        setCropTypes([]);
      }
    } catch (error) {
      console.error('Error fetching crop types:', error);
      setCropTypes([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || 'Unknown User';
  };

  const filteredUsers = users.filter((user) => {
    const displayName = getUserDisplayName(user).toLowerCase();
    return displayName.includes(formData.pickerName.toLowerCase());
  });

  const handlePickerNameChange = (value: string) => {
    setFormData({ ...formData, pickerName: value });
    setShowSuggestions(true);
  };

  const selectUser = (user: User) => {
    setFormData({ ...formData, pickerName: getUserDisplayName(user) });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id
        ? `/api/farm/${farmCode}/harvests/${initialData.id}`
        : `/api/farm/${farmCode}/harvests`;
      
      const method = initialData?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          kilograms: parseFloat(formData.kilograms),
        }),
      });

      if (response.ok) {
        router.push(`/farm/${farmCode}/harvests`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save harvest collection');
      }
    } catch (error) {
      console.error('Error saving harvest:', error);
      alert('Error saving harvest collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Collection Details</h2>

        {/* Collection Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Collection Date *
          </label>
          <input
            type="date"
            value={formData.collectionDate}
            onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          />
        </div>

        {/* Plot Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plot *
          </label>
          <select
            value={formData.plotId}
            onChange={(e) => setFormData({ ...formData, plotId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          >
            <option value="">Select a plot</option>
            {plots.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.name}
              </option>
            ))}
          </select>
        </div>

        {/* Crop Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crop Type *
          </label>
          <select
            value={formData.cropTypeId}
            onChange={(e) => setFormData({ ...formData, cropTypeId: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          >
            <option value="">Select a crop type</option>
            {cropTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Picker Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Picker Name *
          </label>
          <input
            type="text"
            value={formData.pickerName}
            onChange={(e) => handlePickerNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Enter picker's full name"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          />
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && formData.pickerName && filteredUsers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
              {filteredUsers.slice(0, 10).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectUser(user)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                >
                  {getUserDisplayName(user)}
                </button>
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {showSuggestions && formData.pickerName && filteredUsers.length === 0 && users.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-500">
              No matching users found
            </div>
          )}
        </div>

        {/* Kilograms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kilograms *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.kilograms}
            onChange={(e) => setFormData({ ...formData, kilograms: e.target.value })}
            placeholder="0.00"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Weight of coffee picked in kilograms</p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Add any additional notes about this collection..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Saving...' : initialData?.id ? 'Update Collection' : 'Create Collection'}
        </button>
      </div>
    </form>
  );
}
