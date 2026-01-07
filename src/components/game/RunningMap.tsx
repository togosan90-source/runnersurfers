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

// Flame component for reuse on all sides
function FlameLayer({ 
  side, 
  flameIntensity, 
  animationSpeed 
}: { 
  side: 'top' | 'bottom' | 'left' | 'right';
  flameIntensity: number;
  animationSpeed: number;
}) {
  const flameCount = Math.floor(8 + flameIntensity * 6);
  const isHorizontal = side === 'top' || side === 'bottom';
  
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 10,
    ...(side === 'bottom' && { bottom: 0, left: 0, right: 0, height: `${50 + flameIntensity * 30}px` }),
    ...(side === 'top' && { top: 0, left: 0, right: 0, height: `${50 + flameIntensity * 30}px`, transform: 'rotate(180deg)' }),
    ...(side === 'left' && { left: 0, top: 0, bottom: 0, width: `${50 + flameIntensity * 30}px`, transform: 'rotate(90deg)', transformOrigin: 'bottom left' }),
    ...(side === 'right' && { right: 0, top: 0, bottom: 0, width: `${50 + flameIntensity * 30}px`, transform: 'rotate(-90deg)', transformOrigin: 'bottom right' }),
  };

  return (
    <div style={containerStyle}>
      {/* Base glow */}
      <motion.div 
        className="absolute w-full"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: `${35 + flameIntensity * 25}px`,
          background: `radial-gradient(ellipse at bottom, 
            rgba(0, ${180 + flameIntensity * 75}, 255, ${0.5 + flameIntensity * 0.3}) 0%, 
            rgba(0, 100, 200, ${0.25 + flameIntensity * 0.2}) 40%, 
            transparent 70%)`,
          filter: `blur(${6 + flameIntensity * 3}px)`,
        }}
        animate={{ 
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: animationSpeed, repeat: Infinity }}
      />
      
      {/* White-hot core at high intensity */}
      {flameIntensity > 0.4 && (
        <motion.div 
          className="absolute"
          style={{
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: `${20 + flameIntensity * 15}px`,
            background: `radial-gradient(ellipse at bottom, 
              rgba(255, 255, 255, ${flameIntensity * 0.35}) 0%, 
              rgba(200, 240, 255, ${flameIntensity * 0.2}) 30%, 
              transparent 60%)`,
            filter: 'blur(4px)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: animationSpeed * 0.5, repeat: Infinity }}
        />
      )}
      
      {/* Individual flames */}
      {[...Array(flameCount)].map((_, i) => {
        const pos = (i / flameCount) * 100;
        const baseHeight = 20 + flameIntensity * 20 + Math.random() * 15;
        const width = 10 + flameIntensity * 8 + Math.random() * 5;
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              bottom: 0,
              left: `${pos}%`,
              width: `${width}px`,
              background: `linear-gradient(to top, 
                rgba(${flameIntensity > 0.6 ? '255, 255, 255' : '0, 220, 255'}, ${0.85 + flameIntensity * 0.15}) 0%, 
                rgba(0, ${200 + flameIntensity * 55}, 255, ${0.65 + flameIntensity * 0.2}) 20%, 
                rgba(0, 150, 255, ${0.45 + flameIntensity * 0.2}) 50%, 
                rgba(100, 180, 255, 0.25) 70%, 
                transparent 100%)`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              filter: `blur(${1.5 + flameIntensity * 0.5}px)`,
              transformOrigin: 'bottom center',
            }}
            animate={{
              height: [
                `${baseHeight}px`, 
                `${baseHeight + 12 + flameIntensity * 10}px`, 
                `${baseHeight - 5}px`, 
                `${baseHeight + 8}px`, 
                `${baseHeight}px`
              ],
              opacity: [0.6, 1, 0.5, 0.9, 0.6],
              scaleX: [1, 1.25, 0.85, 1.15, 1],
              rotate: [0, 3 + flameIntensity, -2, 2, 0],
            }}
            transition={{
              duration: animationSpeed + (i % 4) * 0.12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.07,
            }}
          />
        );
      })}
      
      {/* Floating sparks */}
      {[...Array(Math.floor(3 + flameIntensity * 4))].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            bottom: 0,
            left: `${10 + Math.random() * 80}%`,
            width: `${1 + flameIntensity * 0.5}px`,
            height: `${1 + flameIntensity * 0.5}px`,
            background: 'radial-gradient(circle, #00f2fe 0%, #4facfe 100%)',
            boxShadow: '0 0 4px rgba(0, 200, 255, 0.8)',
          }}
          animate={{ 
            y: [0, -40 - flameIntensity * 20],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export function RunningMap({ center, path, isRunning, speed = 0 }: RunningMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Calculate flame intensity based on speed
  const flameIntensity = Math.min(speed / 15, 1);
  const animationSpeed = Math.max(0.6, 1.4 - flameIntensity);

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
          ? `0 0 ${30 + flameIntensity * 30}px rgba(0, 150, 255, ${0.4 + flameIntensity * 0.3}), 0 0 ${60 + flameIntensity * 40}px rgba(0, 100, 200, ${0.2 + flameIntensity * 0.2})`
          : '0 0 20px rgba(0, 100, 200, 0.3)',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg z-20" />
      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg z-20" />
      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg z-20" />
      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg z-20" />

      {/* Flame borders on all sides */}
      <FlameLayer side="bottom" flameIntensity={flameIntensity} animationSpeed={animationSpeed} />
      <FlameLayer side="top" flameIntensity={flameIntensity} animationSpeed={animationSpeed} />
      <FlameLayer side="left" flameIntensity={flameIntensity} animationSpeed={animationSpeed} />
      <FlameLayer side="right" flameIntensity={flameIntensity} animationSpeed={animationSpeed} />

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
            <motion.div 
              className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 200, 255, 0.3) 0%, rgba(0, 150, 255, 0.2) 100%)',
                border: '1px solid rgba(0, 200, 255, 0.5)',
                boxShadow: '0 0 15px rgba(0, 200, 255, 0.4)',
                color: '#00d4ff',
              }}
              animate={{
                boxShadow: [
                  '0 0 15px rgba(0, 200, 255, 0.4)',
                  '0 0 25px rgba(0, 200, 255, 0.6)',
                  '0 0 15px rgba(0, 200, 255, 0.4)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.span 
                className="w-2 h-2 rounded-full"
                style={{ background: '#00f2fe' }}
                animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              TRACKING
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
