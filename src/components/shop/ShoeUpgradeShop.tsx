import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Coins, Check, ArrowUp, X, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore, SHOES, SHOE_UPGRADE_SUCCESS_RATES, getShoeUpgradeCost, getShoeUpgradeBonus } from '@/store/gameStore';
import { toast } from 'sonner';

export function ShoeUpgradeShop() {
  const { user, ownedShoes, shoeUpgrades, getShoeUpgradeLevel, attemptShoeUpgrade } = useGameStore();
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
    setTimeout(() => {
      const { success, newLevel, cost: spentCost } = attemptShoeUpgrade(shoeId);
      
      setResult({ shoeId, success });
      setUpgrading(null);
      
      if (success) {
        toast.success(`✨ Upgrade riuscito! +${newLevel} raggiunto!`);
      } else {
        toast.error(`💔 Upgrade fallito! Hai speso ${spentCost.toLocaleString()} monete`);
      }
      
      setTimeout(() => setResult(null), 2000);
    }, 1500);
  };

  const getShoeGradient = (id: string) => {
    switch (id) {
      case 'avalon': return 'from-blue-500 to-blue-700';
      case 'zeus': return 'from-yellow-400 to-orange-500';
      case 'woodblas': return 'from-green-400 to-emerald-600';
      case 'energy': return 'from-purple-400 to-pink-500';
      case 'infinity': return 'from-cyan-400 to-violet-600';
      default: return 'from-gray-400 to-gray-600';
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

        return (
          <motion.div
            key={shoe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-xl border-2 overflow-hidden ${
              isEquipped ? 'border-primary' : 'border-border'
            }`}
            style={{
              background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%)',
            }}
          >
            {/* Equipped badge */}
            {isEquipped && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                  EQUIPAGGIATO
                </span>
              </div>
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
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(16, 185, 129, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)',
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

            <div className="flex">
              {/* Shoe icon with upgrade level */}
              <div className={`relative w-28 h-28 bg-gradient-to-br ${getShoeGradient(shoe.id)} flex items-center justify-center`}>
                <span className="text-5xl">{shoe.icon}</span>
                
                {/* Level badge */}
                {currentLevel > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: currentLevel >= 7 
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                        : currentLevel >= 4 
                          ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      boxShadow: '0 0 15px rgba(0,0,0,0.3)',
                      color: 'white',
                    }}
                  >
                    +{currentLevel}
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-foreground">{shoe.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Base: +{shoe.coinBonus}% Monete, +{shoe.expBonus}% EXP
                    </p>
                  </div>
                </div>

                {/* Current upgrade bonus */}
                {currentLevel > 0 && (
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <Zap className="w-3 h-3 text-gold" />
                    <span className="text-gold font-medium">
                      Bonus upgrade: +{currentBonus.coinBonus}% monete, +{currentBonus.expBonus}% exp
                    </span>
                  </div>
                )}

                {/* Upgrade info */}
                {!isMaxed ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        +{currentLevel} → +{nextLevel}
                      </span>
                      <span 
                        className={`font-bold ${
                          successRate >= 50 ? 'text-green-400' : 
                          successRate >= 20 ? 'text-yellow-400' : 'text-red-400'
                        }`}
                      >
                        {successRate}% successo
                      </span>
                    </div>

                    {/* Success rate bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${successRate}%`,
                          background: successRate >= 50 
                            ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                            : successRate >= 20 
                              ? 'linear-gradient(90deg, #eab308, #facc15)'
                              : 'linear-gradient(90deg, #ef4444, #f87171)',
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
                      className={`w-full gap-2 ${
                        canAfford 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black' 
                          : ''
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span>Potenzia</span>
                      <Coins className="w-3 h-3 ml-1" />
                      <span>{cost.toLocaleString()}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="text-gold font-bold">LIVELLO MASSIMO +10</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Probabilità di successo
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(SHOE_UPGRADE_SUCCESS_RATES).map(([level, rate]) => (
            <div key={level} className="flex justify-between">
              <span className="text-muted-foreground">+{Number(level) - 1} → +{level}</span>
              <span className={`font-medium ${
                rate >= 50 ? 'text-green-400' : 
                rate >= 20 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {rate}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}