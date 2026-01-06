import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RunningMapProps {
  center: { lat: number; lng: number };
  path: { lat: number; lng: number }[];
  isRunning?: boolean;
}

export function RunningMap({ center, path, isRunning }: RunningMapProps) {
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
    <div className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: '100%' }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Location overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">📍</span>
            <span className="text-muted-foreground">Posizione:</span>
            <span className="font-medium text-foreground">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Running indicator */}
      {isRunning && (
        <div className="absolute top-3 left-3 z-[1000]">
          <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse" />
            TRACKING
          </div>
        </div>
      )}
    </div>
  );
}
