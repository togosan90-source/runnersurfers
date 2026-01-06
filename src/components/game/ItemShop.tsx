import { motion } from 'framer-motion';
import { Lock, Check, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGameStore, SHOES } from '@/store/gameStore';
import { toast } from 'sonner';

export function ItemShop() {
  const { user, ownedShoes, purchaseShoe, equipShoe } = useGameStore();

  const handlePurchase = (shoeId: string, price: number) => {
    if (price === 0) {
      toast.success('Questa scarpa è già inclusa!');
      return;
    }
    
    // In a real app, this would integrate with Stripe
    const confirmed = window.confirm(`Confermi l'acquisto per €${price.toFixed(2)}?`);
    if (confirmed) {
      purchaseShoe(shoeId);
      toast.success('Acquisto completato! 🎉');
    }
  };

  const getShoeGradient = (id: string) => {
    switch (id) {
      case 'avalon':
        return 'from-blue-400 to-blue-600';
      case 'zeus':
        return 'from-red-400 to-orange-500';
      case 'woodblas':
        return 'from-green-400 to-emerald-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Item Shop</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-gold" />
            PREMIUM ITEM SHOP
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Equipaggiamento PERMANENTE con bonus sempre attivi
        </p>

        <div className="space-y-4">
          {SHOES.map((shoe, index) => {
            const isOwned = ownedShoes.includes(shoe.id);
            const isEquipped = user.equippedShoes === shoe.id;
            const isUnlocked = user.level >= shoe.unlockLevel;

            return (
              <motion.div
                key={shoe.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border overflow-hidden ${
                  isEquipped ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                <div className="flex">
                  {/* Shoe icon */}
                  <div className={`w-24 h-24 bg-gradient-to-br ${getShoeGradient(shoe.id)} flex items-center justify-center`}>
                    <span className="text-4xl">{shoe.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-foreground">{shoe.name}</h4>
                        <p className="text-xs text-muted-foreground">{shoe.description}</p>
                      </div>
                      {isEquipped && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                          EQUIPAGGIATO
                        </span>
                      )}
                    </div>

                    {/* Bonuses */}
                    <div className="flex gap-4 text-xs mb-3">
                      <div className="flex items-center gap-1 text-primary">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{shoe.coinBonus}% Monete</span>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Sparkles className="w-3 h-3" />
                        <span>+{shoe.expBonus}% EXP</span>
                      </div>
                    </div>

                    {/* Action */}
                    {!isUnlocked ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Livello {shoe.unlockLevel} richiesto</span>
                      </div>
                    ) : isOwned ? (
                      <Button
                        size="sm"
                        variant={isEquipped ? 'secondary' : 'default'}
                        onClick={() => equipShoe(shoe.id)}
                        disabled={isEquipped}
                        className="gap-2"
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" />
                            Equipaggiato
                          </>
                        ) : (
                          'Equipaggia'
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(shoe.id, shoe.price)}
                        className="gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        {shoe.price === 0 ? 'GRATIS' : `€${shoe.price.toFixed(2)}`}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          🔐 Gli item acquistati sono PERMANENTI
        </p>
      </DialogContent>
    </Dialog>
  );
}
