import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Coins, Check, ArrowUp, X, Zap, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProfile } from '@/hooks/useProfile';

// Score upgrade system constants
const SCORE_UPGRADE_SUCCESS_RATES: Record<number, number> = {
  1: 100,  // +0 → +1: 100%
  2: 100,  // +1 → +2: 100%
  3: 65,   // +2 → +3: 65%
  4: 60,   // +3 → +4: 60%
  5: 55,   // +4 → +5: 55%
  6: 50,   // +5 → +6: 50%
  7: 30,   // +6 → +7: 30%
  8: 8,    // +7 → +8: 8%
  9: 5,    // +8 → +9: 5%
  10: 2,   // +9 → +10: 2%
};

// Progressive bonuses per level (matches shoe system)
const SCORE_LEVEL_BONUSES: Record<number, { scoreBonus: number; expBonus: number }> = {
  0: { scoreBonus: 0, expBonus: 0 },
  1: { scoreBonus: 2, expBonus: 2 },    // +1: 2% score, 2% exp
  2: { scoreBonus: 2, expBonus: 2 },    // +2: 2% score, 2% exp
  3: { scoreBonus: 3, expBonus: 3 },    // +3: 3% score, 3% exp
  4: { scoreBonus: 4, expBonus: 4 },    // +4: 4% score, 4% exp
  5: { scoreBonus: 5, expBonus: 5 },    // +5: 5% score, 5% exp
  6: { scoreBonus: 6, expBonus: 6 },    // +6: 6% score, 6% exp
  7: { scoreBonus: 8, expBonus: 8 },    // +7: 8% score, 8% exp
  8: { scoreBonus: 10, expBonus: 10 },  // +8: 10% score, 10% exp
  9: { scoreBonus: 12, expBonus: 12 },  // +9: 12% score, 12% exp
  10: { scoreBonus: 15, expBonus: 15 }, // +10: 15% score, 15% exp
};

// Get cumulative bonus for a level
function getScoreLevelBonus(level: number): { scoreBonus: number; expBonus: number } {
  let totalScoreBonus = 0;
  let totalExpBonus = 0;
  
  for (let i = 1; i <= level; i++) {
    const bonus = SCORE_LEVEL_BONUSES[i] || { scoreBonus: 0, expBonus: 0 };
    totalScoreBonus += bonus.scoreBonus;
    totalExpBonus += bonus.expBonus;
  }
  
  return { scoreBonus: totalScoreBonus, expBonus: totalExpBonus };
}

// Calculate upgrade cost based on level
function getScoreUpgradeCost(currentLevel: number, targetLevel: number, playerLevel: number): number {
  const baseCost = 5000;
  const coinMultiplier = 1 + (playerLevel - 1) * 0.01;
  
  const levelMultipliers: Record<number, number> = {
    1: 1,       // 5k base
    2: 2,       // 10k base
    3: 5,       // 25k base
    4: 10,      // 50k base
    5: 25,      // 125k base
    6: 50,      // 250k base
    7: 150,     // 750k base
    8: 400,     // 2M base
    9: 1000,    // 5M base
    10: 3000,   // 15M base
  };
  
  return Math.floor(baseCost * coinMultiplier * (levelMultipliers[targetLevel] || 1));
}

