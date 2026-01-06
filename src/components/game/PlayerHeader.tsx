import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useGameStore, getTier } from '@/store/gameStore';
import { useProfile } from '@/hooks/useProfile';
import trophyNew from '@/assets/trophy-new.png';
import frameGold from '@/assets/frame-gold.png';
import frameBlue from '@/assets/frame-blue.png';
import coinsGold from '@/assets/coins-gold.png';
import avatarSora from '@/assets/avatar-sora.png';

export function PlayerHeader() {
  const user = useGameStore((state) => state.user);
  const { profile } = useProfile();
  const tier = getTier(user.level);
  const expProgress = Math.min((user.exp / 100) * 100, 100);

  // Use profile avatar if available, otherwise use default
  const avatarUrl = profile?.avatar_url || avatarSora;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #8B4513 0%, #654321 50%, #3d2817 100%)',
        padding: '12px',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)',
        border: '4px solid #2d1810',
        borderRadius: '16px',
      }}
    >
      {/* Wood grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent 0px,
            rgba(0,0,0,0.1) 2px,
            transparent 4px,
            rgba(139,69,19,0.2) 8px
          ), repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(0,0,0,0.05) 20px,
            transparent 40px
          )`,
        }}
      />
      
      {/* Totem carved symbols on corners */}
      <div className="absolute top-1 left-2 text-xl opacity-60" style={{ color: '#d4a574' }}>☼</div>
      <div className="absolute top-1 right-2 text-xl opacity-60" style={{ color: '#d4a574' }}>☼</div>
      <div className="absolute bottom-1 left-2 text-xl opacity-60" style={{ color: '#d4a574' }}>⚡</div>
      <div className="absolute bottom-1 right-2 text-xl opacity-60" style={{ color: '#d4a574' }}>⚡</div>
      
      {/* Inner content area */}
      <div 
        className="rounded-lg p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
          boxShadow: 'inset 0 2px 8px rgba(139,69,19,0.3)',
          border: '2px solid #a0522d',
        }}
      >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              background: `radial-gradient(circle, ${
                ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a'][i % 4]
              }40 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating sparkles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-yellow-400"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              fontSize: 8 + i * 2,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-start gap-4 relative z-10">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {/* Rainbow border container */}
          <motion.div
            className="relative w-[88px] h-[88px] rounded-full p-1"
            style={{
              background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
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
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-base border-2 border-yellow-200">
            {tier.icon}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          {/* Top row: Username and Coins */}
          <div className="flex items-center justify-between mb-1">
            <div 
              className="px-4 py-1.5 rounded-lg shadow-lg border-2 border-black"
              style={{
                background: 'linear-gradient(180deg, #B3E5FC 0%, #81D4FA 100%)',
              }}
            >
              <span 
                className="font-calligraphy text-xl tracking-wide"
                style={{
                  color: '#1e3a5f',
                  textShadow: '1px 1px 0px #BBDEFB',
                }}
              >
                {user.username}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full shadow-sm">
              <img src={coinsGold} alt="Coins" className="w-5 h-5 object-contain" />
              <span className="font-mono font-bold text-slate-700">{user.coins.toLocaleString()}</span>
            </div>
          </div>

          {/* Level and Rank in green box */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-amber-600">LV.{user.level}</span>
            <span 
              className="font-varsity text-sm uppercase px-3 py-1 rounded-md"
              style={{
                background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
                border: '3px solid #15803D',
                boxShadow: '0 3px 0 0 #166534, inset 0 1px 0 0 rgba(255,255,255,0.3)',
                color: 'white',
                textShadow: '2px 2px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
              }}
            >
              {tier.icon} {tier.name}
            </span>
          </div>

          {/* EXP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="h-3 flex-1 bg-white/70 rounded-full overflow-hidden shadow-inner mr-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span 
                className="font-varsity text-xs uppercase px-3 py-1 rounded-md"
                style={{
                  background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
                  border: '3px solid #15803D',
                  boxShadow: '0 3px 0 0 #166534, inset 0 1px 0 0 rgba(255,255,255,0.3)',
                  color: 'white',
                  textShadow: '2px 2px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
                }}
              >
                {user.exp}/100 EXP
              </span>
            </div>
            <p className="text-right text-xs text-slate-500">
              {expProgress.toFixed(0)}% - Prossimo livello
            </p>
          </div>

          {/* RunnerSurfers Title */}
          <div className="flex justify-center mt-1 -ml-24 sm:ml-0">
            <motion.span 
              className="font-varsity text-3xl uppercase tracking-wide"
              style={{
                background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 100%',
                textShadow: 'none',
                filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.3))',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              RunnerSurfers
            </motion.span>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
