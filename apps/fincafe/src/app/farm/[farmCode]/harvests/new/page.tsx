'use client';

import { use } from 'react';
import HarvestForm from '../HarvestForm';

export default function NewHarvestPage({ params }: { params: Promise<{ farmCode: string }> }) {
  const { farmCode } = use(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Harvest Collection</h1>
        <p className="text-gray-600 mt-1">Record a new coffee pickup</p>
      </div>

      <HarvestForm farmCode={farmCode} />
    </div>
  );
}
