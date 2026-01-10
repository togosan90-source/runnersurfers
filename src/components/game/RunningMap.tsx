import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RunningMapProps {
  center: { lat: number; lng: number };
  path: { lat: number; lng: number }[];
  isRunning?: boolean;
  speed?: number;
}

export function RunningMap({ center, path, isRunning, speed = 0 }: RunningMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);

    // Add marker
    markerRef.current = L.circleMarker([center.lat, center.lng], {
      radius: 10,
      fillColor: '#0ea5e9',
      fillOpacity: 1,
      color: '#fff',
      weight: 3,
    }).addTo(mapInstanceRef.current);

    // Add path polyline
    polylineRef.current = L.polyline([], {
      color: '#22c55e',
      weight: 4,
      opacity: 0.8,
    }).addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker position
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([center.lat, center.lng]);
      if (isRunning) {
        mapInstanceRef.current.panTo([center.lat, center.lng], { animate: true });
      }
    }
  }, [center, isRunning]);

  // Update path
  useEffect(() => {
    if (polylineRef.current && path.length > 0) {
      polylineRef.current.setLatLngs(path.map(p => [p.lat, p.lng] as L.LatLngTuple));
    }
  }, [path]);

  return (
    <div 
      className="relative w-full rounded-xl overflow-hidden" 
      style={{ 
        height: '100%',
        background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 50%, #1b3a5f 100%)',
        padding: '4px',
        boxShadow: isRunning 
          ? '0 0 30px rgba(0, 150, 255, 0.4), 0 0 60px rgba(0, 100, 200, 0.2)'
          : '0 0 20px rgba(0, 100, 200, 0.3)',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg z-20" />
      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg z-20" />
      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg z-20" />
      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg z-20" />

      {/* Map container with inner border */}
      <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ zIndex: 5 }}>
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Vignette overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            boxShadow: 'inset 0 0 30px rgba(0, 100, 200, 0.3)',
          }}
        />
        
        {/* Location overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div 
            className="backdrop-blur-sm rounded-lg px-3 py-2"
            style={{
              background: 'linear-gradient(180deg, rgba(10, 10, 26, 0.9) 0%, rgba(13, 27, 42, 0.9) 100%)',
              border: '1px solid rgba(0, 200, 255, 0.3)',
              boxShadow: '0 0 15px rgba(0, 150, 255, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">📍</span>
              <span style={{ color: 'rgba(150, 200, 255, 0.8)' }}>Posizione:</span>
              <span 
                className="font-mono font-medium"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Running indicator */}
        {isRunning && (
          <div className="absolute top-3 left-3 z-[1000]">
            <div 
              className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 200, 255, 0.3) 0%, rgba(0, 150, 255, 0.2) 100%)',
                border: '1px solid rgba(0, 200, 255, 0.5)',
                boxShadow: '0 0 15px rgba(0, 200, 255, 0.4)',
                color: '#00d4ff',
              }}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ background: '#00f2fe' }}
              />
              TRACKING
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
