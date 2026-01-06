import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGameStore, getExpNeeded } from '@/store/gameStore';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  exp: number;
  total_score: number;
  coins: number;
  equipped_shoes: string;
  skill_points: number;
  skill_coins: number;
  skill_score: number;
  reputation: number;
  total_distance: number;
  streak_days: number;
  last_run_date: string | null;
  owned_shoes: string[];
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const setUserData = useGameStore((state) => state.setUser);
  const gameUser = useGameStore((state) => state.user);
  const ownedShoes = useGameStore((state) => state.ownedShoes);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data as Profile);
      // Sync with game store - all fields
      setUserData({
        id: data.id,
        username: data.username,
        level: data.level,
        exp: data.exp,
        totalScore: Number(data.total_score),
        coins: data.coins,
        equippedShoes: data.equipped_shoes,
        skillPoints: data.skill_points || 0,
        skillCoins: data.skill_coins || 0,
        skillScore: data.skill_score || 0,
        reputation: data.reputation || 0,
        totalDistance: Number(data.total_distance) || 0,
        streakDays: data.streak_days || 0,
        lastRunDate: data.last_run_date,
      });
      
      // Also sync owned shoes to the store
      if (data.owned_shoes && Array.isArray(data.owned_shoes)) {
        useGameStore.setState({ ownedShoes: data.owned_shoes });
      }
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      await fetchProfile();
    }

    return { error };
  };

  const syncProfileFromStore = async () => {
    if (!user) return;
    
    // CRITICAL: Don't sync if gameStore has default/unloaded values
    // This prevents overwriting real data with empty defaults
    if (!gameUser.id || gameUser.id === '') {
      console.warn('Sync aborted: gameStore not loaded from database yet');
      return;
    }
    
    // Extra safety: don't sync if the profile hasn't been loaded
    if (!profile) {
      console.warn('Sync aborted: profile not loaded yet');
      return;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        level: gameUser.level,
        exp: gameUser.exp,
        total_score: gameUser.totalScore,
        coins: gameUser.coins,
        equipped_shoes: gameUser.equippedShoes,
        skill_points: gameUser.skillPoints,
        skill_coins: gameUser.skillCoins,
        skill_score: gameUser.skillScore,
        reputation: gameUser.reputation,
        total_distance: gameUser.totalDistance,
        streak_days: gameUser.streakDays,
        last_run_date: gameUser.lastRunDate,
        owned_shoes: ownedShoes,
      })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error syncing profile:', error);
    }
  };

  // Increment profile values directly in database (for run completion)
  const incrementProfileStats = async (stats: {
    scoreEarned: number;
    expEarned: number;
    coinsEarned: number;
    distanceRun: number;
    reputationEarned: number;
  }) => {
    if (!user || !profile) return { error: new Error('Not authenticated or no profile') };
    
    // Calculate new level based on exp
    let newExp = profile.exp + stats.expEarned;
    let newLevel = profile.level;
    let newSkillPoints = profile.skill_points;
    
    while (newExp >= getExpNeeded(newLevel)) {
      newExp -= getExpNeeded(newLevel);
      newLevel++;
      newSkillPoints += 3;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        total_score: profile.total_score + stats.scoreEarned,
        exp: newExp,
        level: newLevel,
        skill_points: newSkillPoints,
        coins: profile.coins + stats.coinsEarned,
        total_distance: Number(profile.total_distance) + stats.distanceRun,
        reputation: profile.reputation + stats.reputationEarned,
        last_run_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', user.id);
    
    if (!error) {
      // Refresh profile after update
      await fetchProfile();
    }
    
    return { error };
  };

  return { profile, loading, fetchProfile, updateProfile, syncProfileFromStore, incrementProfileStats };
};
