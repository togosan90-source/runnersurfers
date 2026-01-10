import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Coins, Zap, Lock, Check, CreditCard, TrendingUp, Loader2, ArrowUp } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGameStore, SHOES } from '@/store/gameStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UpgradeShop } from '@/components/shop/UpgradeShop';
import { ShoeUpgradeShop } from '@/components/shop/ShoeUpgradeShop';
import { ScoreUpgradeShop } from '@/components/shop/ScoreUpgradeShop';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function ShopPage() {
  const { user: authUser } = useAuth();
  const { user, activeBoost, deactivateBoost, ownedShoes, purchaseShoe, equipShoe } = useGameStore();
  const [loadingShoe, setLoadingShoe] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const processedRef = useRef(false);

  // Handle return from Stripe checkout - update database directly
  useEffect(() => {
    const success = searchParams.get('success');
    const shoeId = searchParams.get('shoe');
    
    // Only process once and if we have auth user
    if (success === 'true' && shoeId && authUser && !processedRef.current) {
      processedRef.current = true;
      
      const addShoeToProfile = async () => {
        try {
          // Get current owned shoes from database
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('owned_shoes')
            .eq('id', authUser.id)
            .single();
          
          if (fetchError) throw fetchError;
          
          const currentShoes = profile?.owned_shoes || [];
          
          // Only add if not already owned
          if (!currentShoes.includes(shoeId)) {
            const newShoes = [...currentShoes, shoeId];
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ owned_shoes: newShoes })
              .eq('id', authUser.id);
            
            if (updateError) throw updateError;
            
            // Also update local store
            purchaseShoe(shoeId);
            toast.success('Acquisto completato! Scarpe aggiunte! 🎉');
          } else {
            toast.info('Scarpe già in tuo possesso!');
          }
        } catch (error) {
          console.error('Error adding shoe to profile:', error);
          toast.error('Errore nel salvare l\'acquisto. Contatta il supporto.');
        }
        
        setSearchParams({});
      };
      
      addShoeToProfile();
    }
    
    if (searchParams.get('canceled') === 'true') {
      toast.error('Pagamento annullato');
      setSearchParams({});
    }
  }, [searchParams, authUser, purchaseShoe, setSearchParams]);

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

        {/* Coins Display - Enhanced Golden Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl p-6 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15) 0%, hsl(var(--warning) / 0.1) 50%, hsl(var(--gold) / 0.2) 100%)',
            boxShadow: '0 0 30px hsl(var(--gold) / 0.3), 0 0 60px hsl(var(--gold) / 0.15), inset 0 1px 0 hsl(var(--gold) / 0.3)',
            border: '2px solid hsl(var(--gold) / 0.4)',
          }}
        >

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/60 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/60 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold/60 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/60 rounded-br-2xl" />


          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Coin icon */}
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--warning)) 100%)',
                  boxShadow: '0 0 20px hsl(var(--gold) / 0.6), 0 0 40px hsl(var(--gold) / 0.3), inset 0 2px 4px hsl(0 0% 100% / 0.3)',
                }}
              >
                <Coins className="w-8 h-8 text-gold-foreground drop-shadow-lg" />
              </div>
              
              <div>
                <p className="text-sm text-gold/80 font-medium tracking-wide uppercase">Le tue monete</p>
                <motion.p 
                  className="font-display text-4xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--warning)) 50%, hsl(var(--gold)) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px hsl(var(--gold) / 0.5)',
                    filter: 'drop-shadow(0 2px 4px hsl(var(--gold) / 0.3))',
                  }}
                >
                  {user.coins.toLocaleString()}
                </motion.p>
              </div>
            </div>
            
            {activeBoost && (
              <div className="text-right">
                <p className="text-xs text-gold/70 uppercase tracking-wide">Boost attivo</p>
                <p className="font-bold text-lg text-gold">
                  {activeBoost.boost.icon} {activeBoost.boost.name}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-7 text-xs border-gold/40 text-gold hover:bg-gold/20"
                  onClick={handleDeactivateBoost}
                >
                  Disattiva
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="boosts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="boosts" className="gap-1 text-xs px-2">
              <Zap className="w-3 h-3" />
              Boost
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="gap-1 text-xs px-2">
              <TrendingUp className="w-3 h-3" />
              Upgrade
            </TabsTrigger>
            <TabsTrigger value="enhance" className="gap-1 text-xs px-2">
              <ArrowUp className="w-3 h-3" />
              Potenzia
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-1 text-xs px-2">
              <ShoppingCart className="w-3 h-3" />
              Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boosts">
            <ScoreUpgradeShop />
          </TabsContent>

          <TabsContent value="upgrades">
            <UpgradeShop />
          </TabsContent>

          <TabsContent value="enhance">
            <ShoeUpgradeShop />
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

                  // Enhanced shoe styles based on id
                  const getShoeStyles = () => {
                    const styles: Record<string, { bg: string; border: string; shadow: string; glow: string; textColor: string; iconBg: string }> = {
                      avalon: {
                        bg: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 50%, #3B82F6 100%)',
                        border: '#60A5FA',
                        shadow: '0 4px 0 0 #1E3A5F, 0 0 25px rgba(59, 130, 246, 0.4)',
                        glow: 'rgba(96, 165, 250, 0.6)',
                        textColor: '#93C5FD',
                        iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                      },
                      zeus: {
                        bg: 'linear-gradient(135deg, #78350F 0%, #B45309 50%, #F59E0B 100%)',
                        border: '#FCD34D',
                        shadow: '0 4px 0 0 #78350F, 0 0 30px rgba(252, 211, 77, 0.5)',
                        glow: 'rgba(252, 211, 77, 0.7)',
                        textColor: '#FEF3C7',
                        iconBg: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                      },
                      woodblas: {
                        bg: 'linear-gradient(135deg, #14532D 0%, #166534 50%, #22C55E 100%)',
                        border: '#4ADE80',
                        shadow: '0 4px 0 0 #14532D, 0 0 25px rgba(74, 222, 128, 0.4)',
                        glow: 'rgba(74, 222, 128, 0.6)',
                        textColor: '#86EFAC',
                        iconBg: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      },
                      energy: {
                        bg: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)',
                        border: '#A78BFA',
                        shadow: '0 4px 0 0 #4C1D95, 0 0 25px rgba(139, 92, 246, 0.4)',
                        glow: 'rgba(167, 139, 250, 0.6)',
                        textColor: '#C4B5FD',
                        iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      },
                      infinity: {
                        bg: 'linear-gradient(135deg, #164E63 0%, #0891B2 30%, #06B6D4 50%, #0891B2 70%, #164E63 100%)',
                        border: '#22D3EE',
                        shadow: '0 4px 0 0 #164E63, 0 0 35px rgba(6, 182, 212, 0.5)',
                        glow: 'rgba(34, 211, 238, 0.7)',
                        textColor: '#A5F3FC',
                        iconBg: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                      },
                    };
                    return styles[shoe.id] || styles.avalon;
                  };

                  const style = getShoeStyles();
                  const isInfinity = shoe.id === 'infinity';

                  return (
                    <motion.div
                      key={shoe.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="rounded-xl overflow-hidden relative cursor-pointer"
                      style={{
                        background: style.bg,
                        border: isEquipped ? `4px solid #FCD34D` : `3px solid ${style.border}`,
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
                          delay: index * 0.3,
                          ease: "easeInOut"
                        }}
                      />


                      <div className="flex relative z-10">
                        {/* Icon Section */}
                        <motion.div 
                          className="w-28 h-28 flex items-center justify-center relative"
                          style={{
                            background: 'rgba(0,0,0,0.2)',
                          }}
                          animate={isInfinity ? {
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
                              boxShadow: `0 0 30px ${style.glow}`,
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
                          <span 
                            className="text-5xl relative z-10"
                            style={{ 
                              filter: `drop-shadow(0 0 15px ${style.glow})`,
                            }}
                          >
                            {shoe.icon}
                          </span>
                        </motion.div>

                        {/* Content Section */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 
                                className="font-varsity text-lg uppercase tracking-wide"
                                style={{
                                  color: style.textColor,
                                  textShadow: `0 2px 4px rgba(0,0,0,0.5), 0 0 10px ${style.glow}`,
                                }}
                              >
                                {shoe.name}
                              </h4>
                              <p 
                                className="text-xs mt-0.5"
                                style={{ color: `${style.textColor}99` }}
                              >
                                {shoe.description}
                              </p>
                            </div>
                            {isOwned && (
                              <motion.span 
                                className="px-2 py-1 rounded-lg text-xs font-bold"
                                style={{
                                  background: isEquipped 
                                    ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                                    : 'rgba(74, 222, 128, 0.3)',
                                  color: isEquipped ? '#78350F' : '#4ADE80',
                                  border: isEquipped ? '2px solid #FEF3C7' : '1px solid #4ADE80',
                                  boxShadow: isEquipped ? '0 2px 0 0 #B45309, 0 0 10px rgba(252, 211, 77, 0.5)' : 'none',
                                }}
                                animate={isEquipped ? {
                                  scale: [1, 1.05, 1],
                                } : {}}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                }}
                              >
                                {isEquipped ? '⭐ EQUIPPED' : '✓ OWNED'}
                              </motion.span>
                            )}
                          </div>

                          {/* Stats Badges */}
                          <div className="flex gap-2 mt-2 mb-3">
                            <div 
                              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                              style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${style.border}50`,
                              }}
                            >
                              <span className="text-lg">💰</span>
                              <span 
                                className="font-bold text-sm"
                                style={{ color: style.textColor }}
                              >
                                +{shoe.coinBonus}% Monete
                              </span>
                            </div>
                            <div 
                              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                              style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${style.border}50`,
                              }}
                            >
                              <span className="text-lg">⚡</span>
                              <span 
                                className="font-bold text-sm"
                                style={{ color: style.textColor }}
                              >
                                +{shoe.expBonus}% EXP
                              </span>
                            </div>
                          </div>

                          {/* Level Range */}
                          <div 
                            className="text-xs mb-3 flex items-center gap-1"
                            style={{ color: `${style.textColor}99` }}
                          >
                            <span>📊</span> Livelli: {shoe.unlockLevel} - {shoe.maxLevel}
                          </div>

                          {/* Action Button */}
                          <div>
                            {!isUnlocked ? (
                              <div 
                                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                style={{
                                  background: 'rgba(0,0,0,0.3)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                }}
                              >
                                <Lock className="w-4 h-4" style={{ color: style.textColor }} />
                                <span style={{ color: style.textColor }}>
                                  Sblocca al livello {shoe.unlockLevel}
                                </span>
                              </div>
                            ) : isOwned ? (
                              <Button
                                size="lg"
                                className="w-full gap-2 font-bold"
                                style={{
                                  background: isEquipped 
                                    ? 'rgba(100,100,100,0.5)'
                                    : `linear-gradient(135deg, ${style.border}CC 0%, ${style.border} 100%)`,
                                  border: `2px solid ${style.border}`,
                                  color: isEquipped ? '#9CA3AF' : '#1F2937',
                                  boxShadow: isEquipped 
                                    ? 'none'
                                    : `0 3px 0 0 rgba(0,0,0,0.3), 0 0 15px ${style.glow}`,
                                }}
                                onClick={() => equipShoe(shoe.id)}
                                disabled={isEquipped}
                              >
                                {isEquipped ? (
                                  <>
                                    <Check className="w-5 h-5" />
                                    Equipaggiato
                                  </>
                                ) : (
                                  <>
                                    <span>👟</span>
                                    Equipaggia
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="lg"
                                className="w-full gap-2 font-bold"
                                style={{
                                  background: `linear-gradient(135deg, ${style.border}CC 0%, ${style.border} 100%)`,
                                  border: `2px solid ${style.border}`,
                                  color: '#1F2937',
                                  boxShadow: `0 3px 0 0 rgba(0,0,0,0.3), 0 0 15px ${style.glow}`,
                                }}
                                onClick={() => handlePurchaseShoe(shoe.id, shoe.price)}
                                disabled={loadingShoe === shoe.id}
                              >
                                {loadingShoe === shoe.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CreditCard className="w-5 h-5" />
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
