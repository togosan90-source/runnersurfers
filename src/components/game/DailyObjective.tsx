import { motion } from 'framer-motion';
import { Target, CheckCircle, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export function DailyObjective() {
  const { dailyObjective } = useGameStore();
  const progress = Math.min(
    (dailyObjective.currentDistance / dailyObjective.targetDistance) * 100,
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl px-5 py-3 shadow-lg relative overflow-hidden"
      style={{
        background: dailyObjective.completed 
          ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
          : 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
        borderTop: '3px solid rgba(255,255,255,0.4)',
        borderBottom: '4px solid #92400E',
        borderLeft: '2px solid rgba(255,255,255,0.2)',
        borderRight: '2px solid #B45309',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {dailyObjective.completed ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <Target className="w-5 h-5 text-white" />
          )}
          <span 
            className="font-display font-bold text-base"
            style={{
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Obiettivo Giornaliero
          </span>
        </div>
        <div 
          className="flex items-center gap-1 text-sm font-bold"
          style={{
            color: '#FCD34D',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          <Coins className="w-4 h-4" />
          <span>+{dailyObjective.reward}</span>
        </div>
      </div>

      <div className="relative h-3 bg-white/30 rounded-full overflow-hidden mb-2">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-white/90">
        <span>
          {dailyObjective.currentDistance.toFixed(1)} / {dailyObjective.targetDistance} km
        </span>
        <span>
          {dailyObjective.completed ? '✅ Completato!' : `${progress.toFixed(0)}%`}
        </span>
      </div>
    </motion.div>
  );
}
