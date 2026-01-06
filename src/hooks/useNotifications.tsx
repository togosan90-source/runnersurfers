import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useNotifications = () => {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      return permission === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    // Always show toast
    const icon = options?.icon || '🏃';
    toast.success(`${icon} ${title}`, {
      description: options?.body,
    });

    // Also try native notification if available and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        });
      } catch (e) {
        // Service worker required for some browsers
        console.log('Native notification failed, using toast instead');
      }
    }
  }, []);

  // Notification helpers for running
  const notifyKilometer = useCallback((km: number) => {
    sendNotification(`${km} km completati!`, {
      body: 'Continua così! 💪',
      icon: '✅',
    });
  }, [sendNotification]);

  const notifyExpMilestone = useCallback((percentage: number, coins: number) => {
    sendNotification(`${percentage}% EXP raggiunto!`, {
      body: `+${coins} monete guadagnate! 💰`,
      icon: '⭐',
    });
  }, [sendNotification]);

  const notifyLevelUp = useCallback((newLevel: number) => {
    sendNotification(`LEVEL UP! Livello ${newLevel}!`, {
      body: 'Congratulazioni! Continua a correre! 🎉',
      icon: '🎊',
    });
  }, [sendNotification]);

  const notifyBoostExpired = useCallback((boostName: string) => {
    sendNotification(`Boost terminato!`, {
      body: `${boostName} è scaduto`,
      icon: '⏰',
    });
  }, [sendNotification]);

  const notifyObjectiveComplete = useCallback(() => {
    sendNotification(`Obiettivo giornaliero completato!`, {
      body: '+50 monete bonus! 🎁',
      icon: '🎯',
    });
  }, [sendNotification]);

  const notifyNewRecord = useCallback((recordType: string) => {
    sendNotification(`Nuovo record personale!`, {
      body: `Hai battuto il tuo record di ${recordType}! 🏆`,
      icon: '🥇',
    });
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    notifyKilometer,
    notifyExpMilestone,
    notifyLevelUp,
    notifyBoostExpired,
    notifyObjectiveComplete,
    notifyNewRecord,
  };
};
