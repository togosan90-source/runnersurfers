import { motion } from 'framer-motion';
import { Target, CheckCircle, Coins, Star, Trophy } from 'lucide-react';
import { useGameStore, DAILY_QUESTS } from '@/store/gameStore';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

export function DailyQuests() {
  const { 
    dailyQuests, 
    dailyQuestsTotalDistance, 
    checkAndResetDailyQuests 
  } = useGameStore();

  // Check and reset quests on mount
  useEffect(() => {
    checkAndResetDailyQuests();
  }, [checkAndResetDailyQuests]);

  const completedCount = dailyQuests.filter(q => q.completed).length;
  const totalCoinsEarned = dailyQuests
    .filter(q => q.completed)
    .reduce((sum, q) => sum + q.coins, 0);
  const totalExpEarned = dailyQuests
    .filter(q => q.completed)
    .reduce((sum, q) => sum + q.expPercent, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #0f3460',
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, #e94560 0%, #ff6b6b 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-white" />
          <span 
            className="font-display font-bold text-lg text-white"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
          >
            Quest Giornaliere
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold">
            {completedCount}/10
          </span>
        </div>
      </div>

      {/* Summary */}
      {completedCount > 0 && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 flex items-center justify-between">
          <span className="text-sm text-green-400">Guadagnato oggi:</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <Coins className="w-4 h-4" />
              +{totalCoinsEarned.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-purple-400 font-bold">
              <Star className="w-4 h-4" />
              +{totalExpEarned}% EXP
            </span>
          </div>
        </div>
      )}

      {/* Quest List */}
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {dailyQuests.map((quest, index) => {
          const progress = Math.min((dailyQuestsTotalDistance / quest.requiredKm) * 100, 100);
          const isCompleted = quest.completed;
          
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl p-3 transition-all ${
                isCompleted 
                  ? 'bg-green-500/20 border border-green-500/40' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Target className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className={`font-bold ${isCompleted ? 'text-green-400' : 'text-foreground'}`}>
                    Quest {quest.id}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    — {quest.requiredKm} km
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-purple-400 font-bold">
                    +{quest.expPercent}% EXP
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Coins className="w-3 h-3" />
                    {quest.coins.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {!isCompleted && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{dailyQuestsTotalDistance.toFixed(2)} km</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <div className="text-xs text-green-400 font-medium">
                  ✓ Completata!
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-white/5 text-center text-xs text-muted-foreground">
        Le quest si resettano ogni giorno a mezzanotte
      </div>
    </motion.div>
  );
}