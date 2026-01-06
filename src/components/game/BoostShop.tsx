import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Coins, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameStore, BOOSTS, type Boost } from '@/store/gameStore';
import { toast } from 'sonner';

export function BoostShop() {
  const { user, purchaseBoost, activateBoost, activeBoost } = useGameStore();
  const [selectedBoost, setSelectedBoost] = useState<Boost | null>(null);

  const handlePurchase = (boost: Boost) => {
    if (activeBoost) {
      toast.error('Hai già un boost attivo!');
      return;
    }
    
    if (purchaseBoost(boost)) {
      activateBoost(boost);
      toast.success(`${boost.icon} ${boost.name} Boost attivato!`);
    } else {
      toast.error('Monete insufficienti!');
    }
  };

  const getBoostColor = (boost: Boost) => {
    const colors: Record<string, string> = {
      yellow: 'from-yellow-400 to-amber-500',
      green: 'from-green-400 to-emerald-500',
      blue: 'from-blue-400 to-cyan-500',
      purple: 'from-purple-400 to-violet-500',
      orange: 'from-orange-400 to-red-500',
      brown: 'from-amber-600 to-yellow-700',
      cyan: 'from-cyan-400 to-blue-500',
      lime: 'from-lime-400 to-green-500',
      gold: 'from-yellow-400 to-orange-500',
      violet: 'from-violet-400 to-purple-500',
      red: 'from-red-400 to-rose-500',
      pink: 'from-pink-400 to-rose-400',
      black: 'from-gray-700 to-gray-900',
      white: 'from-gray-100 to-gray-300',
      ice: 'from-cyan-200 to-blue-300',
      stone: 'from-stone-400 to-stone-600',
      crimson: 'from-red-500 to-rose-600',
      dark: 'from-gray-800 to-black',
      silver: 'from-gray-300 to-gray-500',
      legendary: 'from-yellow-300 via-amber-400 to-yellow-500',
    };
    return colors[boost.color] || 'from-gray-400 to-gray-500';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Boost Shop</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <ShoppingCart className="w-5 h-5 text-primary" />
            BOOST SHOP
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
          <Coins className="w-5 h-5 text-gold" />
          <span className="text-sm">Le tue monete:</span>
          <span className="font-mono font-bold text-gold">{user.coins.toLocaleString()}</span>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BOOSTS.map((boost, index) => (
              <motion.div
                key={boost.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`relative rounded-xl overflow-hidden border ${
                  boost.id === 20 ? 'border-gold' : 'border-border'
                }`}
              >
                {/* Gradient header */}
                <div className={`h-12 bg-gradient-to-br ${getBoostColor(boost)} flex items-center justify-center`}>
                  <span className="text-2xl">{boost.icon}</span>
                </div>

                {/* Content */}
                <div className="p-3 bg-card">
                  <h4 className="font-bold text-sm text-foreground mb-1">{boost.name}</h4>
                  
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-accent" />
                      <span>+{boost.scoreBonus}% Score</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{boost.duration} min</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full gap-1"
                    variant={user.coins >= boost.cost ? 'default' : 'secondary'}
                    disabled={user.coins < boost.cost || !!activeBoost}
                    onClick={() => handlePurchase(boost)}
                  >
                    <Coins className="w-3 h-3" />
                    {boost.cost}
                  </Button>
                </div>

                {/* Legendary badge */}
                {boost.id === 20 && (
                  <div className="absolute top-1 right-1 bg-gold text-gold-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                    LEGENDARY
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
