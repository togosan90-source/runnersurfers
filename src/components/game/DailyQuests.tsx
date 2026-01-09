import { motion } from 'framer-motion';
import { Target, CheckCircle, Coins, Star, Flame, Sparkles, Zap, Gift } from 'lucide-react';
import { useGameStore, DAILY_QUESTS } from '@/store/gameStore';
import { useEffect } from 'react';

export function DailyQuests() {
  const {
    dailyQuests,
    dailyQuestsTotalDistance,
    checkAndResetDailyQuests
  } = useGameStore();

  useEffect(() => {
    checkAndResetDailyQuests();
  }, [checkAndResetDailyQuests]);

  const completedCount = dailyQuests.filter(q => q.completed).length;
  const totalCoinsEarned = dailyQuests.filter(q => q.completed).reduce((sum, q) => sum + q.coins, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), 0 10px 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #06b6d4, #10b981, #f59e0b, #f43f5e)',
          backgroundSize: '300% 100%',
          padding: '2px',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xs"
            style={{
              left: `${5 + i * 10}%`,
              bottom: 0,
            }}
            animate={{
              y: [0, -150],
              opacity: [0.6, 0],
              scale: [0.8, 1.2],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
            }}
          >
            {i % 4 === 0 ? '✨' : i % 4 === 1 ? '⭐' : i % 4 === 2 ? '💫' : '🔥'}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div
        className="px-4 py-4 relative z-10"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
          borderBottom: '2px solid #6d28d9',
        }}
      >
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
              }}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-5 h-5 text-yellow-900" />
            </motion.div>
            <div>
              <h3
                className="font-varsity text-xl text-white uppercase tracking-wide"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Quest Giornaliere
              </h3>
              <p className="text-xs text-violet-200">Completa per bonus extra!</p>
            </div>
          </div>

          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: completedCount === 10
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: completedCount === 10 ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none',
            }}
            animate={completedCount === 10 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Zap className={`w-4 h-4 ${completedCount === 10 ? 'text-yellow-300' : 'text-violet-300'}`} />
            <span className="font-bold text-white text-lg">{completedCount}/10</span>
          </motion.div>
        </div>
      </div>

      {/* Summary - if any completed */}
      {completedCount > 0 && (
        <motion.div
          className="px-4 py-3 flex items-center justify-between relative z-10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            background: 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(139,92,246,0.15) 100%)',
            borderBottom: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <span className="text-sm text-emerald-400 font-medium flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Ricompense ottenute:
          </span>
          <motion.span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold"
            style={{
              background: 'rgba(251, 191, 36, 0.2)',
              color: '#fbbf24',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Coins className="w-4 h-4" />
            +{totalCoinsEarned.toLocaleString()}
          </motion.span>
        </motion.div>
      )}

      {/* Quest List */}
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto relative z-10">
        {dailyQuests.map((quest, index) => {
          const progress = Math.min((dailyQuestsTotalDistance / quest.requiredKm) * 100, 100);
          const isCompleted = quest.completed;
          const isHot = quest.requiredKm >= 8;
          const isLegendary = quest.requiredKm >= 10;

          // Color scheme based on quest difficulty
          const getQuestColors = () => {
            if (isCompleted) {
              return {
                bg: 'linear-gradient(135deg, rgba(34,197,94,0.25) 0%, rgba(22,163,74,0.15) 100%)',
                border: '2px solid rgba(34,197,94,0.5)',
                accent: '#22c55e',
              };
            }
            if (isLegendary) {
              return {
                bg: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.1) 100%)',
                border: '2px solid rgba(251,191,36,0.5)',
                accent: '#fbbf24',
              };
            }
            if (isHot) {
              return {
                bg: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.1) 100%)',
                border: '2px solid rgba(249,115,22,0.4)',
                accent: '#f97316',
              };
            }
            return {
              bg: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
              accent: '#818cf8',
            };
          };

          const colors = getQuestColors();

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="rounded-xl p-3 transition-all relative overflow-hidden"
              style={{
                background: colors.bg,
                border: colors.border,
                boxShadow: isLegendary && !isCompleted ? '0 0 20px rgba(251,191,36,0.2)' : 'none',
              }}
            >
              {/* Legendary glow effect */}
              {isLegendary && !isCompleted && (
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-20"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Quest icon indicator */}
              {(isHot || isLegendary) && !isCompleted && (
                <motion.div
                  className="absolute right-3 top-3"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                  }}
                >
                  {isLegendary ? (
                    <span className="text-lg">👑</span>
                  ) : (
                    <Flame className="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  )}
                </motion.div>
              )}

              {/* Quest header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    </motion.div>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}40, ${colors.accent}20)`,
                        border: `1px solid ${colors.accent}60`,
                        color: colors.accent,
                      }}
                    >
                      {quest.id}
                    </div>
                  )}
                  <div>
                    <span
                      className="font-bold text-sm"
                      style={{ color: isCompleted ? '#22c55e' : colors.accent }}
                    >
                      Quest {quest.id}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {quest.requiredKm} km
                    </span>
                  </div>
                </div>

                {/* Rewards - only coins */}
                <motion.span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md font-bold"
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                  }}
                  animate={isLegendary && !isCompleted ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Coins className="w-3 h-3" />
                  {quest.coins.toLocaleString()}
                </motion.span>
              </div>

              {/* Progress bar */}
              {!isCompleted && (
                <div className="space-y-1">
                  <div
                    className="h-3 rounded-full overflow-hidden relative"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{
                        background: isLegendary
                          ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                          : isHot
                          ? 'linear-gradient(90deg, #f97316 0%, #ea580c 50%, #c2410c 100%)'
                          : 'linear-gradient(90deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
                        boxShadow: `0 0 10px ${colors.accent}40`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        }}
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>

                    {/* Percentage inside bar */}
                    {progress > 15 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{dailyQuestsTotalDistance.toFixed(2)} km</span>
                    <span style={{ color: colors.accent }}>{progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {/* Completed state */}
              {isCompleted && (
                <motion.div
                  className="flex items-center gap-2 text-xs font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: '#22c55e' }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                  >
                    ✅
                  </motion.span>
                  Completata! Ricompense ottenute
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 text-center text-xs relative z-10"
        style={{
          background: 'linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
          borderTop: '1px solid rgba(139,92,246,0.2)',
          color: '#a78bfa',
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          Reset giornaliero a mezzanotte
          <Sparkles className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}