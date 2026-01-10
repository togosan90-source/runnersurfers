import { motion } from 'framer-motion';
import { TrendingUp, Coins, Lock, Check, Sparkles, Star } from 'lucide-react';
import { useGameStore, SCORE_UPGRADES } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function UpgradeShop() {
  const { 
    user, 
    purchasedUpgrades, 
    purchaseUpgrade, 
    getTotalScoreBonus, 
    getTotalExpBonus 
  } = useGameStore();

  const totalScoreBonus = getTotalScoreBonus();
  const totalExpBonus = getTotalExpBonus();

  const handlePurchase = (upgradeId: number) => {
    const upgrade = SCORE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (purchasedUpgrades.includes(upgradeId)) {
      toast.error('Hai già acquistato questo upgrade!');
      return;
    }

    if (user.coins < upgrade.cost) {
      toast.error('Monete insufficienti!');
      return;
    }

    if (purchaseUpgrade(upgradeId)) {
      toast.success(`🎉 Upgrade +${upgrade.bonusPercent}% ${upgrade.type === 'score' ? 'Score' : 'EXP'} sbloccato!`);
    }
  };

  // Enhanced upgrade styles based on id and type
  const getUpgradeStyles = (id: number, type: 'score' | 'exp') => {
    if (type === 'exp') {
      return {
        bg: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)',
        border: '#A78BFA',
        shadow: '0 4px 0 0 #4C1D95, 0 0 25px rgba(167, 139, 250, 0.4)',
        glow: 'rgba(167, 139, 250, 0.6)',
        textColor: '#C4B5FD',
        iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        particle: '💜',
      };
    }
    const styles: Record<number, { bg: string; border: string; shadow: string; glow: string; textColor: string; iconBg: string; particle: string }> = {
      1: {
        bg: 'linear-gradient(135deg, #14532D 0%, #166534 50%, #22C55E 100%)',
        border: '#4ADE80',
        shadow: '0 4px 0 0 #14532D, 0 0 25px rgba(74, 222, 128, 0.4)',
        glow: 'rgba(74, 222, 128, 0.6)',
        textColor: '#86EFAC',
        iconBg: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        particle: '💚',
      },
      2: {
        bg: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 50%, #3B82F6 100%)',
        border: '#60A5FA',
        shadow: '0 4px 0 0 #1E3A5F, 0 0 25px rgba(59, 130, 246, 0.4)',
        glow: 'rgba(96, 165, 250, 0.6)',
        textColor: '#93C5FD',
        iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
        particle: '💙',
      },
      4: {
        bg: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 50%, #F97316 100%)',
        border: '#FB923C',
        shadow: '0 4px 0 0 #7C2D12, 0 0 25px rgba(249, 115, 22, 0.4)',
        glow: 'rgba(251, 146, 60, 0.6)',
        textColor: '#FDBA74',
        iconBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        particle: '🧡',
      },
      5: {
        bg: 'linear-gradient(135deg, #78350F 0%, #B45309 30%, #FCD34D 50%, #B45309 70%, #78350F 100%)',
        border: '#FCD34D',
        shadow: '0 4px 0 0 #451A03, 0 0 35px rgba(252, 211, 77, 0.5)',
        glow: 'rgba(252, 211, 77, 0.7)',
        textColor: '#FEF3C7',
        iconBg: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
        particle: '⭐',
      },
    };
    return styles[id] || styles[1];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Total Bonus Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 rounded-xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #14532D 0%, #166534 50%, #4C1D95 100%)',
          border: '3px solid #4ADE80',
          boxShadow: '0 4px 0 0 #14532D, 0 0 30px rgba(74, 222, 128, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)',
        }}
      >
        {/* Animated shine */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                boxShadow: '0 0 20px rgba(252, 211, 77, 0.6)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6 text-amber-900" />
            </motion.div>
            <span 
              className="font-varsity text-lg uppercase tracking-wide"
              style={{
                color: '#FEF3C7',
                textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              }}
            >
              Bonus Totali Attivi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div 
              className="px-4 py-2 rounded-xl text-center"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #4ADE80',
              }}
            >
              <span className="text-xs text-green-300 block">Score</span>
              <span 
                className="font-display text-2xl font-bold"
                style={{
                  color: '#4ADE80',
                  textShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                }}
              >
                +{totalScoreBonus}%
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-xl text-center"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #A78BFA',
              }}
            >
              <span className="text-xs text-purple-300 block">EXP</span>
              <span 
                className="font-display text-2xl font-bold"
                style={{
                  color: '#A78BFA',
                  textShadow: '0 0 10px rgba(167, 139, 250, 0.5)',
                }}
              >
                +{totalExpBonus}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-muted-foreground mb-4">
        Upgrade PERMANENTI - Aumenta i tuoi guadagni per sempre! ⚡
      </p>

      <div className="space-y-4">
        {SCORE_UPGRADES.map((upgrade, index) => {
          const isPurchased = purchasedUpgrades.includes(upgrade.id);
          const canAfford = user.coins >= upgrade.cost;
          const style = getUpgradeStyles(upgrade.id, upgrade.type);
          const isLegendary = upgrade.id === 5;

          return (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="rounded-xl overflow-hidden relative cursor-pointer"
              style={{
                background: style.bg,
                border: isPurchased ? '4px solid #4ADE80' : `3px solid ${style.border}`,
                boxShadow: `${style.shadow}, inset 0 1px 0 0 rgba(255,255,255,0.2)`,
              }}
            >
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                }}
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />


              <div className="flex relative z-10">
                {/* Icon Section */}
                <motion.div 
                  className="w-24 h-24 flex items-center justify-center relative"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                  }}
                  animate={isLegendary ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: style.iconBg,
                      boxShadow: `0 0 25px ${style.glow}`,
                    }}
                    animate={{
                      scale: [0.9, 1, 0.9],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative z-10">
                    {upgrade.type === 'exp' ? (
                      <Star 
                        className="w-10 h-10" 
                        style={{ 
                          color: 'white',
                          filter: `drop-shadow(0 0 10px ${style.glow})`,
                        }} 
                      />
                    ) : (
                      <TrendingUp 
                        className="w-10 h-10" 
                        style={{ 
                          color: 'white',
                          filter: `drop-shadow(0 0 10px ${style.glow})`,
                        }} 
                      />
                    )}
                  </div>
                </motion.div>
                
                {/* Content Section */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 
                        className="font-varsity text-lg uppercase tracking-wide flex items-center gap-2"
                        style={{
                          color: style.textColor,
                          textShadow: `0 2px 4px rgba(0,0,0,0.5), 0 0 10px ${style.glow}`,
                        }}
                      >
                        <span className="text-xl">{style.particle}</span>
                        Upgrade #{upgrade.id}
                        {isPurchased && (
                          <motion.span 
                            className="px-2 py-1 rounded-lg text-xs font-bold ml-2"
                            style={{
                              background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
                              color: '#14532D',
                              border: '2px solid #86EFAC',
                              boxShadow: '0 2px 0 0 #166534, 0 0 10px rgba(74, 222, 128, 0.5)',
                            }}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                          >
                            ✓ ATTIVO
                          </motion.span>
                        )}
                        {isLegendary && !isPurchased && (
                          <motion.span 
                            className="px-2 py-1 rounded-lg text-xs font-bold ml-2"
                            style={{
                              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                              color: '#78350F',
                              border: '2px solid #FEF3C7',
                              boxShadow: '0 2px 0 0 #B45309, 0 0 10px rgba(252, 211, 77, 0.5)',
                            }}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                          >
                            ⭐ LEGENDARY
                          </motion.span>
                        )}
                      </h4>
                      <p 
                        className="text-sm mt-1"
                        style={{ color: `${style.textColor}99` }}
                      >
                        {upgrade.type === 'score' ? '⚡ Bonus Score Permanente' : '✨ Bonus EXP Permanente'}
                      </p>
                    </div>
                    <motion.div 
                      className="px-4 py-2 rounded-xl"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: `2px solid ${style.border}`,
                        boxShadow: `0 0 15px ${style.glow}`,
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <span 
                        className="font-display text-2xl font-bold"
                        style={{
                          color: style.textColor,
                          textShadow: `0 0 15px ${style.glow}`,
                        }}
                      >
                        +{upgrade.bonusPercent}%
                      </span>
                    </motion.div>
                  </div>

                  {isPurchased ? (
                    <div 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl w-fit"
                      style={{
                        background: 'rgba(74, 222, 128, 0.2)',
                        border: '2px solid #4ADE80',
                      }}
                    >
                      <Check className="w-5 h-5" style={{ color: '#4ADE80' }} />
                      <span 
                        className="font-bold"
                        style={{ color: '#4ADE80' }}
                      >
                        Acquistato
                      </span>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full gap-2 font-bold text-base relative overflow-hidden"
                      style={{
                        background: canAfford 
                          ? `linear-gradient(135deg, ${style.border}CC 0%, ${style.border} 100%)`
                          : 'rgba(100,100,100,0.5)',
                        border: `2px solid ${style.border}`,
                        color: canAfford ? '#1F2937' : '#9CA3AF',
                        boxShadow: canAfford 
                          ? `0 3px 0 0 rgba(0,0,0,0.3), 0 0 15px ${style.glow}`
                          : 'none',
                      }}
                      disabled={!canAfford}
                      onClick={() => handlePurchase(upgrade.id)}
                    >
                      {canAfford ? (
                        <>
                          <Coins className="w-5 h-5" />
                          {upgrade.cost.toLocaleString()} Monete
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          {upgrade.cost.toLocaleString()} Monete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        🔒 Gli upgrade sono PERMANENTI e si applicano a tutte le corse future!
      </p>
    </motion.div>
  );
}