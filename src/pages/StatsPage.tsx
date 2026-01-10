import { motion } from 'framer-motion';
import { BarChart3, Flame, Ruler, Clock, TrendingUp, Calendar, Award, Star, Trophy, Zap } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGameStore, getRank, getReputationLevel, SHOES, getTotalShoeBonus, getRankByLevel, getRankScoreBonus, getReputationByDistance, getNextReputationTier, getReputationScoreBonus, getAllReputationTiers } from '@/store/gameStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { MonthlyChart } from '@/components/stats/MonthlyChart';
import { Progress } from '@/components/ui/progress';
import { useRuns } from '@/hooks/useRuns';

export default function StatsPage() {
  const { user, ownedShoes, equipShoe } = useGameStore();
  const { runs: dbRuns } = useRuns();

  // Map dbRuns to the expected format
  const runs = dbRuns.map(run => ({
    id: run.id,
    date: run.created_at,
    distance: run.distance,
    duration: run.duration,
    avgSpeed: run.avg_speed,
    calories: run.calories,
    scoreEarned: run.score_earned,
    expEarned: run.exp_earned,
    coinsEarned: run.coins_earned,
  }));

  // Calculate weekly stats
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyRuns = runs.filter(r => new Date(r.date).getTime() > oneWeekAgo);
  const weeklyDistance = weeklyRuns.reduce((sum, r) => sum + r.distance, 0);
  const weeklyCalories = weeklyRuns.reduce((sum, r) => sum + r.calories, 0);
  const weeklyDuration = weeklyRuns.reduce((sum, r) => sum + r.duration, 0);
  const weeklyScore = weeklyRuns.reduce((sum, r) => sum + r.scoreEarned, 0);
  const weeklyAvgSpeed = weeklyRuns.length > 0 
    ? weeklyRuns.reduce((sum, r) => sum + r.avgSpeed, 0) / weeklyRuns.length 
    : 0;

  // Calculate monthly stats
  const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const monthlyRuns = runs.filter(r => new Date(r.date).getTime() > oneMonthAgo);
  const monthlyDistance = monthlyRuns.reduce((sum, r) => sum + r.distance, 0);
  const monthlyCalories = monthlyRuns.reduce((sum, r) => sum + r.calories, 0);
  const monthlyDuration = monthlyRuns.reduce((sum, r) => sum + r.duration, 0);
  const monthlyScore = monthlyRuns.reduce((sum, r) => sum + r.scoreEarned, 0);
  const monthlyAvgSpeed = monthlyRuns.length > 0 
    ? monthlyRuns.reduce((sum, r) => sum + r.avgSpeed, 0) / monthlyRuns.length 
    : 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get current rank and reputation
  const currentRank = getRank(user.level);
  const currentRankInfo = getRankByLevel(user.level);
  const rankScoreBonus = getRankScoreBonus(user.level);
  const reputationLevel = getReputationLevel(user.reputation);
  const shoeBonus = getTotalShoeBonus(ownedShoes);
  
  // NEW: Distance-based reputation
  const currentRepTier = getReputationByDistance(user.totalDistance);
  const nextRepTier = getNextReputationTier(user.totalDistance);
  const repScoreBonus = getReputationScoreBonus(user.totalDistance);

  // Calculate distance progress (max 15,000 km)
  const maxDistance = 15000;
  const distanceProgress = Math.min((user.totalDistance / maxDistance) * 100, 100);

  // Get next rank progress
  const currentRankMinLevel = currentRankInfo.minLevel;
  const currentRankMaxLevel = currentRankInfo.maxLevel;
  const levelsInCurrentRank = user.level - currentRankMinLevel + 1;
  const totalLevelsInRank = currentRankMaxLevel - currentRankMinLevel + 1;
  const rankProgress = (levelsInCurrentRank / totalLevelsInRank) * 100;

  // Get rank color
  const getRankColor = (color: string) => {
    const colors: Record<string, string> = {
      warrior: 'text-slate-400',
      elite: 'text-blue-400',
      master: 'text-yellow-500',
      grandmaster: 'text-amber-600',
      epic: 'text-orange-500',
      mythic: 'text-purple-500',
      mythical: 'text-cyan-400',
    };
    return colors[color] || 'text-slate-400';
  };

  // Get reputation color
  const getRepColor = (color: string) => {
    const colors: Record<string, string> = {
      new: 'text-slate-400',
      novice: 'text-amber-600',
      expert: 'text-blue-500',
      veteran: 'text-green-500',
      legendary: 'text-yellow-500',
      insane: 'text-purple-500',
    };
    return colors[color] || 'text-slate-400';
  };

  const StatCard = ({ icon: Icon, label, value, unit, color }: {
    icon: typeof Ruler;
    label: string;
    value: string | number;
    unit: string;
    color: string;
  }) => (
    <div 
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid rgba(96, 165, 250, 0.5)',
        boxShadow: '0 2px 0 0 #1E40AF, 0 0 15px rgba(59, 130, 246, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Mini star decorations */}
      <motion.div
        className="absolute top-2 right-2 text-xs pointer-events-none"
        animate={{ 
          opacity: [0.4, 1, 0.4],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ✨
      </motion.div>
      
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <Icon className="w-5 h-5 text-sky-300" />
        <span 
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#93C5FD' }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1 relative z-10">
        <span 
          className="font-display text-3xl font-bold"
          style={{
            color: 'white',
            textShadow: '0 0 10px rgba(147, 197, 253, 0.5)'
          }}
        >
          {value}
        </span>
        <span className="text-base text-sky-200/80">{unit}</span>
      </div>
    </div>
  );

  const StatsGrid = ({ stats }: { stats: {
    distance: number;
    calories: number;
    duration: number;
    score: number;
    runsCount: number;
    avgSpeed: number;
  }}) => (
    <div className="grid grid-cols-2 gap-3">
      <StatCard 
        icon={Ruler} 
        label="Distanza" 
        value={stats.distance.toFixed(1)} 
        unit="km" 
        color="text-blue-500" 
      />
      <StatCard 
        icon={Flame} 
        label="Calorie" 
        value={stats.calories.toLocaleString()} 
        unit="kcal" 
        color="text-red-500" 
      />
      <StatCard 
        icon={Clock} 
        label="Tempo" 
        value={formatDuration(stats.duration)} 
        unit="" 
        color="text-orange-500" 
      />
      <StatCard 
        icon={TrendingUp} 
        label="Score" 
        value={stats.score.toLocaleString()} 
        unit="pts" 
        color="text-green-500" 
      />
      <StatCard 
        icon={Calendar} 
        label="Corse" 
        value={stats.runsCount} 
        unit="run" 
        color="text-muted-foreground" 
      />
      <StatCard 
        icon={BarChart3} 
        label="Vel. Media" 
        value={stats.avgSpeed.toFixed(1)} 
        unit="km/h" 
        color="text-blue-500" 
      />
    </div>
  );

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
            <BarChart3 className="w-6 h-6" />
            Le Tue Statistiche
          </h1>
        </motion.div>

        {/* Distance Progress Bar (0-15,000 KM) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)',
            border: '3px solid #6EE7B7',
            boxShadow: '0 4px 0 0 #064E3B, 0 0 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          
          {/* Energy Icon Glow */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl pointer-events-none"
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'drop-shadow(0 0 15px rgba(167, 243, 208, 0.8)) drop-shadow(0 0 30px rgba(52, 211, 153, 0.5))'
            }}
          >
            ⚡
          </motion.div>
          
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <Ruler className="w-6 h-6 text-emerald-200" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #064E3B, -1px -1px 0px #064E3B, 1px -1px 0px #064E3B, -1px 1px 0px #064E3B',
              }}
            >
              Distanza Totale
            </span>
          </div>
          <div className="mb-2 relative z-10">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-emerald-100">{user.totalDistance.toFixed(1)} km</span>
              <span className="text-emerald-200/80">{maxDistance.toLocaleString()} km</span>
            </div>
            <div 
              className="h-5 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(167, 243, 208, 0.3)'
              }}
            >
              <motion.div 
                className="h-full rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${distanceProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  background: 'linear-gradient(90deg, #A7F3D0 0%, #6EE7B7 50%, #34D399 100%)',
                  boxShadow: '0 0 15px rgba(167, 243, 208, 0.6)'
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
                  }}
                />
              </motion.div>
            </div>
          </div>
          <p className="text-sm text-emerald-100 relative z-10">
            🎯 Prossimo milestone: {Math.ceil(user.totalDistance / 5) * 5} km = +{Math.ceil(user.totalDistance / 5) * 5} monete bonus
          </p>
        </motion.div>

        {/* Rank Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1E3A5F 0%, #0F172A 100%)',
            border: '3px solid #60A5FA',
            boxShadow: '0 4px 0 0 #1E40AF, 0 0 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated Stars rising from bottom */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm pointer-events-none"
              initial={{ 
                x: `${5 + i * 10}%`, 
                y: '100%',
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1, 0.8],
                x: [`${5 + i * 10}%`, `${8 + i * 9}%`, `${3 + i * 10}%`]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
              }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
            </motion.div>
          ))}
          
          {/* Half Moon on the right */}
          <motion.div
            className="absolute right-4 top-4 text-3xl pointer-events-none"
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [0.95, 1, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))'
            }}
          >
            🌙
          </motion.div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #1E3A5F, -1px -1px 0px #1E3A5F, 1px -1px 0px #1E3A5F, -1px 1px 0px #1E3A5F',
              }}
            >
              Rango Attuale
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(96, 165, 250, 0.5)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              <span className="text-3xl">{currentRank.icon}</span>
            </div>
            <div className="flex-1">
              <p 
                className="font-varsity text-2xl uppercase tracking-wide"
                style={{
                  color: '#93C5FD',
                  textShadow: '2px 2px 0px #1E3A5F',
                }}
              >
                Rango {currentRankInfo.rank}
              </p>
              <p className="text-sm text-sky-200/90 font-semibold">{currentRankInfo.name}</p>
              <p className="text-xs text-emerald-300 font-bold mt-1">
                🎯 Bonus Score: +{rankScoreBonus}%
              </p>
            </div>
          </div>
          
          {/* Rank info box */}
          <div 
            className="rounded-lg p-3 mb-4 relative z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(96, 165, 250, 0.3)'
            }}
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-sky-300/70">Livello attuale:</span>
                <span className="text-white font-bold ml-2">{user.level}</span>
              </div>
              <div>
                <span className="text-sky-300/70">Range rango:</span>
                <span className="text-white font-bold ml-2">{currentRankInfo.minLevel}-{currentRankInfo.maxLevel}</span>
              </div>
              <div>
                <span className="text-sky-300/70">Prossimo rango:</span>
                <span className="text-white font-bold ml-2">Lv. {currentRankInfo.maxLevel + 1}</span>
              </div>
              <div>
                <span className="text-sky-300/70">Bonus prossimo:</span>
                <span className="text-emerald-400 font-bold ml-2">+{(currentRankInfo.rank + 1) * 5}%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-sm">
              <span 
                className="font-varsity text-lg uppercase tracking-wide"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 0px #1E3A5F',
                }}
              >
                Progresso verso il prossimo rango
              </span>
              <span className="font-bold text-sky-200">{rankProgress.toFixed(0)}%</span>
            </div>
            <div 
              className="h-5 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(96, 165, 250, 0.3)'
              }}
            >
              <motion.div 
                className="h-full rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${rankProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  background: 'linear-gradient(90deg, #93C5FD 0%, #60A5FA 50%, #3B82F6 100%)',
                  boxShadow: '0 0 15px rgba(147, 197, 253, 0.6)'
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
                  }}
                />
              </motion.div>
            </div>
            <p className="text-sm text-sky-200/90 font-semibold">
              Prossimo rango al livello {currentRankInfo.maxLevel + 1}
            </p>
          </div>
        </motion.div>

        {/* Reputation Section - Distance Based */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)',
            border: '3px solid #C4B5FD',
            boxShadow: '0 4px 0 0 #3B0764, 0 0 25px rgba(124, 58, 237, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated Stars */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm pointer-events-none"
              initial={{ 
                x: `${5 + i * 8}%`, 
                y: '100%',
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
              }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '💫'}
            </motion.div>
          ))}
          
          {/* Icon */}
          <motion.div
            className="absolute right-4 top-4 text-4xl pointer-events-none"
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [0.95, 1.1, 0.95],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'drop-shadow(0 0 15px rgba(196, 181, 253, 0.8))'
            }}
          >
            {currentRepTier.icon}
          </motion.div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Star className="w-6 h-6 text-violet-200" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #3B0764, -1px -1px 0px #3B0764, 1px -1px 0px #3B0764, -1px 1px 0px #3B0764',
              }}
            >
              Reputazione
            </span>
          </div>
          
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(196, 181, 253, 0.5)',
                boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)'
              }}
            >
              <span className="text-3xl">{currentRepTier.icon}</span>
            </div>
            <div className="flex-1">
              <p 
                className="font-varsity text-2xl uppercase tracking-wide"
                style={{
                  color: '#C4B5FD',
                  textShadow: '2px 2px 0px #3B0764',
                }}
              >
                Livello {currentRepTier.level}
              </p>
              <p className="text-lg text-white font-semibold">{currentRepTier.name}</p>
              <p className="text-xs text-emerald-300 font-bold mt-1">
                🎯 Bonus Score: +{repScoreBonus}%
              </p>
            </div>
          </div>
          
          {/* Info box */}
          <div 
            className="rounded-lg p-3 mb-4 relative z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(196, 181, 253, 0.3)'
            }}
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-violet-300/70">Km percorsi:</span>
                <span className="text-white font-bold ml-2">{user.totalDistance.toFixed(1)} km</span>
              </div>
              <div>
                <span className="text-violet-300/70">Richiesti:</span>
                <span className="text-white font-bold ml-2">{currentRepTier.requiredKm} km</span>
              </div>
              {nextRepTier && (
                <>
                  <div>
                    <span className="text-violet-300/70">Prossimo:</span>
                    <span className="text-white font-bold ml-2">{nextRepTier.name}</span>
                  </div>
                  <div>
                    <span className="text-violet-300/70">Mancano:</span>
                    <span className="text-amber-300 font-bold ml-2">{(nextRepTier.requiredKm - user.totalDistance).toFixed(1)} km</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          {nextRepTier && (
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="text-violet-200 font-semibold">
                  Progresso verso {nextRepTier.name}
                </span>
                <span className="text-white font-bold">
                  {Math.min(((user.totalDistance - currentRepTier.requiredKm) / (nextRepTier.requiredKm - currentRepTier.requiredKm)) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <div 
                className="h-4 rounded-full overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(196, 181, 253, 0.3)'
                }}
              >
                <motion.div 
                  className="h-full rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(((user.totalDistance - currentRepTier.requiredKm) / (nextRepTier.requiredKm - currentRepTier.requiredKm)) * 100, 100)}%` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    background: 'linear-gradient(90deg, #C4B5FD 0%, #A78BFA 50%, #8B5CF6 100%)',
                    boxShadow: '0 0 10px rgba(196, 181, 253, 0.6)'
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'
                    }}
                  />
                </motion.div>
              </div>
              <p className="text-xs text-violet-200/80">
                🎁 Prossimo bonus: +{nextRepTier.scoreBonus}% score
              </p>
            </div>
          )}
          
          {!nextRepTier && (
            <div className="text-center py-2 relative z-10">
              <p className="text-lg text-amber-300 font-bold">🏆 Hai raggiunto il rango massimo! 🏆</p>
            </div>
          )}
        </motion.div>

        {/* Equipment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
            border: '3px solid #FED7AA',
            boxShadow: '0 4px 0 0 #9A3412, 0 0 20px rgba(249, 115, 22, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.3)',
          }}
        >
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Zap className="w-6 h-6 text-white" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #9A3412, -1px -1px 0px #9A3412, 1px -1px 0px #9A3412, -1px 1px 0px #9A3412',
              }}
            >
              Equipaggiamento
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
            <div 
              className="rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              <p 
                className="text-2xl font-bold"
                style={{
                  color: '#FEF3C7',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                }}
              >
                +{shoeBonus.coinBonus}%
              </p>
              <p className="text-xs text-white/90 font-semibold">Bonus Monete</p>
            </div>
            <div 
              className="rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              <p 
                className="text-2xl font-bold"
                style={{
                  color: '#FEF3C7',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                }}
              >
                +{shoeBonus.expBonus}%
              </p>
              <p className="text-xs text-white/90 font-semibold">Bonus EXP</p>
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <p className="text-sm font-semibold text-white/90">Scarpe possedute:</p>
            <div className="flex flex-wrap gap-2">
              {ownedShoes.map(shoeId => {
                const shoe = SHOES.find(s => s.id === shoeId);
                if (!shoe) return null;
                const isEquipped = user.equippedShoes === shoeId;
                return (
                  <button
                    key={shoeId}
                    onClick={() => equipShoe(shoeId)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: isEquipped ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                      color: isEquipped ? '#9A3412' : 'white',
                      border: isEquipped ? '2px solid #FEF3C7' : '2px solid rgba(255,255,255,0.3)',
                      fontWeight: isEquipped ? 'bold' : 'normal',
                      boxShadow: isEquipped ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    <span>{shoe.icon}</span>
                    <span>{shoe.name.split(' ')[0]}</span>
                    {isEquipped && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1E3A5F 0%, #0F172A 100%)',
            border: '3px solid #60A5FA',
            boxShadow: '0 4px 0 0 #1E40AF, 0 0 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
          }}
        >
          {/* Animated Stars rising from bottom */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg pointer-events-none"
              initial={{ 
                x: `${5 + i * 8}%`, 
                y: '100%',
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                y: [100, -20],
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1, 0.8],
                x: [`${5 + i * 8}%`, `${8 + i * 7}%`, `${3 + i * 8}%`]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
              }}
            >
              {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
            </motion.div>
          ))}
          
          {/* Half Moon on the right */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [0.95, 1, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 30px rgba(251, 191, 36, 0.3))'
            }}
          >
            🌙
          </motion.div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Award className="w-6 h-6 text-yellow-300" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #1E3A5F, -1px -1px 0px #1E3A5F, 1px -1px 0px #1E3A5F, -1px 1px 0px #1E3A5F',
              }}
            >
              Statistiche Totali
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center relative z-10">
            <div 
              className="rounded-lg p-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(96, 165, 250, 0.4)'
              }}
            >
              <p 
                className="font-display text-2xl font-bold"
                style={{
                  color: '#93C5FD',
                  textShadow: '0 0 10px rgba(147, 197, 253, 0.5)'
                }}
              >
                {user.level}
              </p>
              <p className="text-xs text-white/80 font-semibold">Livello</p>
            </div>
            <div 
              className="rounded-lg p-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(96, 165, 250, 0.4)'
              }}
            >
              <p 
                className="font-display text-2xl font-bold"
                style={{
                  color: '#A5B4FC',
                  textShadow: '0 0 10px rgba(165, 180, 252, 0.5)'
                }}
              >
                {runs.length}
              </p>
              <p className="text-xs text-white/80 font-semibold">Corse</p>
            </div>
            <div 
              className="rounded-lg p-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
                border: '2px solid rgba(96, 165, 250, 0.4)'
              }}
            >
              <p 
                className="font-display text-2xl font-bold"
                style={{
                  color: '#FCD34D',
                  textShadow: '0 0 10px rgba(252, 211, 77, 0.5)'
                }}
              >
                {user.totalScore.toLocaleString()}
              </p>
              <p className="text-xs text-white/80 font-semibold">Score</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs for Weekly/Monthly */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="weekly">📅 Settimanale</TabsTrigger>
            <TabsTrigger value="monthly">📊 Mensile</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div 
                className="rounded-xl p-5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #1E3A5F 0%, #0F172A 100%)',
                  border: '3px solid #60A5FA',
                  boxShadow: '0 4px 0 0 #1E40AF, 0 0 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
                }}
              >
                {/* Animated Stars rising from bottom */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-sm pointer-events-none"
                    initial={{ 
                      x: `${5 + i * 10}%`, 
                      y: '100%',
                      opacity: 0,
                      scale: 0.5
                    }}
                    animate={{ 
                      y: [100, -20],
                      opacity: [0, 1, 0.8, 0],
                      scale: [0.5, 1, 0.8],
                      x: [`${5 + i * 10}%`, `${8 + i * 9}%`, `${3 + i * 10}%`]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut"
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                    }}
                  >
                    {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
                  </motion.div>
                ))}
                
                {/* Half Moon on the right */}
                <motion.div
                  className="absolute right-3 top-4 text-3xl pointer-events-none"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    scale: [0.95, 1, 0.95],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))'
                  }}
                >
                  🌙
                </motion.div>
                
                <h3 
                  className="font-varsity text-xl uppercase tracking-wide mb-4 relative z-10"
                  style={{
                    color: 'white',
                    textShadow: '2px 2px 0px #1E3A5F',
                  }}
                >
                  Resoconto Ultimi 7 Giorni
                </h3>
                <div className="relative z-10">
                  <StatsGrid stats={{
                    distance: weeklyDistance,
                    calories: weeklyCalories,
                    duration: weeklyDuration,
                    score: weeklyScore,
                    runsCount: weeklyRuns.length,
                    avgSpeed: weeklyAvgSpeed,
                  }} />
                </div>
              </div>

              {/* Weekly Distance Chart */}
              <WeeklyChart runs={runs} dataKey="distance" />

              {/* Weekly Score Chart */}
              <WeeklyChart runs={runs} dataKey="score" />
            </motion.div>
          </TabsContent>

          <TabsContent value="monthly">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-bold mb-3">Resoconto Ultimi 30 Giorni</h3>
                <StatsGrid stats={{
                  distance: monthlyDistance,
                  calories: monthlyCalories,
                  duration: monthlyDuration,
                  score: monthlyScore,
                  runsCount: monthlyRuns.length,
                  avgSpeed: monthlyAvgSpeed,
                }} />
              </div>

              {/* Monthly Distance Chart */}
              <MonthlyChart runs={runs} dataKey="distance" />

              {/* Monthly Score Chart */}
              <MonthlyChart runs={runs} dataKey="score" />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Recent Runs */}
        {runs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div 
              className="rounded-xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
                border: '3px solid #60A5FA',
                boxShadow: '0 4px 0 0 #1E40AF, 0 0 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
              }}
            >
              {/* Animated Running Icons */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl pointer-events-none opacity-30"
                  initial={{ x: '-10%', y: `${15 + i * 18}%` }}
                  animate={{ 
                    x: ['0%', '110%'],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "linear"
                  }}
                >
                  🏃
                </motion.div>
              ))}
              
              <h3 
                className="font-varsity text-xl uppercase tracking-wide mb-4 relative z-10 flex items-center gap-2"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 0px #1E3A5F',
                }}
              >
                <span className="text-2xl">🏅</span> Corse Recenti
              </h3>
              
              <div className="space-y-3 relative z-10">
                {runs.slice(-5).reverse().map((run, index) => (
                  <motion.div 
                    key={run.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl p-4 flex items-center justify-between relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                      border: '2px solid rgba(96, 165, 250, 0.5)',
                      boxShadow: '0 2px 0 0 rgba(30, 64, 175, 0.5), inset 0 1px 0 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                          border: '2px solid #A5B4FC',
                          boxShadow: '0 2px 0 0 #1E40AF, 0 0 15px rgba(139, 92, 246, 0.4)',
                        }}
                      >
                        👟
                      </div>
                      <div>
                        <p 
                          className="text-lg font-bold"
                          style={{
                            color: '#93C5FD',
                            textShadow: '0 0 10px rgba(147, 197, 253, 0.5)',
                          }}
                        >
                          {run.distance.toFixed(2)} km
                        </p>
                        <p className="text-xs text-blue-300/80 flex items-center gap-1">
                          <span>📅</span> {new Date(run.date).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right relative z-10">
                      <p 
                        className="text-lg font-bold flex items-center gap-1 justify-end"
                        style={{
                          color: '#FCD34D',
                          textShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                        }}
                      >
                        <span className="text-sm">⚡</span> +{run.scoreEarned.toLocaleString()} pts
                      </p>
                      <p className="text-xs text-blue-300/80 flex items-center gap-1 justify-end">
                        <span>🚀</span> {run.avgSpeed.toFixed(1)} km/h
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
