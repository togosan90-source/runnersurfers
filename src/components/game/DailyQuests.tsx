import { motion } from 'framer-motion';
import { Target, CheckCircle, Coins, Star, Trophy, Flame } from 'lucide-react';
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
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #fef9c3 0%, #e0f2fe 50%, #fef3c7 100%)',
        border: '3px solid #38bdf8',
        boxShadow: '0 0 30px rgba(56, 189, 248, 0.3), inset 0 0 20px rgba(250, 204, 21, 0.2)',
      }}
    >
      {/* Animated fire particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${i % 2 === 0 ? '#ff6b35' : '#ffaa00'} 0%, transparent 70%)`,
              left: `${10 + i * 12}%`,
              bottom: 0,
            }}
            animate={{
              y: [0, -100, -200],
              opacity: [0.8, 0.5, 0],
              scale: [1, 1.5, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div 
        className="px-4 py-4 flex items-center justify-between relative z-10"
        style={{
          background: 'linear-gradient(90deg, #ff4500 0%, #ff6b35 50%, #ff8c00 100%)',
          borderBottom: '3px solid #cc3700',
        }}
      >
        {/* Animated flames on header */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${i * 25}%`,
                width: '30px',
                height: '20px',
                background: 'linear-gradient(to top, #ffcc00, transparent)',
                borderRadius: '50% 50% 0 0',
                filter: 'blur(3px)',
              }}
              animate={{
                scaleY: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
          >
            <Flame className="w-6 h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,200,0,0.8)]" />
          </motion.div>
          <span 
            className="font-display font-bold text-xl text-white"
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,150,0,0.5)' 
            }}
          >
            🔥 Quest Giornaliere
          </span>
        </div>
        <motion.div 
          className="flex items-center gap-3 text-sm"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span 
            className="px-3 py-1 rounded-full text-white font-bold"
            style={{
              background: 'linear-gradient(135deg, #cc3700 0%, #ff4500 100%)',
              boxShadow: '0 0 10px rgba(255,69,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {completedCount}/10
          </span>
        </motion.div>
      </motion.div>

      {/* Summary */}
      {completedCount > 0 && (
        <motion.div 
          className="px-4 py-3 flex items-center justify-between relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(255,150,0,0.2) 100%)',
            borderBottom: '2px solid rgba(255,150,0,0.3)',
          }}
        >
          <span className="text-sm text-orange-300 font-medium flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Guadagnato oggi:
          </span>
          <div className="flex items-center gap-4 text-sm">
            <motion.span 
              className="flex items-center gap-1 text-yellow-400 font-bold"
              animate={{ textShadow: ['0 0 5px #ffd700', '0 0 15px #ffd700', '0 0 5px #ffd700'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Coins className="w-4 h-4" />
              +{totalCoinsEarned.toLocaleString()}
            </motion.span>
            <span className="flex items-center gap-1 text-purple-400 font-bold">
              <Star className="w-4 h-4" />
              +{totalExpEarned}% EXP
            </span>
          </div>
        </motion.div>
      )}

      {/* Quest List */}
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto relative z-10">
        {dailyQuests.map((quest, index) => {
          const progress = Math.min((dailyQuestsTotalDistance / quest.requiredKm) * 100, 100);
          const isCompleted = quest.completed;
          const isHot = quest.requiredKm >= 8;
          
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="rounded-xl p-3 transition-all relative overflow-hidden"
              style={{
                background: isCompleted 
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(22,163,74,0.2) 100%)'
                  : isHot
                    ? 'linear-gradient(135deg, rgba(255,69,0,0.2) 0%, rgba(255,100,0,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: isCompleted 
                  ? '2px solid rgba(34,197,94,0.5)'
                  : isHot 
                    ? '2px solid rgba(255,100,0,0.4)'
                    : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isHot && !isCompleted ? '0 0 15px rgba(255,69,0,0.2)' : 'none',
              }}
            >
              {/* Fire effect for hot quests */}
              {isHot && !isCompleted && (
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className="w-5 h-5 text-orange-500 drop-shadow-[0_0_5px_rgba(255,100,0,0.8)]" />
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                    </motion.div>
                  ) : (
                    <Target className={`w-5 h-5 ${isHot ? 'text-orange-400' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`font-bold ${
                    isCompleted ? 'text-green-400' : isHot ? 'text-orange-300' : 'text-foreground'
                  }`}>
                    Quest {quest.id}
                  </span>
                  <span className={`text-sm ${isHot ? 'text-orange-400/70' : 'text-muted-foreground'}`}>
                    — {quest.requiredKm} km
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-purple-400 font-bold">
                    +{quest.expPercent}% EXP
                  </span>
                  <motion.span 
                    className="flex items-center gap-1 text-yellow-400 font-bold"
                    animate={isHot && !isCompleted ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Coins className="w-3 h-3" />
                    {quest.coins.toLocaleString()}
                  </motion.span>
                </div>
              </div>
              
              {!isCompleted && (
                <div className="space-y-1">
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: isHot 
                          ? 'linear-gradient(90deg, #ff4500 0%, #ff8c00 50%, #ffcc00 100%)'
                          : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                        boxShadow: isHot ? '0 0 10px rgba(255,140,0,0.5)' : 'none',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{dailyQuestsTotalDistance.toFixed(2)} km</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <motion.div 
                  className="text-xs text-green-400 font-medium flex items-center gap-1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    🔥
                  </motion.span>
                  Completata!
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <motion.div 
        className="px-4 py-3 text-center text-xs relative z-10"
        style={{
          background: 'linear-gradient(90deg, rgba(255,69,0,0.1) 0%, rgba(255,140,0,0.1) 100%)',
          borderTop: '2px solid rgba(255,100,0,0.2)',
          color: '#ff8c00',
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <Flame className="w-3 h-3" />
          Le quest si resettano ogni giorno a mezzanotte
          <Flame className="w-3 h-3" />
        </span>
      </motion.div>
    </motion.div>
  );
}
