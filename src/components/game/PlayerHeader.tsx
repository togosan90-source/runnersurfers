import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Flame, Star, Crown, Coins } from 'lucide-react';
import { useGameStore, getTier, getExpPerKm, getExpNeeded } from '@/store/gameStore';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import coinsGold from '@/assets/coins-gold.png';
import avatarSora from '@/assets/avatar-sora.png';

export const PlayerHeader = memo(function PlayerHeader() {
  const user = useGameStore((state) => state.user);
  const { profile } = useProfile();
  const navigate = useNavigate();
  const tier = useMemo(() => getTier(user.level), [user.level]);
  const expProgress = useMemo(() => Math.min((user.exp / 100) * 100, 100), [user.exp]);
  
  // Calculate km progress
  const expPerKm = useMemo(() => getExpPerKm(user.level), [user.level]);
  const expNeeded = useMemo(() => getExpNeeded(user.level + 1), [user.level]);
  const kmCurrent = useMemo(() => user.exp / expPerKm, [user.exp, expPerKm]);
  const kmNeeded = useMemo(() => expNeeded / expPerKm, [expNeeded, expPerKm]);
  const kmPercentage = useMemo(() => (kmCurrent / kmNeeded) * 100, [kmCurrent, kmNeeded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '4px',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-60"
        style={{
          background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #06b6d4, #10b981, #f59e0b, #f43f5e)',
          backgroundSize: '300% 100%',
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
      
      {/* Inner content */}
      <div 
        className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1e1e30 0%, #141428 100%)',
        }}
      >
        {/* Coins - Fixed top right on mobile - Clickable to shop */}
        <motion.div 
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/shop')}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Coins className="w-5 h-5 text-amber-400" />
          </motion.div>
          <span className="font-mono font-bold text-amber-400">{user.coins.toLocaleString()}</span>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
          {/* Avatar with animated glow ring - Clickable to profile */}
          <div 
            className="relative flex-shrink-0 cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <motion.div
              className="absolute -inset-2 rounded-full opacity-60 blur-md"
              style={{
                background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #06b6d4, #10b981, #f59e0b, #f43f5e)',
                backgroundSize: '300% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                scale: [1, 1.1, 1],
              }}
              transition={{
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            />
            <motion.div
              className="relative w-[88px] h-[88px] rounded-full p-1"
              style={{
                background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #06b6d4, #10b981, #f59e0b, #f43f5e)',
                backgroundSize: '300% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
              ) : (
                <img 
                  src={avatarSora} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
              )}
            </motion.div>
            
            {/* Level badge */}
            <motion.div 
              className="absolute -bottom-1 -right-1 px-2 py-1 rounded-lg flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: '2px solid #92400e',
                boxShadow: '0 2px 0 #78350f, 0 0 15px rgba(251, 191, 36, 0.5)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-3 h-3 text-yellow-900" />
              <span className="text-xs font-bold text-yellow-900">LV.{user.level}</span>
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="flex-1 w-full min-w-0">
            {/* Rank Badge - Cyberpunk Style - Clickable to stats */}
            <motion.div 
              className="inline-flex items-center gap-3 mb-3 px-4 py-2 relative overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%)',
                border: '1px solid #00ff8840',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/stats')}
            >
              {/* Scan line effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, #00ff8810 50%, transparent 100%)',
                  height: '200%',
                }}
                animate={{ y: ['-100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Corner cuts */}
              <div 
                className="absolute top-0 right-0 w-2.5 h-2.5"
                style={{ background: 'linear-gradient(135deg, transparent 50%, #00ff8860 50%)' }}
              />
              <div 
                className="absolute bottom-0 left-0 w-2.5 h-2.5"
                style={{ background: 'linear-gradient(-45deg, transparent 50%, #00ff8860 50%)' }}
              />
              
              {/* Glowing border lines */}
              <div className="absolute top-0 left-0 right-2.5 h-px" style={{ background: 'linear-gradient(90deg, #00ff88, transparent)' }} />
              <div className="absolute bottom-0 left-2.5 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00ff88)' }} />
              
              {/* Icon in hexagon */}
              <div 
                className="w-8 h-8 flex items-center justify-center relative z-10"
                style={{
                  background: '#00ff8815',
                  border: '1px solid #00ff8850',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              >
                <span className="text-lg">{tier.icon}</span>
              </div>
              
              {/* Rank name */}
              <span 
                className="font-mono text-sm font-bold uppercase tracking-[0.15em] relative z-10"
                style={{
                  color: '#00ff88',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3)',
                }}
              >
                {tier.name}
              </span>
              
              {/* Status LED */}
              <motion.div
                className="w-2 h-2 relative z-10"
                style={{
                  background: '#00ff88',
                  boxShadow: '0 0 8px rgba(0, 255, 136, 0.8), 0 0 16px rgba(0, 255, 136, 0.5)',
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>

            {/* EXP Bar - Redesigned */}
            <div 
              className="relative p-3 rounded-xl mb-3 w-full"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div>
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold text-purple-300">Esperienza</span>
                </div>
                <motion.span 
                  className="font-mono font-bold text-sm px-2 py-0.5 rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  {user.exp}/100
                </motion.span>
              </div>
              
              <div className="h-4 bg-slate-800/80 rounded-full overflow-hidden shadow-inner relative">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: 'linear-gradient(90deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
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
                </motion.div>
              </div>
              <p className="text-right text-xs text-slate-400 mt-1">
                {expProgress.toFixed(0)}% verso il prossimo livello
              </p>
            </div>

            {/* KM Progress Bar - Enhanced */}
            <div 
              className="relative p-3 rounded-xl overflow-hidden w-full"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              {/* Decorative elements */}
              <motion.div 
                className="absolute top-1 right-2 text-lg"
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏃‍♂️
              </motion.div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                  <span className="font-medium text-cyan-300">Distanza LV.{user.level + 1}</span>
                </div>
                <span 
                  className="font-mono font-bold text-sm"
                  style={{
                    background: 'linear-gradient(90deg, #22d3ee, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {kmCurrent.toFixed(2)} / {kmNeeded.toFixed(2)} km
                </span>
              </div>
              
              {/* KM Progress bar */}
              <div className="relative h-5 bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #22d3ee 0%, #06b6d4 30%, #0d9488 60%, #10b981 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${kmPercentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {/* Animated shine */}
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
                
                {/* Percentage text inside bar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    {kmPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-orange-300">{expPerKm}% EXP/km</span>
                </div>
                <span className="text-xs font-medium text-emerald-400">
                  ⚡ {(kmNeeded - kmCurrent).toFixed(2)} km restanti
                </span>
              </div>
            </div>

            {/* RunnerSurfers Title - Premium Style */}
            <div className="flex justify-center mt-3 sm:-ml-20 w-full">
              <motion.div className="relative">
                {/* Glow effect behind text */}
                <motion.div
                  className="absolute inset-0 blur-xl opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #06b6d4, #10b981, #f59e0b)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.span 
                  className="relative font-varsity text-3xl uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #f43f5e, #ec4899, #8b5cf6, #06b6d4, #10b981, #22c55e, #eab308, #f97316, #f43f5e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 100%',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  RunnerSurfers
                </motion.span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
