import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Timer, MapPin, Coins, Lock, CheckCircle2, Flame, Crown, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface MarathonEvent {
  id: string;
  type: 'standard' | 'intermediate' | 'hard';
  name: string;
  distance: number;
  requiredLevel: number;
  reward: number;
  icon: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
}

const MARATHON_EVENTS: MarathonEvent[] = [
  {
    id: 'standard',
    type: 'standard',
    name: 'Maratona Standard',
    distance: 20,
    requiredLevel: 150,
    reward: 100000,
    icon: '🏃',
    color: '#3B82F6',
    gradientStart: '#1E40AF',
    gradientEnd: '#3B82F6',
  },
  {
    id: 'intermediate',
    type: 'intermediate',
    name: 'Maratona Intermedia',
    distance: 25,
    requiredLevel: 350,
    reward: 200000,
    icon: '🔥',
    color: '#F59E0B',
    gradientStart: '#B45309',
    gradientEnd: '#F59E0B',
  },
  {
    id: 'hard',
    type: 'hard',
    name: 'Maratona Hard',
    distance: 30,
    requiredLevel: 600,
    reward: 600000,
    icon: '⚡',
    color: '#EF4444',
    gradientStart: '#991B1B',
    gradientEnd: '#EF4444',
  },
];

interface UserMarathon {
  event_type: string;
  distance_completed: number;
  completed: boolean;
  reward_claimed: boolean;
  event_date: string;
}

