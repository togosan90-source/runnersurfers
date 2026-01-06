import { motion } from 'framer-motion';
import { useGameStore, getExpNeeded, getTier } from '@/store/gameStore';

export function ExpBar() {
  const user = useGameStore((state) => state.user);
  const expNeeded = getExpNeeded(user.level + 1);
  const percentage = (user.exp / expNeeded) * 100;
  const tier = getTier(user.level);

  return (
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
  );
}
