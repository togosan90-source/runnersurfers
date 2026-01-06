import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  total_score: number;
  equipped_shoes: string;
  reputation: number;
  total_distance: number;
  rank: number;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, level, total_score, equipped_shoes, reputation, total_distance')
      .order('total_score', { ascending: false })
      .limit(300);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      const ranked = data.map((entry, index) => ({
        ...entry,
        total_score: Number(entry.total_score),
        reputation: Number(entry.reputation || 0),
        total_distance: Number(entry.total_distance || 0),
        rank: index + 1
      }));
      setLeaderboard(ranked);
      
      // Find user rank
      if (user) {
        const userEntry = ranked.find(e => e.id === user.id);
        setUserRank(userEntry?.rank ?? null);
      }
    }
    setLoading(false);
  };

  const getTier = (level: number): { name: string; icon: string; color: string } => {
    if (level >= 450) return { name: 'Mythical Runner', icon: '⚡', color: 'text-cyan-400' };
    if (level >= 350) return { name: 'Mythic Runner', icon: '✨', color: 'text-purple-500' };
    if (level >= 200) return { name: 'Epic Runner', icon: '🔥', color: 'text-orange-500' };
    if (level >= 100) return { name: 'Gran Master Runner', icon: '👑👑', color: 'text-amber-600' };
    if (level >= 60) return { name: 'Master Runner', icon: '👑', color: 'text-yellow-500' };
    if (level >= 20) return { name: 'Elite Runner', icon: '⭐', color: 'text-blue-400' };
    return { name: 'Warrior Runner', icon: '🥋', color: 'text-slate-400' };
  };

  return { leaderboard, userRank, loading, fetchLeaderboard, getTier };
};
