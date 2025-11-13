'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FarmFormProps {
  initialData?: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
  };
  createdById: string;
}

export default function FarmForm({ initialData, createdById }: FarmFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = initialData
        ? `/api/farms/${initialData.id}`
        : '/api/farms';
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...(initialData ? {} : { createdById }),
        }),
      });

      if (response.ok) {
        router.push('/admin/farms');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save farm');
      }
    } catch (err) {
      setError('An error occurred while saving the farm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const code = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setFormData({ ...formData, code });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Farm Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onBlur={!initialData ? generateCode : undefined}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., Sunshine Farms"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Farm Code * (URL-friendly identifier)
        </label>
        <input
          type="text"
          required
          disabled={!!initialData}
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          pattern="[a-z0-9-]+"
          className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
          placeholder="e.g., sunshine-farms"
        />
        <p className="text-sm text-gray-600 mt-1">
          Lowercase letters, numbers, and hyphens only. Cannot be changed after creation.
        </p>
        {formData.code && (
          <p className="text-sm text-gray-600 mt-1">
            Database will be: <code className="bg-gray-100 px-2 py-1 rounded">customer_{formData.code}</code>
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Brief description of the farm..."
        />
      </div>

      {initialData && (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-gray-700 font-medium">Active</span>
          </label>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : initialData ? 'Update Farm' : 'Create Farm'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
