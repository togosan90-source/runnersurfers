import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNativeGeolocation } from '@/hooks/useNativeGeolocation';
import { Capacitor } from '@capacitor/core';

interface PermissionRequestProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function PermissionRequest({ onPermissionGranted, onPermissionDenied }: PermissionRequestProps) {
  const { state, requestPermissions } = useNativeGeolocation();
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for permission check to complete
    if (state.permissionStatus !== 'unknown' && !hasChecked) {
      setHasChecked(true);
      
      if (state.permissionStatus === 'granted') {
        onPermissionGranted?.();
      } else if (state.permissionStatus === 'denied') {
        setShowPrompt(true);
      } else if (state.permissionStatus === 'prompt') {
        // Auto-request on native platforms
        if (Capacitor.isNativePlatform()) {
          handleRequestPermission();
        } else {
          setShowPrompt(true);
        }
      }
    }
  }, [state.permissionStatus, hasChecked, onPermissionGranted]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await requestPermissions();
    setIsRequesting(false);
    
    if (granted) {
      setShowPrompt(false);
      onPermissionGranted?.();
    } else {
      setShowPrompt(true);
      onPermissionDenied?.();
    }
  };

  if (!showPrompt && state.permissionStatus === 'granted') {
    return null;
  }

  return (
    <AnimatePresence>
      {(showPrompt || state.permissionStatus === 'unknown') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)',
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: state.permissionStatus === 'denied' 
                    ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                    : 'linear-gradient(180deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                  border: state.permissionStatus === 'denied'
                    ? '2px solid rgba(239, 68, 68, 0.3)'
                    : '2px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                {state.permissionStatus === 'denied' ? (
                  <AlertCircle className="w-10 h-10 text-red-500" />
                ) : (
                  <MapPin className="w-10 h-10 text-green-500" />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              {state.permissionStatus === 'denied' 
                ? 'GPS Non Disponibile' 
                : 'Permesso GPS Richiesto'}
            </h2>

            {/* Description */}
            <p className="text-center text-muted-foreground mb-6">
              {state.permissionStatus === 'denied' ? (
                <>
                  I permessi GPS sono stati negati. Per tracciare le tue corse, 
                  abilita la posizione nelle <strong>Impostazioni</strong> del tuo dispositivo.
                </>
              ) : (
                <>
                  Runner Legends ha bisogno del GPS per tracciare le tue corse, 
                  calcolare la distanza e guadagnare punti.
                </>
              )}
            </p>

            {/* Features list */}
            {state.permissionStatus !== 'denied' && (
              <div className="space-y-3 mb-6">
                {[
                  'Tracciamento preciso delle corse',
                  'Calcolo automatico distanza e velocità',
                  'Mappa in tempo reale del percorso',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action button */}
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full h-12 text-lg font-semibold"
              style={{
                background: state.permissionStatus === 'denied'
                  ? 'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--muted)) 100%)'
                  : 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
              }}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Richiesta in corso...
                </>
              ) : state.permissionStatus === 'denied' ? (
                'Riprova'
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Abilita GPS
                </>
              )}
            </Button>

            {/* Privacy note */}
            <p className="text-xs text-center text-muted-foreground/60 mt-4">
              🔒 La tua posizione viene usata solo durante le corse e non viene mai condivisa.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
