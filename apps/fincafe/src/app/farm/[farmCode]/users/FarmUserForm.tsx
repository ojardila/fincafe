'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FarmUserFormProps {
  farmCode: string;
  initialData?: {
    id: string;
    email: string;
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    position?: string | null;
    department?: string | null;
    hireDate?: string | null;
    nationality?: string | null;
    idType?: string | null;
    idNumber?: string | null;
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
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    birthDate: initialData?.birthDate ? initialData.birthDate.split('T')[0] : '',
    password: '',
    roleId: initialData?.roleId || '',
    // Address Information
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || '',
    postalCode: initialData?.postalCode || '',
    // Emergency Contact
    emergencyContact: initialData?.emergencyContact || '',
    emergencyPhone: initialData?.emergencyPhone || '',
    // Employment Information
    position: initialData?.position || '',
    department: initialData?.department || '',
    hireDate: initialData?.hireDate ? initialData.hireDate.split('T')[0] : '',
    // Additional Information
    nationality: initialData?.nationality || '',
    idType: initialData?.idType || 'national_id',
    idNumber: initialData?.idNumber || '',
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

      // Build the request body
      const body: Record<string, string> = {
        email: formData.email,
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        // Address Information
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        // Emergency Contact
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        // Employment Information
        position: formData.position,
        department: formData.department,
        hireDate: formData.hireDate,
        // Additional Information
        nationality: formData.nationality,
        idType: formData.idType,
        idNumber: formData.idNumber,
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
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Personal Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Full Name (Display)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Birth Date</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Nationality</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Colombian"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">ID Type</label>
            <select
              value={formData.idType}
              onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="foreign_id">Foreign ID</option>
              <option value="drivers_license">Driver&apos;s License</option>
              <option value="tax_id">Tax ID</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">ID Number</label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter ID number"
            />
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Address Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="123 Main Street, Apt 4B"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="City name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">State/Province</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="State or province"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Country"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Postal Code</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="ZIP or postal code"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Emergency Contact
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Name</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Emergency contact full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Contact Phone</label>
            <input
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </div>

      {/* Employment Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Employment Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Farm Worker, Supervisor"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Harvesting, Operations"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Hire Date</label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
        </div>
      </div>

      {/* Account Security Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          Account Security
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password {initialData ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              required={!initialData}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter password"
            />
            <p className="text-sm text-gray-600 mt-1">
              {!initialData ? 'Minimum 6 characters recommended' : 'Only fill this field if you want to change the password'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
        >
          {loading ? 'Saving...' : initialData ? 'Update Employee' : 'Create Employee'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
