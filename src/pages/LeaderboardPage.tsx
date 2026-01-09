import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Crown, Search, Loader2, Star, Ruler, Users } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRank, getReputationLevel } from '@/store/gameStore';
import { MarathonEvents } from '@/components/game/MarathonEvents';

const getRankIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

// Get rank color for styling
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

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { leaderboard, userRank, loading, getTier } = useLeaderboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('score');

  const filteredEntries = searchQuery
    ? leaderboard.filter(e => e.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : leaderboard;

  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const userEntry = leaderboard.find(e => e.id === user?.id);

  // Calculate points needed for next rank
  const getPointsToNextRank = () => {
    if (!userRank || userRank <= 1) return null;
    const nextRankEntry = leaderboard.find(e => e.rank === userRank - 1);
    if (!nextRankEntry || !userEntry) return null;
    return nextRankEntry.total_score - userEntry.total_score;
  };

  const pointsToNext = getPointsToNextRank();

  // Sort leaderboard based on active tab
  const getSortedLeaderboard = () => {
    const sorted = [...filteredEntries];
    switch (activeTab) {
      case 'reputation':
        return sorted.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
      case 'distance':
        return sorted.sort((a, b) => (b.total_distance || 0) - (a.total_distance || 0));
      default:
        return sorted.sort((a, b) => b.total_score - a.total_score);
    }
  };

  const sortedLeaderboard = getSortedLeaderboard().slice(0, 300);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold flex items-center gap-2 mb-1 text-gold">
            <Trophy className="w-6 h-6" />
            Classifica Globale
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            📅 {currentMonth} - Top 300 Runner
          </p>
        </motion.div>

        {/* User Position Card */}
        {userEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
              border: '3px solid #60A5FA',
              boxShadow: '0 4px 0 0 #1E40AF, 0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Animated Stars */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm pointer-events-none"
                initial={{ 
                  x: `${10 + i * 12}%`, 
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
            
            {/* Trophy Icon */}
            <motion.div
              className="absolute right-4 top-4 text-4xl pointer-events-none"
              animate={{ 
                rotate: [-5, 5, -5],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 15px rgba(252, 211, 77, 0.6))'
              }}
            >
              🏆
            </motion.div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p 
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#93C5FD' }}
                >
                  📍 La tua posizione
                </p>
                <div className="flex items-center gap-2">
                  <motion.p 
                    className="font-display text-4xl font-bold"
                    style={{
                      color: '#FCD34D',
                      textShadow: '0 0 20px rgba(252, 211, 77, 0.6), 2px 2px 0px #78350F',
                    }}
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    #{userRank}
                  </motion.p>
                  <div 
                    className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      border: '2px solid #A5B4FC',
                      color: 'white',
                      boxShadow: '0 2px 0 0 #1E40AF',
                    }}
                  >
                    TOP {Math.ceil((userRank / leaderboard.length) * 100)}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p 
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#93C5FD' }}
                >
                  ⚡ Score totale
                </p>
                <p 
                  className="font-display text-2xl font-bold"
                  style={{
                    color: 'white',
                    textShadow: '0 0 10px rgba(255,255,255,0.3)',
                  }}
                >
                  {userEntry.total_score.toLocaleString()}
                </p>
              </div>
            </div>
            
            {pointsToNext && pointsToNext > 0 && (
              <motion.div 
                className="mt-4 rounded-xl p-3 flex items-center gap-3 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                  border: '2px solid rgba(96, 165, 250, 0.4)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    y: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs text-blue-300">Per superare #{userRank - 1}</p>
                  <p className="font-bold text-white">
                    <span 
                      className="text-lg"
                      style={{
                        color: '#4ADE80',
                        textShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                      }}
                    >
                      {pointsToNext.toLocaleString()}
                    </span>
                    <span className="text-sm text-blue-300 ml-1">punti</span>
                  </p>
                </div>
                <span className="text-2xl">🎯</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Marathon Events */}
        <MarathonEvents />

        {/* Tabs for different rankings */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="score" className="gap-1 text-xs">
              <Trophy className="w-3 h-3" />
              Score
            </TabsTrigger>
            <TabsTrigger value="reputation" className="gap-1 text-xs">
              <Star className="w-3 h-3" />
              Reputazione
            </TabsTrigger>
            <TabsTrigger value="distance" className="gap-1 text-xs">
              <Ruler className="w-3 h-3" />
              Distanza
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca runner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nessun runner in classifica</p>
            <p className="text-sm text-muted-foreground">Inizia a correre per apparire qui!</p>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && (
          <div className="space-y-3">
            {sortedLeaderboard.map((entry, index) => {
              const rank = getRank(entry.level);
              const repLevel = getReputationLevel(entry.reputation || 0);
              const isUser = entry.id === user?.id;
              const displayRank = index + 1;
              const isPodium = displayRank <= 3;

              // Dynamic colors based on position
              const getCardStyle = () => {
                if (displayRank === 1) {
                  return {
                    background: 'linear-gradient(135deg, #78350F 0%, #B45309 50%, #D97706 100%)',
                    border: '3px solid #FCD34D',
                    boxShadow: '0 4px 0 0 #451A03, 0 0 30px rgba(252, 211, 77, 0.5), inset 0 1px 0 0 rgba(255,255,255,0.3)',
                  };
                }
                if (displayRank === 2) {
                  return {
                    background: 'linear-gradient(135deg, #374151 0%, #6B7280 50%, #9CA3AF 100%)',
                    border: '3px solid #E5E7EB',
                    boxShadow: '0 4px 0 0 #1F2937, 0 0 25px rgba(229, 231, 235, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.3)',
                  };
                }
                if (displayRank === 3) {
                  return {
                    background: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
                    border: '3px solid #F59E0B',
                    boxShadow: '0 4px 0 0 #451A03, 0 0 25px rgba(245, 158, 11, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.3)',
                  };
                }
                if (isUser) {
                  return {
                    background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
                    border: '3px solid #60A5FA',
                    boxShadow: '0 4px 0 0 #1E40AF, 0 0 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)',
                  };
                }
                return {
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '2px solid rgba(96, 165, 250, 0.3)',
                  boxShadow: '0 2px 0 0 rgba(30, 64, 175, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.1)',
                };
              };

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="rounded-xl p-4 relative overflow-hidden cursor-pointer"
                  style={getCardStyle()}
                >
                  {/* Shine Effect for top 10 */}
                  {displayRank <= 10 && (
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
                        delay: index * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Podium special effects */}
                  {isPodium && (
                    <>
                      {/* Floating particles */}
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-xs pointer-events-none"
                          initial={{ 
                            x: `${20 + i * 20}%`, 
                            y: '100%',
                            opacity: 0 
                          }}
                          animate={{ 
                            y: [50, -10],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        >
                          {displayRank === 1 ? '✨' : displayRank === 2 ? '💫' : '⭐'}
                        </motion.div>
                      ))}
                    </>
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    {/* Rank Badge */}
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                      style={{
                        background: isPodium 
                          ? displayRank === 1 
                            ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' 
                            : displayRank === 2 
                              ? 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)'
                              : 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
                          : 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                        border: isPodium ? '2px solid rgba(255,255,255,0.5)' : '2px solid #60A5FA',
                        boxShadow: isPodium 
                          ? '0 2px 0 0 rgba(0,0,0,0.3), 0 0 15px rgba(252, 211, 77, 0.3)'
                          : '0 2px 0 0 #1E40AF',
                      }}
                      animate={isPodium ? {
                        scale: [1, 1.05, 1],
                        rotate: displayRank === 1 ? [-2, 2, -2] : 0,
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {displayRank <= 3 ? (
                        <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
                          {getRankIcon(displayRank)}
                        </span>
                      ) : (
                        <span 
                          className="text-lg"
                          style={{
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          #{displayRank}
                        </span>
                      )}
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-bold truncate text-lg"
                          style={{
                            color: isPodium ? (displayRank === 2 ? '#1F2937' : '#FEF3C7') : (isUser ? '#93C5FD' : 'white'),
                            textShadow: isPodium ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                          }}
                        >
                          {isUser ? '👤 ' : ''}{entry.username}
                        </span>
                        {isPodium && (
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Crown 
                              className="w-5 h-5" 
                              style={{ 
                                color: displayRank === 1 ? '#FCD34D' : displayRank === 2 ? '#1F2937' : '#F59E0B',
                                filter: 'drop-shadow(0 0 4px currentColor)'
                              }} 
                            />
                          </motion.span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{
                            background: 'rgba(59, 130, 246, 0.3)',
                            color: isPodium ? (displayRank === 2 ? '#1F2937' : '#FDE68A') : '#93C5FD',
                            border: '1px solid rgba(96, 165, 250, 0.5)',
                          }}
                        >
                          LV.{entry.level}
                        </span>
                        <span 
                          className="text-xs flex items-center gap-1"
                          style={{
                            color: isPodium ? (displayRank === 2 ? '#374151' : '#FDE68A') : '#A5B4FC',
                          }}
                        >
                          {rank.icon} {rank.name}
                        </span>
                      </div>
                    </div>

                    {/* Value based on tab */}
                    <div className="text-right">
                      {activeTab === 'score' && (
                        <div 
                          className="px-3 py-2 rounded-xl"
                          style={{
                            background: isPodium 
                              ? 'rgba(0,0,0,0.2)' 
                              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                            border: '2px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <p 
                            className="font-display font-bold text-lg"
                            style={{
                              color: isPodium ? (displayRank === 2 ? '#1F2937' : '#FCD34D') : '#FCD34D',
                              textShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
                            }}
                          >
                            {entry.total_score.toLocaleString()}
                          </p>
                          <p 
                            className="text-xs"
                            style={{
                              color: isPodium ? (displayRank === 2 ? '#374151' : '#FDE68A') : '#93C5FD',
                            }}
                          >
                            punti
                          </p>
                        </div>
                      )}
                      {activeTab === 'reputation' && (
                        <div 
                          className="px-3 py-2 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                            border: '2px solid rgba(167, 139, 250, 0.3)',
                          }}
                        >
                          <p 
                            className="font-display font-bold text-lg"
                            style={{
                              color: '#A78BFA',
                              textShadow: '0 0 10px rgba(167, 139, 250, 0.5)',
                            }}
                          >
                            {(entry.reputation || 0).toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: '#C4B5FD' }}>{repLevel.name}</p>
                        </div>
                      )}
                      {activeTab === 'distance' && (
                        <div 
                          className="px-3 py-2 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                            border: '2px solid rgba(74, 222, 128, 0.3)',
                          }}
                        >
                          <p 
                            className="font-display font-bold text-lg"
                            style={{
                              color: '#4ADE80',
                              textShadow: '0 0 10px rgba(74, 222, 128, 0.5)',
                            }}
                          >
                            {(entry.total_distance || 0).toFixed(1)}
                          </p>
                          <p className="text-xs" style={{ color: '#86EFAC' }}>km</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p>🔄 Aggiornamento: Tempo reale</p>
          <p>📅 Reset Score: Ultimo giorno del mese</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
