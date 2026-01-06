import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
            <Smartphone className="w-12 h-12 text-primary-foreground" />
          </div>

          <h1 className="font-display text-3xl font-bold mb-4">
            Installa Runner Legends
          </h1>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Installa l'app sul tuo smartphone per un'esperienza di corsa completa, anche offline!
          </p>

          {isInstalled ? (
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-accent mb-2">
                <Check className="w-6 h-6" />
                <span className="font-bold">App Installata!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Runner Legends è già installata sul tuo dispositivo.
              </p>
            </div>
          ) : isIOS ? (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Come installare su iPhone/iPad
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tocca l'icona <strong>Condividi</strong> (quadrato con freccia) in basso</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scorri e tocca <strong>"Aggiungi a Home"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tocca <strong>"Aggiungi"</strong> in alto a destra</span>
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <Button
              size="lg"
              onClick={handleInstall}
              className="gap-3 text-lg px-8 py-6 rounded-2xl font-display font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
            >
              <Download className="w-6 h-6" />
              INSTALLA ORA
            </Button>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Come installare su Android
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tocca il menu del browser (tre puntini in alto)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Seleziona <strong>"Installa app"</strong> o <strong>"Aggiungi a Home"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>Conferma l'installazione</span>
                </li>
              </ol>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-bold text-sm mb-1">Accesso Rapido</h4>
              <p className="text-xs text-muted-foreground">Avvia l'app con un tap dalla home</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-bold text-sm mb-1">Funziona Offline</h4>
              <p className="text-xs text-muted-foreground">Corri anche senza connessione</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">🔔</div>
              <h4 className="font-bold text-sm mb-1">Notifiche</h4>
              <p className="text-xs text-muted-foreground">Ricevi aggiornamenti in tempo reale</p>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
