import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.572eec346f0147b0a26ef9a7763a9541',
  appName: 'Runner Legends',
  webDir: 'dist',
  server: {
    url: 'https://572eec34-6f01-47b0-a26e-f9a7763a9541.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#0A0F1C'
  },
  android: {
    backgroundColor: '#0A0F1C',
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0F1C',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0F1C'
    }
  }
};

export default config;
