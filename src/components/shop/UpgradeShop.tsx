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

  const getUpgradeGradient = (id: number, type: 'score' | 'exp') => {
    if (type === 'exp') {
      return 'from-purple-500 to-pink-500';
    }
    const gradients: Record<number, string> = {
      1: 'from-green-400 to-emerald-500',
      2: 'from-blue-400 to-cyan-500',
      4: 'from-orange-400 to-amber-500',
      5: 'from-yellow-400 via-amber-400 to-yellow-500',
    };
    return gradients[id] || 'from-gray-400 to-gray-500';
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
        className="mb-6 rounded-xl p-4 border"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-foreground">Bonus Totali Attivi</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Score</span>
              <span className="font-display text-xl font-bold text-green-400">
                +{totalScoreBonus}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">EXP</span>
              <span className="font-display text-xl font-bold text-purple-400">
                +{totalExpBonus}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-muted-foreground mb-4">
        Upgrade PERMANENTI - Aumenta i tuoi guadagni per sempre! ⚡
      </p>

      <div className="space-y-3">
        {SCORE_UPGRADES.map((upgrade, index) => {
          const isPurchased = purchasedUpgrades.includes(upgrade.id);
          const canAfford = user.coins >= upgrade.cost;

          return (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border overflow-hidden ${
                isPurchased 
                  ? 'border-green-500/50 ring-2 ring-green-500/20' 
                  : 'border-border'
              }`}
            >
              <div className="flex">
                {/* Icon Section */}
                <div 
                  className={`w-20 h-20 bg-gradient-to-br ${getUpgradeGradient(upgrade.id, upgrade.type)} flex items-center justify-center`}
                >
                  {upgrade.type === 'exp' ? (
                    <Star className="w-8 h-8 text-white" />
                  ) : (
                    <TrendingUp className="w-8 h-8 text-white" />
                  )}
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-3 bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        Upgrade #{upgrade.id}
                        {isPurchased && (
                          <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                            ATTIVO
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {upgrade.type === 'score' ? 'Bonus Score Permanente' : 'Bonus EXP Permanente'}
                      </p>
                    </div>
                    <span 
                      className={`font-display text-xl font-bold ${
                        upgrade.type === 'exp' ? 'text-purple-400' : 'text-green-400'
                      }`}
                    >
                      +{upgrade.bonusPercent}%
                    </span>
                  </div>

                  {isPurchased ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Acquistato
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      variant={canAfford ? 'default' : 'secondary'}
                      disabled={!canAfford}
                      onClick={() => handlePurchase(upgrade.id)}
                    >
                      {canAfford ? (
                        <>
                          <Coins className="w-4 h-4" />
                          {upgrade.cost.toLocaleString()} Monete
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
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