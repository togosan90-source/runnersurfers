import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  accuracy: number | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  isNative: boolean;
}

interface UseNativeGeolocationReturn {
  state: GeolocationState;
  requestPermissions: () => Promise<boolean>;
  getCurrentPosition: () => Promise<{ lat: number; lng: number } | null>;
  watchPosition: (callback: (position: { lat: number; lng: number; accuracy: number }) => void) => Promise<string | number | null>;
  clearWatch: (watchId: string | number | null) => Promise<void>;
}

export function useNativeGeolocation(): UseNativeGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: null,
    error: null,
    permissionStatus: 'unknown',
    isNative: Capacitor.isNativePlatform(),
  });

  const isNative = Capacitor.isNativePlatform();

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    try {
      if (isNative) {
        const status = await Geolocation.checkPermissions();
        setState(prev => ({
          ...prev,
          permissionStatus: status.location as 'granted' | 'denied' | 'prompt',
        }));
        return status.location;
      } else {
        // Web fallback - check via navigator.permissions if available
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setState(prev => ({
            ...prev,
            permissionStatus: result.state as 'granted' | 'denied' | 'prompt',
          }));
          return result.state;
        }
        return 'prompt';
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      return 'unknown';
    }
  }, [isNative]);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (isNative) {
        // First check current status
        const currentStatus = await Geolocation.checkPermissions();
        
        if (currentStatus.location === 'granted') {
          setState(prev => ({ ...prev, permissionStatus: 'granted', error: null }));
          return true;
        }

        // Request permissions
        const status = await Geolocation.requestPermissions();
        const granted = status.location === 'granted';
        
        setState(prev => ({
          ...prev,
          permissionStatus: status.location as 'granted' | 'denied' | 'prompt',
          error: granted ? null : 'Permessi GPS negati. Vai nelle impostazioni per abilitarli.',
        }));
        
        return granted;
      } else {
        // Web fallback - trigger permission prompt by getting current position
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setState(prev => ({
                ...prev,
                permissionStatus: 'granted',
                position: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                accuracy: position.coords.accuracy,
                error: null,
              }));
              resolve(true);
            },
            (error) => {
              setState(prev => ({
                ...prev,
                permissionStatus: 'denied',
                error: 'Permessi GPS negati. Abilita la posizione nelle impostazioni del browser.',
              }));
              resolve(false);
            },
            { enableHighAccuracy: true }
          );
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setState(prev => ({
        ...prev,
        error: 'Errore durante la richiesta dei permessi GPS.',
      }));
      return false;
    }
  }, [isNative]);

  // Get current position
  const getCurrentPosition = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      if (isNative) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        setState(prev => ({
          ...prev,
          position: coords,
          accuracy: position.coords.accuracy,
          error: null,
        }));
        
        return coords;
      } else {
        // Web fallback
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setState(prev => ({
                ...prev,
                position: coords,
                accuracy: position.coords.accuracy,
                error: null,
              }));
              resolve(coords);
            },
            (error) => {
              setState(prev => ({
                ...prev,
                error: 'Impossibile ottenere la posizione.',
              }));
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }
    } catch (error) {
      console.error('Error getting current position:', error);
      setState(prev => ({
        ...prev,
        error: 'Errore GPS. Riprova.',
      }));
      return null;
    }
  }, [isNative]);

  // Watch position
  const watchPosition = useCallback(async (
    callback: (position: { lat: number; lng: number; accuracy: number }) => void
  ): Promise<string | number | null> => {
    try {
      if (isNative) {
        const watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
          },
          (position, err) => {
            if (err) {
              console.error('Watch position error:', err);
              return;
            }
            if (position) {
              callback({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
            }
          }
        );
        return watchId;
      } else {
        // Web fallback
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            callback({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            console.error('Watch position error:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return watchId;
      }
    } catch (error) {
      console.error('Error watching position:', error);
      return null;
    }
  }, [isNative]);

  // Clear watch
  const clearWatch = useCallback(async (watchId: string | number | null): Promise<void> => {
    if (watchId === null) return;
    
    try {
      if (isNative) {
        await Geolocation.clearWatch({ id: watchId as string });
      } else {
        navigator.geolocation.clearWatch(watchId as number);
      }
    } catch (error) {
      console.error('Error clearing watch:', error);
    }
  }, [isNative]);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    state,
    requestPermissions,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
}