export function MarathonEvents() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [userMarathons, setUserMarathons] = useState<Record<string, UserMarathon>>({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const isWeekend = () => {
    const now = new Date();
    const day = now.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  const isEventActive = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Saturday from 8:00 to 23:30
    if (day === 6) {
      return hours >= 8 && (hours < 23 || (hours === 23 && minutes <= 30));
    }
    // Sunday from 00:00 to 23:30
    if (day === 0) {
      return hours < 23 || (hours === 23 && minutes <= 30);
    }
    return false;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (day === 6) {
      // Saturday - time until 23:30
      const endTime = new Date(now);
      endTime.setHours(23, 30, 0, 0);
      const diff = endTime.getTime() - now.getTime();
      return Math.max(0, Math.floor(diff / 1000 / 60)); // minutes remaining
    }
    if (day === 0) {
      // Sunday - time until 23:30
      const endTime = new Date(now);
      endTime.setHours(23, 30, 0, 0);
      const diff = endTime.getTime() - now.getTime();
      return Math.max(0, Math.floor(diff / 1000 / 60));
    }
    
    // Calculate time until next Saturday 8:00
    const daysUntilSaturday = (6 - day + 7) % 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    nextSaturday.setHours(8, 0, 0, 0);
    
    const diff = nextSaturday.getTime() - now.getTime();
    return Math.floor(diff / 1000 / 60);
  };

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}g ${remainingHours}h`;
  };

  useEffect(() => {
    if (user) {
      fetchUserMarathons();
    }
  }, [user]);

  const fetchUserMarathons = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('marathon_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_date', today);
    
    if (error) {
      console.error('Error fetching marathons:', error);
    } else {
      const marathonMap: Record<string, UserMarathon> = {};
      data?.forEach(m => {
        marathonMap[m.event_type] = {
          event_type: m.event_type,
          distance_completed: Number(m.distance_completed),
          completed: m.completed,
          reward_claimed: m.reward_claimed,
          event_date: m.event_date,
        };
      });
      setUserMarathons(marathonMap);
    }
    setLoading(false);
  };

  const joinMarathon = async (event: MarathonEvent) => {
    if (!user || !isEventActive()) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('marathon_events')
      .insert({
        user_id: user.id,
        event_type: event.type,
        event_date: today,
        target_distance: event.distance,
        reward_amount: event.reward,
        distance_completed: 0,
      });
    
    if (error) {
      if (error.code === '23505') {
        toast.error('Sei già iscritto a questa maratona oggi!');
      } else {
        console.error('Error joining marathon:', error);
        toast.error('Errore durante l\'iscrizione');
      }
    } else {
      toast.success(`Ti sei iscritto alla ${event.name}!`);
      fetchUserMarathons();
    }
  };

  const claimReward = async (event: MarathonEvent) => {
    if (!user || !profile) return;
    
    const userMarathon = userMarathons[event.type];
    if (!userMarathon || !userMarathon.completed || userMarathon.reward_claimed) return;
    
    setClaiming(event.type);
    
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('marathon_events')
      .update({ reward_claimed: true })
      .eq('user_id', user.id)
      .eq('event_type', event.type)
      .eq('event_date', today);
    
    if (error) {
      console.error('Error claiming reward:', error);
      toast.error('Errore nel riscattare il premio');
    } else {
      await updateProfile({ coins: profile.coins + event.reward });
      toast.success(`Hai ottenuto ${event.reward.toLocaleString()} monete!`);
      fetchUserMarathons();
    }
    
    setClaiming(null);
  };

  const userLevel = profile?.level || 1;
  const eventActive = isEventActive();
  const weekend = isWeekend();
  const timeRemaining = getTimeRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 mb-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        border: '3px solid transparent',
        backgroundClip: 'padding-box',
      }}
    >
      {/* Animated Rainbow Border */}
      <div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          background: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
          backgroundSize: '300% 100%',
          animation: 'rainbowBorder 4s linear infinite',
          margin: '-3px',
        }}
      />
      
      {/* Background glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-sm pointer-events-none"
          initial={{ 
            x: `${10 + i * 15}%`, 
            y: '100%',
            opacity: 0 
          }}
          animate={{ 
            y: [100, -20],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {i % 3 === 0 ? '🏃' : i % 3 === 1 ? '🏅' : '✨'}
        </motion.div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Trophy className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              Eventi Maratona
              <span className="text-xl">🏆</span>
            </h3>
            <p className="text-xs text-purple-300">Sabato & Domenica</p>
          </div>
        </div>
        
        {/* Event Status */}
        <div 
          className="px-3 py-1.5 rounded-lg flex items-center gap-2"
          style={{
            background: eventActive 
              ? 'rgba(34, 197, 94, 0.2)' 
              : 'rgba(239, 68, 68, 0.2)',
            border: eventActive 
              ? '2px solid #22C55E' 
              : '2px solid #EF4444',
          }}
        >
          <motion.div
            className={`w-2 h-2 rounded-full ${eventActive ? 'bg-green-500' : 'bg-red-500'}`}
            animate={{ scale: eventActive ? [1, 1.2, 1] : 1, opacity: eventActive ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className={`text-xs font-bold ${eventActive ? 'text-green-400' : 'text-red-400'}`}>
            {eventActive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div 
        className="rounded-xl p-3 mb-4 flex items-center gap-3"
        style={{
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <Timer className="w-5 h-5 text-purple-400" />
        <div>
          <p className="text-xs text-purple-300">
            {eventActive ? 'Tempo rimanente oggi:' : 'Prossimo evento:'}
          </p>
          <p className="font-bold text-white">{formatTimeRemaining(timeRemaining)}</p>
        </div>
      </div>

      {/* Marathon Events */}
      <div className="space-y-3 relative z-10">
        {MARATHON_EVENTS.map((event, index) => {
          const isLocked = userLevel < event.requiredLevel;
          const userMarathon = userMarathons[event.type];
          const isJoined = !!userMarathon;
          const isCompleted = userMarathon?.completed || false;
          const rewardClaimed = userMarathon?.reward_claimed || false;
          const progress = userMarathon?.distance_completed || 0;
          const progressPercent = Math.min((progress / event.distance) * 100, 100);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: isLocked 
                  ? 'rgba(30, 41, 59, 0.5)'
                  : `linear-gradient(135deg, ${event.gradientStart}20 0%, ${event.gradientEnd}10 100%)`,
                border: isCompleted 
                  ? '2px solid #22C55E'
                  : `2px solid ${isLocked ? 'rgba(100, 116, 139, 0.3)' : event.color}40`,
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              {/* Completed glow */}
              {isCompleted && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: isLocked 
                        ? 'rgba(100, 116, 139, 0.3)'
                        : `linear-gradient(135deg, ${event.gradientStart} 0%, ${event.gradientEnd} 100%)`,
                      boxShadow: isLocked ? 'none' : `0 0 15px ${event.color}40`,
                    }}
                    animate={isCompleted ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isLocked ? <Lock className="w-6 h-6 text-slate-500" /> : event.icon}
                  </motion.div>
                  
                  <div>
                    <h4 className={`font-bold flex items-center gap-2 ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                      {event.name}
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={isLocked ? 'text-slate-500' : 'text-slate-300'}>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {event.distance} km
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className={isLocked ? 'text-slate-500' : 'text-amber-400'}>
                        Lv. {event.requiredLevel}+
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward */}
                <div className="text-right">
                  <motion.div
                    className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                    }}
                    animate={!isLocked && !rewardClaimed ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-400">
                      {event.reward.toLocaleString()}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Progress Bar (if joined) */}
              {isJoined && !isLocked && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">
                      {progress.toFixed(2)} / {event.distance} km
                    </span>
                    <span className="text-slate-400">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden bg-slate-700">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${event.gradientStart}, ${event.gradientEnd})`,
                        width: `${progressPercent}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-3">
                {isLocked ? (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Sblocca al livello {event.requiredLevel}
                  </div>
                ) : isCompleted && !rewardClaimed ? (
                  <Button
                    onClick={() => claimReward(event)}
                    disabled={claiming === event.type}
                    className="w-full"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    }}
                  >
                    {claiming === event.type ? (
                      'Riscattando...'
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Riscatta Premio
                      </>
                    )}
                  </Button>
                ) : rewardClaimed ? (
                  <div className="text-xs text-green-400 flex items-center gap-1 justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                    Premio riscattato!
                  </div>
                ) : isJoined ? (
                  <div className="text-xs text-purple-300 flex items-center gap-1 justify-center">
                    <Flame className="w-4 h-4" />
                    Maratona in corso - Corri per completarla!
                  </div>
                ) : eventActive ? (
                  <Button
                    onClick={() => joinMarathon(event)}
                    className="w-full"
                    style={{
                      background: `linear-gradient(135deg, ${event.gradientStart} 0%, ${event.gradientEnd} 100%)`,
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Partecipa
                  </Button>
                ) : (
                  <div className="text-xs text-slate-400 text-center">
                    Evento disponibile Sabato e Domenica (8:00 - 23:30)
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info box */}
      <div 
        className="mt-4 p-3 rounded-xl text-xs"
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <p className="text-blue-300 flex items-center gap-2">
          <span>ℹ️</span>
          Le maratone devono essere completate nello stesso giorno di iscrizione. 
          La distanza percorsa durante le corse viene aggiunta automaticamente.
        </p>
      </div>
    </motion.div>
  );
}
