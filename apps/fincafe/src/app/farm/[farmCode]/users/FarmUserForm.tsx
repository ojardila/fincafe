'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FarmUserFormProps {
  farmCode: string;
  initialData?: {
    id: string;
    email: string;
    name: string | null;
    roleId?: string | null;
  };
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default function FarmUserForm({ farmCode, initialData }: FarmUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    name: initialData?.name || '',
    password: '',
    roleId: initialData?.roleId || '',
  });

  useEffect(() => {
    // Fetch available roles from farm database
    const fetchRoles = async () => {
      try {
        const response = await fetch(`/api/farm/${farmCode}/roles`);
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, [farmCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password for new users
    if (!initialData && !formData.password) {
      setError('Password is required for new users');
      setLoading(false);
      return;
    }

    try {
      const url = initialData
        ? `/api/farm/${farmCode}/users/${initialData.id}`
        : `/api/farm/${farmCode}/users`;
      const method = initialData ? 'PATCH' : 'POST';

      // Only include password if it's set
      const body: Record<string, string> = {
        email: formData.email,
        name: formData.name,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      if (formData.roleId) {
        body.roleId = formData.roleId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.push(`/farm/${farmCode}/users`);
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save user');
      }
    } catch (err) {
      setError('An error occurred while saving the user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="user@example.com"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Full name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Password {initialData ? '(leave blank to keep current)' : '*'}
        </label>
        <input
          type="password"
          required={!initialData}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Enter password"
        />
        {!initialData && (
          <p className="text-sm text-gray-600 mt-1">
            Minimum 6 characters recommended
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Role</label>
        <select
          value={formData.roleId}
          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">No role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
              {role.description && ` - ${role.description}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
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
