import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Crown, Search, Loader2, Star, Ruler, Users } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRank, getReputationLevel } from '@/store/gameStore';

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
            className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 mb-6 border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">La tua posizione</p>
                <p className="font-display text-3xl font-bold text-primary">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score totale</p>
                <p className="font-display text-xl font-bold text-foreground">
                  {userEntry.total_score.toLocaleString()}
                </p>
              </div>
            </div>
            {pointsToNext && pointsToNext > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">
                  Punti da #{userRank - 1}: <span className="font-bold text-accent">{pointsToNext.toLocaleString()}</span> Score
                </span>
              </div>
            )}
          </motion.div>
        )}

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
          <div className="space-y-2">
            {sortedLeaderboard.map((entry, index) => {
              const rank = getRank(entry.level);
              const repLevel = getReputationLevel(entry.reputation || 0);
              const isUser = entry.id === user?.id;
              const displayRank = index + 1;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`rounded-xl p-4 flex items-center gap-3 ${
                    isUser
                      ? 'bg-primary/10 border-2 border-primary'
                      : displayRank <= 3
                      ? 'bg-gradient-to-r from-gold/10 to-transparent border border-gold/30'
                      : 'bg-card border border-border'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 text-center">
                    {displayRank <= 3 ? (
                      <span className="text-2xl">{getRankIcon(displayRank)}</span>
                    ) : (
                      <span className="font-display font-bold text-muted-foreground">
                        #{displayRank}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold truncate ${isUser ? 'text-primary' : ''}`}>
                        {isUser ? '👤 ' : ''}{entry.username}
                      </span>
                      {displayRank <= 3 && (
                        <Crown className="w-4 h-4 text-gold" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>LV.{entry.level}</span>
                      <span className={getRankColor(rank.color)}>
                        {rank.icon} {rank.name}
                      </span>
                    </div>
                  </div>

                  {/* Value based on tab */}
                  <div className="text-right">
                    {activeTab === 'score' && (
                      <>
                        <p className="font-display font-bold text-foreground">
                          {entry.total_score.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">punti</p>
                      </>
                    )}
                    {activeTab === 'reputation' && (
                      <>
                        <p className={`font-display font-bold ${getRepColor(repLevel.color)}`}>
                          {(entry.reputation || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{repLevel.name}</p>
                      </>
                    )}
                    {activeTab === 'distance' && (
                      <>
                        <p className="font-display font-bold text-primary">
                          {(entry.total_distance || 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">km</p>
                      </>
                    )}
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
