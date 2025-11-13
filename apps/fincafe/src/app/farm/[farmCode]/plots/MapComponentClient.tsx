'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapComponentClientProps {
  value: string;
  onChange: (geoJson: string) => void;
}

export default function MapComponentClient({ value, onChange }: MapComponentClientProps) {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't initialize if map already exists or container not ready
    if (mapRef.current || !containerRef.current) {
      return;
    }

    console.log('Initializing map...');

    try {
      // Initialize map
      const map = L.map(containerRef.current).setView([4.5709, -74.2973], 6);
      mapRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Force map to recalculate size
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 200);

      // Initialize feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Initialize draw control
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: '#3b82f6',
              weight: 2,
            },
          },
          rectangle: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 2,
            },
          },
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
      });
      map.addControl(drawControl);

      // Handle polygon creation
      map.on(L.Draw.Event.CREATED, (event) => {
        const e = event as L.DrawEvents.Created;
        const layer = e.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        
        const geoJson = (layer as L.Polygon).toGeoJSON();
        onChange(JSON.stringify(geoJson));
      });

      // Handle polygon edits
      map.on(L.Draw.Event.EDITED, (event) => {
        const e = event as L.DrawEvents.Edited;
        const layers = e.layers;
        layers.eachLayer((layer: L.Layer) => {
          const geoJson = (layer as L.Polygon).toGeoJSON();
          onChange(JSON.stringify(geoJson));
        });
      });

      // Handle polygon deletion
      map.on(L.Draw.Event.DELETED, () => {
        onChange('');
      });

      // Load existing polygon if value exists
      if (value) {
        try {
          const geoJson = JSON.parse(value);
          const layer = L.geoJSON(geoJson);
          layer.eachLayer((l) => {
            drawnItems.addLayer(l);
          });
          
          if (drawnItems.getBounds().isValid()) {
            map.fitBounds(drawnItems.getBounds());
          }
        } catch (error) {
          console.error('Error loading polygon:', error);
        }
      }

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty deps - only run once

  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="w-full h-96 rounded-md border border-gray-300"
        style={{ minHeight: '384px' }}
      />
      <p className="mt-2 text-sm text-gray-500">
        Use the drawing tools in the top-left to define the plot boundary.
      </p>
    </div>
  );
}
