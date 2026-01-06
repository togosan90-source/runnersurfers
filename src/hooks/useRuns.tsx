import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export interface Run {
  id: string;
  user_id: string;
  distance: number;
  duration: number;
  avg_speed: number;
  calories: number;
  score_earned: number;
  exp_earned: number;
  coins_earned: number;
  path: { lat: number; lng: number; timestamp: number }[] | null;
  created_at: string;
}

export const useRuns = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRuns();
    } else {
      setRuns([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRuns = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching runs:', error);
    } else {
      setRuns(data.map(run => ({
        ...run,
        distance: Number(run.distance),
        avg_speed: Number(run.avg_speed),
        score_earned: Number(run.score_earned),
        path: run.path as Run['path']
      })));
    }
    setLoading(false);
  };

  const saveRun = async (runData: {
    distance: number;
    duration: number;
    avgSpeed: number;
    calories: number;
    scoreEarned: number;
    expEarned: number;
    coinsEarned: number;
    path: { lat: number; lng: number; timestamp: number }[];
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('runs')
      .insert({
        user_id: user.id,
        distance: runData.distance,
        duration: runData.duration,
        avg_speed: runData.avgSpeed,
        calories: runData.calories,
        score_earned: runData.scoreEarned,
        exp_earned: runData.expEarned,
        coins_earned: runData.coinsEarned,
        path: runData.path as unknown as Json
      });

    if (!error) {
      await fetchRuns();
    }

    return { error };
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekRuns = runs.filter(run => new Date(run.created_at) >= weekAgo);
    
    return {
      totalDistance: weekRuns.reduce((sum, run) => sum + run.distance, 0),
      totalDuration: weekRuns.reduce((sum, run) => sum + run.duration, 0),
      totalCalories: weekRuns.reduce((sum, run) => sum + run.calories, 0),
      totalScore: weekRuns.reduce((sum, run) => sum + run.score_earned, 0),
      totalRuns: weekRuns.length,
      avgSpeed: weekRuns.length > 0 
        ? weekRuns.reduce((sum, run) => sum + run.avg_speed, 0) / weekRuns.length 
        : 0
    };
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthRuns = runs.filter(run => new Date(run.created_at) >= monthAgo);
    
    return {
      totalDistance: monthRuns.reduce((sum, run) => sum + run.distance, 0),
      totalDuration: monthRuns.reduce((sum, run) => sum + run.duration, 0),
      totalCalories: monthRuns.reduce((sum, run) => sum + run.calories, 0),
      totalScore: monthRuns.reduce((sum, run) => sum + run.score_earned, 0),
      totalRuns: monthRuns.length,
      avgSpeed: monthRuns.length > 0 
        ? monthRuns.reduce((sum, run) => sum + run.avg_speed, 0) / monthRuns.length 
        : 0
    };
  };

  return { runs, loading, fetchRuns, saveRun, getWeeklyStats, getMonthlyStats };
};
