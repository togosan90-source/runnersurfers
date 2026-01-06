import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Coins, Zap, Lock, Check, CreditCard, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGameStore, BOOSTS, SHOES } from '@/store/gameStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UpgradeShop } from '@/components/shop/UpgradeShop';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

export default function ShopPage() {
  const { user, purchaseBoost, activateBoost, deactivateBoost, activeBoost, ownedShoes, purchaseShoe, equipShoe } = useGameStore();
  const [loadingShoe, setLoadingShoe] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { syncProfileFromStore } = useProfile();

  // Handle return from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success');
    const shoeId = searchParams.get('shoe');
    
    if (success === 'true' && shoeId && !ownedShoes.includes(shoeId)) {
      purchaseShoe(shoeId);
      syncProfileFromStore();
      toast.success('Acquisto completato! Scarpe aggiunte! 🎉');
      setSearchParams({});
    }
    
    if (searchParams.get('canceled') === 'true') {
      toast.error('Pagamento annullato');
      setSearchParams({});
    }
  }, [searchParams, ownedShoes, purchaseShoe, syncProfileFromStore, setSearchParams]);

  const handlePurchaseBoost = (boost: typeof BOOSTS[0]) => {
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

  const handleDeactivateBoost = () => {
    deactivateBoost();
    toast.info('Boost disattivato');
  };

  const handlePurchaseShoe = async (shoeId: string, price: number) => {
    if (price === 0) {
      toast.success('Questa scarpa è già inclusa!');
      return;
    }
    
    setLoadingShoe(shoeId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-shoe-payment', {
        body: { shoeId },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Errore durante il pagamento');
    } finally {
      setLoadingShoe(null);
    }
  };

  const getBoostColor = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'from-yellow-400 to-amber-500',
      green: 'from-green-400 to-emerald-500',
      blue: 'from-blue-400 to-cyan-500',
      purple: 'from-purple-400 to-violet-500',
      orange: 'from-orange-400 to-red-500',
      brown: 'from-amber-600 to-yellow-700',
      cyan: 'from-cyan-400 to-blue-500',
      lime: 'from-lime-400 to-green-500',
      legendary: 'from-yellow-300 via-amber-400 to-yellow-500',
    };
    return colors[color] || 'from-gray-400 to-gray-500';
  };

  const getShoeGradient = (id: string) => {
    switch (id) {
      case 'avalon':
        return 'from-blue-400 to-blue-600';
      case 'zeus':
        return 'from-yellow-400 to-orange-500';
      case 'woodblas':
        return 'from-green-400 to-emerald-600';
      case 'energy':
        return 'from-purple-400 to-pink-500';
      case 'infinity':
        return 'from-cyan-400 to-blue-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold flex items-center gap-2 text-primary">
            <ShoppingCart className="w-6 h-6" />
            Shop
          </h1>
        </motion.div>

        {/* Coins Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-gold/20 to-warning/10 rounded-xl p-4 mb-6 border border-gold/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Le tue monete</p>
              <p className="font-display text-2xl font-bold text-gold">
                {user.coins.toLocaleString()}
              </p>
            </div>
          </div>
          {activeBoost && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Boost attivo</p>
              <p className="font-bold text-accent">
                {activeBoost.boost.icon} {activeBoost.boost.name}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-1 h-6 text-xs"
                onClick={handleDeactivateBoost}
              >
                Disattiva
              </Button>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="boosts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="boosts" className="gap-2">
              <Zap className="w-4 h-4" />
              Boost
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Upgrade
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boosts">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Boost temporanei - Aumenta il tuo score durante la corsa! (Disponibili lv. 1-50)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BOOSTS.map((boost, index) => (
                  <motion.div
                    key={boost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative rounded-xl overflow-hidden border ${
                      boost.id === 9 ? 'border-gold ring-2 ring-gold/30' : 'border-border'
                    }`}
                  >
                    <div className={`h-16 bg-gradient-to-br ${getBoostColor(boost.color)} flex items-center justify-center`}>
                      <span className="text-3xl">{boost.icon}</span>
                    </div>
                    <div className="p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-foreground">{boost.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-accent font-bold">+{boost.scoreBonus}% Score</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(boost.duration)}</span>
                          </div>
                        </div>
                        {boost.id === 9 && (
                          <span className="bg-gold text-gold-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                            ULTIMATE
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        variant={user.coins >= boost.cost ? 'default' : 'secondary'}
                        disabled={user.coins < boost.cost || !!activeBoost}
                        onClick={() => handlePurchaseBoost(boost)}
                      >
                        <Coins className="w-4 h-4" />
                        {boost.cost.toLocaleString()}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="upgrades">
            <UpgradeShop />
          </TabsContent>

          <TabsContent value="items">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Equipaggiamento PERMANENTE - I bonus si accumulano! 👟
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
                      className={`bg-card rounded-xl border overflow-hidden ${
                        isEquipped ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    >
                      <div className="flex">
                        <div className={`w-24 h-24 bg-gradient-to-br ${getShoeGradient(shoe.id)} flex items-center justify-center`}>
                          <span className="text-4xl">{shoe.icon}</span>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-sm">{shoe.name}</h4>
                              <p className="text-xs text-muted-foreground">{shoe.description}</p>
                            </div>
                            {isOwned && (
                              <span className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded font-bold">
                                OWNED
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 mt-2 text-xs mb-3">
                            <span className="text-primary font-bold">+{shoe.coinBonus}% Monete</span>
                            <span className="text-accent font-bold">+{shoe.expBonus}% EXP</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Livelli: {shoe.unlockLevel} - {shoe.maxLevel}
                          </div>
                          <div>
                            {!isUnlocked ? (
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Lock className="w-4 h-4" />
                                <span>Sblocca al livello {shoe.unlockLevel}</span>
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
                                onClick={() => handlePurchaseShoe(shoe.id, shoe.price)}
                                disabled={loadingShoe === shoe.id}
                                className="gap-2"
                              >
                                {loadingShoe === shoe.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CreditCard className="w-4 h-4" />
                                )}
                                €{shoe.price.toFixed(2)}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                🔐 Gli item acquistati sono PERMANENTI e i bonus si sommano!
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
