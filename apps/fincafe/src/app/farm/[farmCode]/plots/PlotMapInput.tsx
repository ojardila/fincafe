'use client';

import dynamic from 'next/dynamic';

interface MapComponentProps {
  value: string;
  onChange: (geoJson: string) => void;
}

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic<MapComponentProps>(
  () => import('./MapComponentClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-md flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

export default function PlotMapInput({ value, onChange }: MapComponentProps) {
  return <MapComponent value={value} onChange={onChange} />;
}
