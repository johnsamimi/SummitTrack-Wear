
import React, { useEffect, useRef } from 'react';
import { GeoPoint } from '../types';

// Declare Leaflet globally as it is loaded via script in index.html
declare const L: any;

interface MapViewProps {
  path: GeoPoint[];
  currentLocation: GeoPoint | null;
  offlineMode: boolean;
}

const MapView: React.FC<MapViewProps> = ({ path, currentLocation, offlineMode }) => {
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Map
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([0, 0], 15);

    // High contrast hiking-friendly layer (Outdoor/Topo style)
    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      className: 'map-tiles'
    });

    // Simple street layer for "offline" or standard view
    const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    if (offlineMode) {
      streetsLayer.addTo(map);
    } else {
      topoLayer.addTo(map);
    }

    mapRef.current = map;

    // Initialize Polyline (the path behind the user)
    polylineRef.current = L.polyline([], {
      color: '#00ff00', // Neon green for high visibility
      weight: 6,
      opacity: 0.8,
      lineJoin: 'round',
      dashArray: '1, 10', // Optional: stylized breadcrumb
    }).addTo(map);

    // Current location marker
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-lg ring-4 ring-blue-500/30"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    markerRef.current = L.marker([0, 0], { icon }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  // Update Offline Mode Layer
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });

    if (offlineMode) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    } else {
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }
  }, [offlineMode]);

  // Update Path and Location
  useEffect(() => {
    if (!mapRef.current) return;

    if (currentLocation) {
      const pos = [currentLocation.lat, currentLocation.lng];
      markerRef.current.setLatLng(pos);
      mapRef.current.panTo(pos);
    }

    if (path.length > 0) {
      const latlngs = path.map(p => [p.lat, p.lng]);
      polylineRef.current.setLatLngs(latlngs);
    } else {
      polylineRef.current.setLatLngs([]);
    }
  }, [path, currentLocation]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <div className="leaflet-vignette" />
    </div>
  );
};

export default MapView;
