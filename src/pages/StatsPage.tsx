import { motion } from 'framer-motion';
import { BarChart3, Flame, Ruler, Clock, TrendingUp, Calendar, Award, Star, Trophy, Zap } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGameStore, getRank, getReputationLevel, SHOES, getTotalShoeBonus } from '@/store/gameStore';
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
  const reputationLevel = getReputationLevel(user.reputation);
  const shoeBonus = getTotalShoeBonus(ownedShoes);

  // Calculate distance progress (max 15,000 km)
  const maxDistance = 15000;
  const distanceProgress = Math.min((user.totalDistance / maxDistance) * 100, 100);

  // Get next rank level
  const getNextRankLevel = () => {
    if (user.level < 20) return 20;
    if (user.level < 60) return 60;
    if (user.level < 100) return 100;
    if (user.level < 200) return 200;
    if (user.level < 350) return 350;
    if (user.level < 450) return 450;
    return 600;
  };

  const nextRankLevel = getNextRankLevel();
  const rankProgress = user.level >= 450 ? 100 : ((user.level / nextRankLevel) * 100);

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
    <div className="bg-background rounded-2xl p-4 border border-border/50 shadow-sm">
      <div className={`flex items-center gap-2 ${color} mb-3`}>
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-bold text-foreground">{value}</span>
        <span className="text-base text-muted-foreground">{unit}</span>
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
          className="rounded-xl p-5 mb-6"
          style={{
            background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
            border: '3px solid white',
            boxShadow: '0 4px 0 0 #1E40AF, inset 0 1px 0 0 rgba(255,255,255,0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Ruler className="w-6 h-6 text-white" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #1E40AF, -1px -1px 0px #1E40AF, 1px -1px 0px #1E40AF, -1px 1px 0px #1E40AF',
              }}
            >
              Distanza Totale
            </span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-white">{user.totalDistance.toFixed(1)} km</span>
              <span className="text-white/80">{maxDistance.toLocaleString()} km</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${distanceProgress}%`,
                  background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
                }}
              />
            </div>
          </div>
          <p className="text-sm text-white/90">
            🎯 Prossimo milestone: {Math.ceil(user.totalDistance / 5) * 5} km = +{Math.ceil(user.totalDistance / 5) * 5} monete bonus
          </p>
        </motion.div>

        {/* Rank Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl p-5 mb-6"
          style={{
            background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
            border: '3px solid white',
            boxShadow: '0 4px 0 0 #15803D, inset 0 1px 0 0 rgba(255,255,255,0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-white" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
              }}
            >
              Rango Attuale
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
              <span className="text-3xl">{currentRank.icon}</span>
            </div>
            <div>
              <p 
                className="font-varsity text-2xl uppercase tracking-wide"
                style={{
                  color: 'white',
                  textShadow: '3px 3px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
                }}
              >
                {currentRank.name}
              </p>
              <p className="text-sm text-white/90 font-semibold">Livello {user.level}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span 
                className="font-varsity text-lg uppercase tracking-wide"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 0px #15803D, -1px -1px 0px #15803D, 1px -1px 0px #15803D, -1px 1px 0px #15803D',
                }}
              >
                Progresso verso il prossimo rango
              </span>
              <span className="font-bold text-white">{rankProgress.toFixed(0)}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${rankProgress}%`,
                  background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
                }}
              />
            </div>
            <p className="text-sm text-white/90 font-semibold">
              Prossimo rango al livello {nextRankLevel}
            </p>
          </div>
        </motion.div>

        {/* Reputation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-5 mb-6"
          style={{
            background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
            border: '3px solid white',
            boxShadow: '0 4px 0 0 #1E40AF, inset 0 1px 0 0 rgba(255,255,255,0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-white" />
            <span 
              className="font-varsity text-2xl uppercase tracking-wide"
              style={{
                color: 'white',
                textShadow: '3px 3px 0px #1E40AF, -1px -1px 0px #1E40AF, 1px -1px 0px #1E40AF, -1px 1px 0px #1E40AF',
              }}
            >
              Reputazione
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p 
                className="font-brush text-2xl"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                }}
              >
                {reputationLevel.name}
              </p>
              <p className="text-sm text-white/80 font-brush">
                {user.reputation.toLocaleString()} punti reputazione
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 font-brush">Livello</p>
              <p 
                className="font-brush text-2xl"
                style={{
                  color: 'white',
                  textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                }}
              >
                {reputationLevel.level}
              </p>
            </div>
          </div>
          <div 
            className="rounded-lg p-3 text-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <p className="font-brush text-white mb-1">Come guadagnare reputazione:</p>
            <div className="grid grid-cols-2 gap-1 text-white/90 font-brush">
              <span>2 km/giorno → +100</span>
              <span>5 km/giorno → +300</span>
              <span>7 km/giorno → +600</span>
              <span>8 km/giorno → +800</span>
            </div>
          </div>
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
          {/* Animated Falling Leaves */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl pointer-events-none"
              initial={{ 
                x: `${10 + i * 12}%`, 
                y: -20,
                rotate: 0,
                opacity: 0.7
              }}
              animate={{ 
                y: ['0%', '120%'],
                x: [`${10 + i * 12}%`, `${15 + i * 10}%`, `${5 + i * 12}%`],
                rotate: [0, 180, 360],
                opacity: [0.7, 0.9, 0.5]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
              }}
            >
              🍂
            </motion.div>
          ))}
          
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
              <div className="bg-card/50 rounded-2xl p-5 border border-border/30 shadow-lg">
                <h3 className="font-calligraphy text-xl text-foreground mb-4 italic">Resoconto Ultimi 7 Giorni</h3>
                <StatsGrid stats={{
                  distance: weeklyDistance,
                  calories: weeklyCalories,
                  duration: weeklyDuration,
                  score: weeklyScore,
                  runsCount: weeklyRuns.length,
                  avgSpeed: weeklyAvgSpeed,
                }} />
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
            <h3 className="font-bold mb-3">Corse Recenti</h3>
            <div className="space-y-2">
              {runs.slice(-5).reverse().map((run) => (
                <div 
                  key={run.id}
                  className="bg-card rounded-lg p-3 border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {run.distance.toFixed(2)} km
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(run.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      +{run.scoreEarned.toLocaleString()} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {run.avgSpeed.toFixed(1)} km/h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
