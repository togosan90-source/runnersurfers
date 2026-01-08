import { motion } from 'framer-motion';
import { useGameStore, getExpNeeded, getTier, getExpPerKm } from '@/store/gameStore';
import { MapPin } from 'lucide-react';

export function ExpBar() {
  const user = useGameStore((state) => state.user);
  const expNeeded = getExpNeeded(user.level + 1);
  const percentage = (user.exp / expNeeded) * 100;
  const tier = getTier(user.level);
  
  // Calculate km progress
  const expPerKm = getExpPerKm(user.level);
  const kmCurrent = user.exp / expPerKm;
  const kmNeeded = expNeeded / expPerKm;
  const kmPercentage = (kmCurrent / kmNeeded) * 100;

  return (
    <div className="space-y-3">
      {/* EXP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-primary">LV.{user.level}</span>
            <span className={`text-tier-${tier.color} font-medium`}>
              {tier.icon} {tier.name}
            </span>
          </div>
          <span className="text-muted-foreground font-mono">
            {user.exp}/{expNeeded} EXP
          </span>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {percentage.toFixed(0)}% - Prossimo livello
        </p>
      </div>

      {/* KM Progress Bar */}
      <div className="relative p-3 rounded-xl bg-gradient-to-br from-accent/30 via-accent/20 to-transparent border border-accent/30 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/50 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <span className="font-medium text-accent-foreground">Distanza per LV.{user.level + 1}</span>
          </div>
          <span className="font-mono text-accent-foreground font-bold">
            {kmCurrent.toFixed(2)} / {kmNeeded.toFixed(2)} km
          </span>
        </div>
        
        <div className="relative h-4 bg-background/50 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 50%, hsl(var(--accent)) 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${kmPercentage}%`,
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
            }}
            transition={{ 
              width: { duration: 0.6, ease: 'easeOut' },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
            }}
          />
          {/* Glow effect */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full opacity-50 blur-sm"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${kmPercentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground">
            🏃 {expPerKm}% EXP/km al tuo livello
          </p>
          <p className="text-[10px] font-medium text-accent-foreground">
            {(kmNeeded - kmCurrent).toFixed(2)} km rimanenti
          </p>
        </div>
      </div>
    </div>
  );
}
