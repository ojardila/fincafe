'use client';

import { useState, useEffect } from 'react';
import PlotMapInput from './PlotMapInput';

interface CropType {
  id: string;
  name: string;
}

interface Variety {
  id: string;
  name: string;
  cropTypeId: string;
}

interface PlotCrop {
  cropTypeId: string;
  varietyId?: string;
}

interface PlotFormData {
  name: string;
  totalArea: string;
  department: string;
  municipality: string;
  map: string;
  crops: PlotCrop[];
}

interface PlotFormProps {
  farmCode: string;
  initialData?: PlotFormData;
  onSubmit: (data: PlotFormData) => Promise<void>;
  submitLabel: string;
}

export default function PlotForm({
  farmCode,
  initialData,
  onSubmit,
  submitLabel,
}: PlotFormProps) {
  const [formData, setFormData] = useState<PlotFormData>(
    initialData || {
      name: '',
      totalArea: '',
      department: '',
      municipality: '',
      map: '',
      crops: [{ cropTypeId: '', varietyId: '' }],
    }
  );

  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [varieties, setVarieties] = useState<Record<string, Variety[]>>({});
  const [loading, setLoading] = useState(false);
  const [showNewCropType, setShowNewCropType] = useState(false);
  const [showNewVariety, setShowNewVariety] = useState<number | null>(null);
  const [newCropTypeName, setNewCropTypeName] = useState('');
  const [newVarietyName, setNewVarietyName] = useState('');

  useEffect(() => {
    fetchCropTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmCode]);

  // Load varieties for crops in initialData (edit mode)
  useEffect(() => {
    if (initialData?.crops) {
      initialData.crops.forEach((crop) => {
        if (crop.cropTypeId && !varieties[crop.cropTypeId]) {
          fetchVarieties(crop.cropTypeId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const fetchCropTypes = async () => {
    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`);
      if (response.ok) {
        const data = await response.json();
        setCropTypes(data.cropTypes || []);
      } else {
        console.error('Failed to fetch crop types');
        setCropTypes([]);
      }
    } catch (error) {
      console.error('Error fetching crop types:', error);
      setCropTypes([]);
    }
  };

  const fetchVarieties = async (cropTypeId: string) => {
    try {
      const response = await fetch(
        `/api/farm/${farmCode}/varieties?cropTypeId=${cropTypeId}`
      );
      if (response.ok) {
        const data = await response.json();
        setVarieties((prev) => ({ ...prev, [cropTypeId]: data.varieties || [] }));
      } else {
        console.error('Failed to fetch varieties for crop type:', cropTypeId);
        setVarieties((prev) => ({ ...prev, [cropTypeId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching varieties:', error);
      setVarieties((prev) => ({ ...prev, [cropTypeId]: [] }));
    }
  };

  const handleCropTypeChange = (index: number, cropTypeId: string) => {
    const newCrops = [...formData.crops];
    newCrops[index] = { cropTypeId, varietyId: '' };
    setFormData({ ...formData, crops: newCrops });

    if (cropTypeId && !varieties[cropTypeId]) {
      fetchVarieties(cropTypeId);
    }
  };

  const handleVarietyChange = (index: number, varietyId: string) => {
    const newCrops = [...formData.crops];
    newCrops[index].varietyId = varietyId;
    setFormData({ ...formData, crops: newCrops });
  };

  const addCrop = () => {
    setFormData({
      ...formData,
      crops: [...formData.crops, { cropTypeId: '', varietyId: '' }],
    });
  };

  const removeCrop = (index: number) => {
    const newCrops = formData.crops.filter((_, i) => i !== index);
    setFormData({ ...formData, crops: newCrops });
  };

  const handleCreateCropType = async () => {
    if (!newCropTypeName.trim()) return;

    try {
      const response = await fetch(`/api/farm/${farmCode}/crop-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCropTypeName }),
      });

      if (response.ok) {
        const data = await response.json();
        setCropTypes([...cropTypes, data.cropType]);
        setNewCropTypeName('');
        setShowNewCropType(false);
      } else {
        alert('Failed to create crop type');
      }
    } catch (error) {
      console.error('Error creating crop type:', error);
      alert('Failed to create crop type');
    }
  };

  const handleCreateVariety = async (cropTypeId: string) => {
    if (!newVarietyName.trim()) return;

    try {
      const response = await fetch(`/api/farm/${farmCode}/varieties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVarietyName, cropTypeId }),
      });

      if (response.ok) {
        const data = await response.json();
        setVarieties((prev) => ({
          ...prev,
          [cropTypeId]: [...(prev[cropTypeId] || []), data.variety],
        }));
        setNewVarietyName('');
        setShowNewVariety(null);
      } else {
        alert('Failed to create variety');
      }
    } catch (error) {
      console.error('Error creating variety:', error);
      alert('Failed to create variety');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.totalArea || !formData.department || !formData.municipality) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate that at least one crop has a crop type selected
    const validCrops = formData.crops.filter((crop) => crop.cropTypeId);
    if (validCrops.length === 0) {
      alert('Please add at least one crop');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...formData, crops: validCrops });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Plot Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Plot Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Plot Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700">
              Total Area (hectares) *
            </label>
            <input
              type="number"
              id="totalArea"
              step="0.01"
              value={formData.totalArea}
              onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department *
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-700">
              Municipality *
            </label>
            <input
              type="text"
              id="municipality"
              value={formData.municipality}
              onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="map" className="block text-sm font-medium text-gray-700 mb-2">
              Map (GIS Polygon Data)
            </label>
            <PlotMapInput 
              value={formData.map} 
              onChange={(geoJson) => setFormData({ ...formData, map: geoJson })}
            />
          </div>
        </div>
      </div>

      {/* Crops Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Crops Information</h2>
          <button
            type="button"
            onClick={addCrop}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Add Another Crop
          </button>
        </div>

        <div className="space-y-4">
          {formData.crops.map((crop, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-medium text-gray-700">Crop {index + 1}</h3>
                {formData.crops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCrop(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crop Type *
                  </label>
                  <select
                    value={crop.cropTypeId}
                    onChange={(e) => handleCropTypeChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    required
                  >
                    <option value="">Select crop type</option>
                    {cropTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCropType(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add new crop type
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variety
                  </label>
                  <select
                    value={crop.varietyId || ''}
                    onChange={(e) => handleVarietyChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    disabled={!crop.cropTypeId}
                  >
                    <option value="">Select variety (optional)</option>
                    {crop.cropTypeId &&
                      varieties[crop.cropTypeId]?.map((variety) => (
                        <option key={variety.id} value={variety.id}>
                          {variety.name}
                        </option>
                      ))}
                  </select>
                  {crop.cropTypeId && (
                    <button
                      type="button"
                      onClick={() => setShowNewVariety(index)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add new variety
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>

      {/* New Crop Type Modal */}
      {showNewCropType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Crop Type</h3>
            <input
              type="text"
              value={newCropTypeName}
              onChange={(e) => setNewCropTypeName(e.target.value)}
              placeholder="Enter crop type name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewCropType(false);
                  setNewCropTypeName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCropType}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Variety Modal */}
      {showNewVariety !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Variety</h3>
            <input
              type="text"
              value={newVarietyName}
              onChange={(e) => setNewVarietyName(e.target.value)}
              placeholder="Enter variety name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewVariety(null);
                  setNewVarietyName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateVariety(formData.crops[showNewVariety].cropTypeId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
