'use client';

import { useAuth } from '../../../../contexts/AuthContext';
import FarmForm from '../FarmForm';

export default function NewFarmPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Farm</h1>
      <FarmForm createdById={user.id} />
    </div>
  );
}
