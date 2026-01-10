import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Coins, Check, ArrowUp, X, Zap, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore, SHOES, SHOE_UPGRADE_SUCCESS_RATES, SHOE_UPGRADE_BONUSES, getShoeUpgradeCost, getShoeUpgradeBonus } from '@/store/gameStore';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProfile } from '@/hooks/useProfile';

export function ShoeUpgradeShop() {
  const { user, ownedShoes, shoeUpgrades, getShoeUpgradeLevel, attemptShoeUpgrade } = useGameStore();
  const { syncProfileFromStore } = useProfile();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [result, setResult] = useState<{ shoeId: string; success: boolean } | null>(null);

  const handleUpgrade = (shoeId: string) => {
    const currentLevel = getShoeUpgradeLevel(shoeId);
    if (currentLevel >= 10) {
      toast.error('Livello massimo raggiunto!');
      return;
    }

    const cost = getShoeUpgradeCost(user.level, currentLevel + 1, shoeId);
    if (user.coins < cost) {
      toast.error('Monete insufficienti!');
      return;
    }

    setUpgrading(shoeId);
    
    // Simula animazione upgrade
    setTimeout(async () => {
      const { success, newLevel, cost: spentCost } = attemptShoeUpgrade(shoeId);
      
      setResult({ shoeId, success });
      setUpgrading(null);
      
      if (success) {
        toast.success(`✨ Upgrade riuscito! +${newLevel} raggiunto!`);
      } else {
        toast.error(`💔 Upgrade fallito! Hai speso ${spentCost.toLocaleString()} monete`);
      }
      
      // Sync to database after upgrade attempt
      await syncProfileFromStore();
      
      setTimeout(() => setResult(null), 2000);
    }, 1500);
  };

  const getShoeStyle = (id: string) => {
    switch (id) {
      case 'avalon': return {
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E3A8A 100%)',
        border: '#60A5FA',
        shadow: '0 4px 0 0 #1E40AF, 0 0 30px rgba(96, 165, 250, 0.4)',
        glow: 'rgba(96, 165, 250, 0.6)',
      };
      case 'zeus': return {
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
        border: '#FCD34D',
        shadow: '0 4px 0 0 #78350F, 0 0 30px rgba(252, 211, 77, 0.4)',
        glow: 'rgba(252, 211, 77, 0.6)',
      };
      case 'woodblas': return {
        gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #166534 100%)',
        border: '#4ADE80',
        shadow: '0 4px 0 0 #14532D, 0 0 30px rgba(74, 222, 128, 0.4)',
        glow: 'rgba(74, 222, 128, 0.6)',
      };
      case 'energy': return {
        gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #5B21B6 100%)',
        border: '#C084FC',
        shadow: '0 4px 0 0 #4C1D95, 0 0 30px rgba(192, 132, 252, 0.4)',
        glow: 'rgba(192, 132, 252, 0.6)',
      };
      case 'infinity': return {
        gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #164E63 100%)',
        border: '#22D3EE',
        shadow: '0 4px 0 0 #0E7490, 0 0 30px rgba(34, 211, 238, 0.4)',
        glow: 'rgba(34, 211, 238, 0.6)',
      };
      default: return {
        gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)',
        border: '#9CA3AF',
        shadow: '0 4px 0 0 #1F2937, 0 0 30px rgba(156, 163, 175, 0.4)',
        glow: 'rgba(156, 163, 175, 0.6)',
      };
    }
  };

  const ownedShoesList = SHOES.filter(shoe => ownedShoes.includes(shoe.id));

  if (ownedShoesList.length === 0) {
    return (
      <div className="text-center py-12">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-muted-foreground">Nessuna scarpa posseduta</h3>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Acquista scarpe nella sezione Items per potenziarle!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upgrade Progression Table */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-between gap-2 mb-4">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tabella Progressione Upgrade
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
                  <th className="px-3 py-2 text-center font-semibold">Monete</th>
                  <th className="px-3 py-2 text-center font-semibold">EXP</th>
                  <th className="px-3 py-2 text-right font-semibold">Totale</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                  const bonus = SHOE_UPGRADE_BONUSES[level];
                  const cumulative = getShoeUpgradeBonus(level);
                  const successRate = SHOE_UPGRADE_SUCCESS_RATES[level];
                  
                  return (
                    <tr 
                      key={level} 
                      className={`border-t border-border/50 ${
                        level <= 2 ? 'bg-green-500/10' : 
                        level <= 6 ? 'bg-yellow-500/10' : 
                        level <= 8 ? 'bg-orange-500/10' : 
                        'bg-red-500/10'
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-primary">+{level}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-medium ${
                          successRate >= 60 ? 'text-green-500' :
                          successRate >= 30 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {successRate}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-gold">+{bonus.coinBonus}%</td>
                      <td className="px-3 py-2 text-center text-cyan-400">+{bonus.expBonus}%</td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-muted-foreground">
                          {cumulative.coinBonus}% / {cumulative.expBonus}%
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
        Potenzia le tue scarpe da +1 a +10! Bonus crescenti per ogni livello.
      </p>

      {ownedShoesList.map((shoe, index) => {
        const currentLevel = getShoeUpgradeLevel(shoe.id);
        const nextLevel = currentLevel + 1;
        const isMaxed = currentLevel >= 10;
        const successRate = isMaxed ? 0 : SHOE_UPGRADE_SUCCESS_RATES[nextLevel];
        const cost = isMaxed ? 0 : getShoeUpgradeCost(user.level, nextLevel, shoe.id);
        const canAfford = user.coins >= cost;
        const isUpgrading = upgrading === shoe.id;
        const upgradeResult = result?.shoeId === shoe.id ? result : null;
        const currentBonus = getShoeUpgradeBonus(currentLevel);
        const isEquipped = user.equippedShoes === shoe.id;
        const shoeStyle = getShoeStyle(shoe.id);

        return (
          <motion.div
            key={shoe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: shoeStyle.gradient,
              border: `3px solid ${shoeStyle.border}`,
              boxShadow: shoeStyle.shadow,
            }}
          >
            {/* Decorative elements */}
            <div className="absolute text-lg pointer-events-none opacity-40" style={{ left: '5%', top: '10%', filter: 'drop-shadow(0 0 6px currentColor)' }}>✨</div>
            <div className="absolute text-lg pointer-events-none opacity-40" style={{ left: '85%', top: '15%', filter: 'drop-shadow(0 0 6px currentColor)' }}>⚡</div>

            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Equipped badge */}
            {isEquipped && (
              <motion.div 
                className="absolute top-3 right-3 z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span 
                  className="text-[10px] font-bold px-3 py-1 rounded-lg uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    color: '#78350F',
                    boxShadow: '0 0 15px rgba(252, 211, 77, 0.5)',
                  }}
                >
                  ⭐ Equipaggiato
                </span>
              </motion.div>
            )}

            {/* Upgrade animation overlay */}
            <AnimatePresence>
              {isUpgrading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 100%)',
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-6xl"
                  >
                    ⚡
                  </motion.div>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute bottom-8 text-gold font-bold"
                  >
                    Potenziamento in corso...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result animation */}
            <AnimatePresence>
              {upgradeResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{
                    background: upgradeResult.success 
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(16, 185, 129, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%)',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {upgradeResult.success ? (
                      <Check className="w-20 h-20 text-white" />
                    ) : (
                      <X className="w-20 h-20 text-white" />
                    )}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-8 text-white font-bold text-xl"
                  >
                    {upgradeResult.success ? 'SUCCESSO!' : 'FALLITO!'}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 p-5">
              {/* Header with shoe info */}
              <div className="flex items-center gap-4 mb-4">
                {/* Shoe icon */}
                <motion.div 
                  className="relative w-20 h-20 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${shoeStyle.glow}`,
                      `0 0 35px ${shoeStyle.glow}`,
                      `0 0 20px ${shoeStyle.glow}`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl">{shoe.icon}</span>
                  
                  {/* Level badge */}
                  {currentLevel > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{
                        background: currentLevel >= 7 
                          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                          : currentLevel >= 4 
                            ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 0 15px rgba(0,0,0,0.5)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      +{currentLevel}
                    </motion.div>
                  )}
                </motion.div>

                {/* Shoe name and base stats */}
                <div className="flex-1">
                  <h4 
                    className="font-varsity text-lg uppercase tracking-wide"
                    style={{
                      color: '#FFFFFF',
                      textShadow: '2px 2px 0px rgba(0,0,0,0.3), 0 0 15px rgba(255,255,255,0.3)',
                    }}
                  >
                    {shoe.name}
                  </h4>
                  <p 
                    className="text-xs font-medium"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                  >
                    Base: +{shoe.coinBonus}% Monete, +{shoe.expBonus}% EXP
                  </p>
                  
                  {/* Current upgrade bonus */}
                  {currentLevel > 0 && (
                    <div 
                      className="flex items-center gap-2 text-xs mt-1 px-2 py-1 rounded-lg inline-flex"
                      style={{
                        background: 'rgba(252, 211, 77, 0.2)',
                        border: '1px solid rgba(252, 211, 77, 0.5)',
                      }}
                    >
                      <Zap className="w-3 h-3" style={{ color: '#FCD34D' }} />
                      <span style={{ color: '#FCD34D' }} className="font-medium">
                        +{currentBonus.coinBonus}% monete, +{currentBonus.expBonus}% exp
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upgrade section */}
              {!isMaxed ? (
                <div 
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {/* Level transition */}
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div 
                      className="px-3 py-1.5 rounded-lg font-bold text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                      }}
                    >
                      +{currentLevel}
                    </div>
                    <ArrowUp className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                    <motion.div 
                      className="px-3 py-1.5 rounded-lg font-bold text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                        color: '#78350F',
                        boxShadow: '0 0 15px rgba(252, 211, 77, 0.5)',
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      +{nextLevel}
                    </motion.div>
                  </div>

                  {/* Success rate */}
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Probabilità di successo</span>
                    <span 
                      className="font-bold"
                      style={{
                        color: successRate >= 50 ? '#4ADE80' : 
                               successRate >= 20 ? '#FCD34D' : '#F87171'
                      }}
                    >
                      {successRate}%
                    </span>
                  </div>

                  {/* Success rate bar */}
                  <div 
                    className="h-3 rounded-full overflow-hidden mb-3"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${successRate}%`,
                        background: successRate >= 50 
                          ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                          : successRate >= 20 
                            ? 'linear-gradient(90deg, #eab308, #facc15)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                        boxShadow: successRate >= 50 
                          ? '0 0 10px rgba(74, 222, 128, 0.5)'
                          : successRate >= 20 
                            ? '0 0 10px rgba(252, 211, 77, 0.5)'
                            : '0 0 10px rgba(248, 113, 113, 0.5)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${successRate}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Upgrade button */}
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade(shoe.id)}
                    disabled={!canAfford || isUpgrading}
                    className="w-full gap-2 font-bold"
                    style={canAfford ? {
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                      color: '#78350F',
                      border: '2px solid #FEF3C7',
                      boxShadow: '0 2px 0 0 #B45309, 0 0 15px rgba(252, 211, 77, 0.4)',
                    } : undefined}
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>Potenzia</span>
                    <Coins className="w-4 h-4 ml-1" />
                    <span>{cost.toLocaleString()}</span>
                  </Button>
                </div>
              ) : (
                <div 
                  className="text-center py-4 rounded-xl"
                  style={{
                    background: 'rgba(252, 211, 77, 0.2)',
                    border: '2px solid #FCD34D',
                    boxShadow: '0 0 20px rgba(252, 211, 77, 0.3)',
                  }}
                >
                  <div>
                    <Sparkles className="w-10 h-10 mx-auto mb-2" style={{ color: '#FCD34D' }} />
                  </div>
                  <p 
                    className="font-varsity text-lg uppercase"
                    style={{ color: '#FCD34D', textShadow: '0 0 10px rgba(252, 211, 77, 0.5)' }}
                  >
                    Livello Massimo +10
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Bonus: +{currentBonus.coinBonus}% monete, +{currentBonus.expBonus}% exp
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}