export function ScoreUpgradeShop() {
  const { user, scoreUpgradeLevel, attemptScoreUpgrade } = useGameStore();
  const { syncProfileFromStore } = useProfile();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<'success' | 'fail' | null>(null);

  // Get current level (default to 0 if not set)
  const currentLevel = scoreUpgradeLevel || 0;
  const nextLevel = currentLevel + 1;
  const canUpgrade = currentLevel < 10;
  
  const upgradeCost = canUpgrade ? getScoreUpgradeCost(currentLevel, nextLevel, user.level) : 0;
  const successRate = canUpgrade ? SCORE_UPGRADE_SUCCESS_RATES[nextLevel] : 0;
  const canAfford = user.coins >= upgradeCost;
  
  const currentBonus = getScoreLevelBonus(currentLevel);
  const nextBonus = canUpgrade ? getScoreLevelBonus(nextLevel) : currentBonus;

  const handleUpgrade = async () => {
    if (!canUpgrade || !canAfford || isUpgrading) return;
    
    setIsUpgrading(true);
    setUpgradeResult(null);
    
    // Simulate upgrade animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Attempt upgrade using store function
    const result = attemptScoreUpgrade();
    setUpgradeResult(result.success ? 'success' : 'fail');
    
    if (result.success) {
      toast.success(`🎉 Upgrade riuscito! Score +${result.newLevel}!`);
    } else {
      toast.error(`💔 Upgrade fallito! Hai perso ${result.cost.toLocaleString()} monete`);
    }
    
    // Sync to database after upgrade attempt
    await syncProfileFromStore();
    
    setTimeout(() => {
      setIsUpgrading(false);
      setUpgradeResult(null);
    }, 1000);
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return { bg: 'from-green-500 to-emerald-600', border: 'border-green-400', text: 'text-green-400' };
    if (level <= 4) return { bg: 'from-blue-500 to-cyan-600', border: 'border-blue-400', text: 'text-blue-400' };
    if (level <= 6) return { bg: 'from-purple-500 to-violet-600', border: 'border-purple-400', text: 'text-purple-400' };
    if (level <= 8) return { bg: 'from-orange-500 to-red-600', border: 'border-orange-400', text: 'text-orange-400' };
    return { bg: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', text: 'text-yellow-400' };
  };

  const currentColor = getLevelColor(currentLevel);
  const nextColor = getLevelColor(nextLevel);

  return (
    <div className="space-y-4">
      {/* Upgrade Progression Table */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-between gap-2 mb-4">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tabella Progressione Score Upgrade
            </span>
            <ArrowUp className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="rounded-lg border border-border overflow-hidden mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-3 py-2 text-left font-semibold">Livello</th>
                  <th className="px-3 py-2 text-center font-semibold">Successo</th>
                  <th className="px-3 py-2 text-center font-semibold">Score</th>
                  <th className="px-3 py-2 text-center font-semibold">EXP</th>
                  <th className="px-3 py-2 text-right font-semibold">Totale</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                  const bonus = SCORE_LEVEL_BONUSES[level];
                  const cumulative = getScoreLevelBonus(level);
                  const rate = SCORE_UPGRADE_SUCCESS_RATES[level];
                  const isCurrentTarget = level === nextLevel;
                  const isAchieved = level <= currentLevel;
                  
                  return (
                    <tr 
                      key={level} 
                      className={`border-t border-border/50 ${
                        isAchieved ? 'bg-green-500/20' :
                        isCurrentTarget ? 'bg-primary/20' :
                        level <= 2 ? 'bg-green-500/10' : 
                        level <= 6 ? 'bg-yellow-500/10' : 
                        level <= 8 ? 'bg-orange-500/10' : 
                        'bg-red-500/10'
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-primary flex items-center gap-1">
                        +{level}
                        {isAchieved && <Check className="w-3 h-3 text-green-500" />}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-medium ${
                          rate >= 60 ? 'text-green-500' :
                          rate >= 30 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-primary">+{bonus.scoreBonus}%</td>
                      <td className="px-3 py-2 text-center text-cyan-400">+{bonus.expBonus}%</td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-muted-foreground">
                          {cumulative.scoreBonus}% / {cumulative.expBonus}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <p className="text-sm text-muted-foreground mb-4">
        Potenzia il tuo bonus Score da +1 a +10! Bonus permanenti crescenti per ogni livello.
      </p>

      {/* Main Upgrade Card */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: currentLevel >= 8 
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)'
            : currentLevel >= 5
            ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)'
            : 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
          border: currentLevel >= 8 
            ? '3px solid #FCD34D'
            : currentLevel >= 5
            ? '3px solid #A78BFA'
            : '3px solid #34D399',
          boxShadow: currentLevel >= 8 
            ? '0 4px 0 0 #78350F, 0 0 30px rgba(252, 211, 77, 0.4)'
            : currentLevel >= 5
            ? '0 4px 0 0 #5B21B6, 0 0 30px rgba(167, 139, 250, 0.4)'
            : '0 4px 0 0 #065F46, 0 0 30px rgba(52, 211, 153, 0.4)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '5%', top: '10%', filter: 'drop-shadow(0 0 6px currentColor)' }}>⚡</div>
        <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '90%', top: '15%', filter: 'drop-shadow(0 0 6px currentColor)' }}>✨</div>
        <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '85%', top: '75%', filter: 'drop-shadow(0 0 6px currentColor)' }}>💎</div>
        <div className="absolute text-lg pointer-events-none opacity-50" style={{ left: '10%', top: '80%', filter: 'drop-shadow(0 0 6px currentColor)' }}>🔥</div>


        <div className="relative z-10 p-6">
          {/* Header with glow effect */}
          <div className="text-center mb-6">
            <motion.div
              className="relative inline-block"
              animate={isUpgrading ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 0.8,
                repeat: isUpgrading ? Infinity : 0,
              }}
            >
              {/* Glow background */}
              <div
                className="absolute inset-0 blur-2xl rounded-full"
                style={{
                  background: currentLevel >= 8 
                    ? 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)'
                    : currentLevel >= 5
                    ? 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(52,211,153,0.6) 0%, transparent 70%)',
                  opacity: 0.6,
                }}
              />
              
              {/* Level display */}
              <div 
                className="relative px-8 py-5 rounded-2xl shadow-2xl"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="p-3 rounded-xl"
                    style={{
                      background: currentLevel >= 8 
                        ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                        : currentLevel >= 5
                        ? 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)'
                        : 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                      boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(255,255,255,0.3)',
                        '0 0 35px rgba(255,255,255,0.5)',
                        '0 0 20px rgba(255,255,255,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-8 h-8 text-white drop-shadow-lg" />
                  </motion.div>
                  <div className="text-left">
                    <p 
                      className="text-xs uppercase tracking-widest font-bold"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                      Score Power
                    </p>
                    <p 
                      className="text-4xl font-black"
                      style={{ 
                        color: '#FFFFFF',
                        textShadow: '0 0 20px rgba(255,255,255,0.5)',
                      }}
                    >
                      +{currentLevel}
                    </p>
                  </div>
                  {currentLevel >= 8 && (
                    <div>
                      <Sparkles className="w-6 h-6 text-yellow-300" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.div 
              className="relative overflow-hidden rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                border: '2px solid #FCD34D',
                boxShadow: '0 2px 0 0 #B45309, 0 0 15px rgba(252, 211, 77, 0.3)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(252, 211, 77, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div className="relative">
                <div 
                  className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    boxShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                  }}
                >
                  <Zap className="w-5 h-5" style={{ color: '#78350F' }} />
                </div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#FCD34D' }}>Bonus Score</p>
                <p 
                  className="text-3xl font-black"
                  style={{ color: '#FEF3C7', textShadow: '0 0 10px rgba(254, 243, 199, 0.5)' }}
                >
                  +{currentBonus.scoreBonus}%
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative overflow-hidden rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
                border: '2px solid #22D3EE',
                boxShadow: '0 2px 0 0 #0E7490, 0 0 15px rgba(34, 211, 238, 0.3)',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.2) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <div className="relative">
                <div 
                  className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
                  }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: '#164E63' }} />
                </div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#22D3EE' }}>Bonus EXP</p>
                <p 
                  className="text-3xl font-black"
                  style={{ color: '#ECFEFF', textShadow: '0 0 10px rgba(236, 254, 255, 0.5)' }}
                >
                  +{currentBonus.expBonus}%
                </p>
              </div>
            </motion.div>
          </div>

          {/* Upgrade Section */}
          {canUpgrade ? (
            <>
              {/* Next Level Preview */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-br ${currentColor.bg}`}>
                  <span className="text-white font-bold">+{currentLevel}</span>
                </div>
                <ArrowUp className="w-6 h-6 text-muted-foreground" />
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-br ${nextColor.bg} ring-2 ring-white/50`}>
                  <span className="text-white font-bold">+{nextLevel}</span>
                </div>
              </div>

              {/* Success Rate Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Probabilità di successo</span>
                  <span className={`font-bold ${
                    successRate >= 60 ? 'text-green-500' :
                    successRate >= 30 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {successRate}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      successRate >= 60 ? 'bg-green-500' :
                      successRate >= 30 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${successRate}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Next Level Bonuses */}
              <div className="flex items-center justify-center gap-4 text-sm mb-4">
                <span className="text-muted-foreground">Dopo upgrade:</span>
                <span className="text-primary font-medium">Score +{nextBonus.scoreBonus}%</span>
                <span className="text-cyan-400 font-medium">EXP +{nextBonus.expBonus}%</span>
              </div>

              {/* Upgrade Result Animation */}
              <AnimatePresence>
                {upgradeResult && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`absolute inset-0 flex items-center justify-center z-20 ${
                      upgradeResult === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
                    }`}
                  >
                    {upgradeResult === 'success' ? (
                      <div className="text-center text-white">
                        <Check className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-2xl font-bold">SUCCESSO!</p>
                        <p className="text-lg">+{nextLevel}</p>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <X className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-2xl font-bold">FALLITO!</p>
                        <p className="text-sm">Riprova...</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upgrade Button */}
              <Button
                size="lg"
                className="w-full gap-2 h-14 text-lg font-bold"
                disabled={!canAfford || isUpgrading}
                onClick={handleUpgrade}
                style={{
                  background: canAfford 
                    ? 'linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--warning)) 100%)'
                    : undefined,
                  color: canAfford ? 'hsl(var(--gold-foreground))' : undefined,
                }}
              >
                {isUpgrading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Potenziando...
                  </>
                ) : canAfford ? (
                  <>
                    <Coins className="w-5 h-5" />
                    Potenzia per {upgradeCost.toLocaleString()} Monete
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {upgradeCost.toLocaleString()} Monete richieste
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-6xl">🏆</span>
              </motion.div>
              <p className="text-2xl font-bold text-gold mt-4">LIVELLO MASSIMO!</p>
              <p className="text-muted-foreground">Hai raggiunto +10</p>
              <p className="text-primary font-medium mt-2">
                Bonus totale: +{currentBonus.scoreBonus}% Score, +{currentBonus.expBonus}% EXP
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
