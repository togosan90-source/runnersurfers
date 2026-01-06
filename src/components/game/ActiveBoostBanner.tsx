import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export function ActiveBoostBanner() {
  const { activeBoost } = useGameStore();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!activeBoost) return;

    const updateTimer = () => {
      const remaining = activeBoost.endTime - Date.now();
      if (remaining <= 0) {
        setTimeRemaining('');
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeBoost]);

  if (!activeBoost || !timeRemaining) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg px-4 py-2 border border-accent/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{activeBoost.boost.icon}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-sm font-bold text-accent">
                {activeBoost.boost.name} Boost
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              +{activeBoost.boost.scoreBonus}% Score
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{timeRemaining}</span>
        </div>
      </div>
    </motion.div>
  );
}
