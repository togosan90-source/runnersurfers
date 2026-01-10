import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Timer, Users, Coins, Lock, Crown, Zap, Star, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CompetitionEvent {
  id: string;
  name: string;
  requiredLevel: number;
  entryFee: number;
  prize: number;
  icon: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  tier: number;
}

const COMPETITION_EVENTS: CompetitionEvent[] = [
  {
    id: 'open',
    name: 'Torneo Aperto',
    requiredLevel: 0,
    entryFee: 300000,
    prize: 600000,
    icon: '🏆',
    color: '#3B82F6',
    gradientStart: '#1E40AF',
    gradientEnd: '#3B82F6',
    tier: 1,
  },
  {
    id: 'elite',
    name: 'Torneo Elite',
    requiredLevel: 150,
    entryFee: 600000,
    prize: 1500000,
    icon: '⭐',
    color: '#8B5CF6',
    gradientStart: '#6D28D9',
    gradientEnd: '#8B5CF6',
    tier: 2,
  },
  {
    id: 'master',
    name: 'Torneo Master',
    requiredLevel: 350,
    entryFee: 5000000,
    prize: 5000000,
    icon: '👑',
    color: '#F59E0B',
    gradientStart: '#B45309',
    gradientEnd: '#F59E0B',
    tier: 3,
  },
  {
    id: 'legendary',
    name: 'Torneo Leggendario',
    requiredLevel: 500,
    entryFee: 10000000,
    prize: 20000000,
    icon: '💎',
    color: '#EF4444',
    gradientStart: '#991B1B',
    gradientEnd: '#EF4444',
    tier: 4,
  },
];

interface CompetitionParticipant {
  id: string;
  competition_id: string;
  user_id: string;
  score_at_join: number;
  joined_at: string;
}

export function SundayCompetitions() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { leaderboard } = useLeaderboard();
  const [participations, setParticipations] = useState<Record<string, boolean>>({});
  const [joining, setJoining] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if it's Sunday
  const isSunday = () => {
    const now = new Date();
    return now.getDay() === 0;
  };

  // Check if event is active (Sunday 16:00-18:00)
  const isEventActive = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    
    // Sunday from 16:00 to 18:00
    return day === 0 && hours >= 16 && hours < 18;
  };

  const getTimeInfo = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (day === 0 && hours >= 16 && hours < 18) {
      // Event is active, show remaining time
      const endTime = new Date(now);
      endTime.setHours(18, 0, 0, 0);
      const diff = endTime.getTime() - now.getTime();
      return {
        active: true,
        minutes: Math.max(0, Math.floor(diff / 1000 / 60)),
      };
    }
    
    // Calculate time until next Sunday 16:00
    let daysUntilSunday = (7 - day) % 7;
    if (day === 0 && hours >= 18) {
      daysUntilSunday = 7; // Next Sunday
    }
    
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(16, 0, 0, 0);
    
    const diff = nextSunday.getTime() - now.getTime();
    return {
      active: false,
      minutes: Math.floor(diff / 1000 / 60),
    };
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
      fetchParticipations();
    }
  }, [user]);

  const fetchParticipations = async () => {
    if (!user) return;
    
    // For now, we'll track participation in memory since we don't have a competitions table
    // In a real implementation, you'd have a competitions table
    const storedParticipations = localStorage.getItem(`competitions_${user.id}_${new Date().toISOString().split('T')[0]}`);
    if (storedParticipations) {
      setParticipations(JSON.parse(storedParticipations));
    }
    setLoading(false);
  };

  const joinCompetition = async (event: CompetitionEvent) => {
    if (!user || !profile || !isEventActive()) return;
    
    // Check level requirement
    if (profile.level < event.requiredLevel) {
      toast.error(`Devi essere almeno livello ${event.requiredLevel} per partecipare!`);
      return;
    }
    
    // Check if user has enough coins
    if (profile.coins < event.entryFee) {
      toast.error(`Non hai abbastanza monete! Servono ${event.entryFee.toLocaleString()} monete.`);
      return;
    }
    
    // Check if already joined
    if (participations[event.id]) {
      toast.error('Sei già iscritto a questa competizione!');
      return;
    }
    
    setJoining(event.id);
    
    // Deduct entry fee
    const { error } = await updateProfile({ coins: profile.coins - event.entryFee });
    
    if (error) {
      toast.error('Errore durante l\'iscrizione');
      setJoining(null);
      return;
    }
    
    // Record participation
    const newParticipations = { ...participations, [event.id]: true };
    setParticipations(newParticipations);
    localStorage.setItem(`competitions_${user.id}_${new Date().toISOString().split('T')[0]}`, JSON.stringify(newParticipations));
    
    toast.success(`Ti sei iscritto al ${event.name}! Costo: ${event.entryFee.toLocaleString()} monete`);
    setJoining(null);
  };

  const userLevel = profile?.level || 1;
  const userCoins = profile?.coins || 0;
  const timeInfo = getTimeInfo();
  const eventActive = isEventActive();
  const sunday = isSunday();

  // Don't show if not Sunday (unless you want to show upcoming events)
  if (!sunday && !eventActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          border: '3px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="p-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
            }}
            animate={{ 
              scale: [1, 1.1, 1],
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
              Tornei Domenica
              <span className="text-xl">🎮</span>
            </h3>
            <p className="text-xs text-red-300">Solo Domenica 16:00-18:00</p>
          </div>
        </div>
        
        <div 
          className="rounded-xl p-3 flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Timer className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-xs text-red-300">Prossimo torneo:</p>
            <p className="font-bold text-white">{formatTimeRemaining(timeInfo.minutes)}</p>
          </div>
        </div>
      </motion.div>
    );
  }

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
          background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
        }}
      />


      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
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
              Tornei Domenica
              <span className="text-xl">🎮</span>
            </h3>
            <p className="text-xs text-red-300">Top 300 • 16:00-18:00</p>
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
            {eventActive ? 'LIVE' : 'ATTESA'}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div 
        className="rounded-xl p-3 mb-4 flex items-center gap-3"
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <Timer className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-xs text-red-300">
            {eventActive ? 'Tempo rimanente:' : 'Inizia tra:'}
          </p>
          <p className="font-bold text-white">{formatTimeRemaining(timeInfo.minutes)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Top 300</span>
        </div>
      </div>

      {/* Your Coins */}
      <div 
        className="rounded-xl p-3 mb-4 flex items-center gap-3"
        style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        }}
      >
        <Coins className="w-5 h-5 text-amber-400" />
        <div>
          <p className="text-xs text-amber-300">Le tue monete:</p>
          <p className="font-bold text-amber-400">{userCoins.toLocaleString()}</p>
        </div>
      </div>

      {/* Competition Events */}
      <div className="space-y-3 relative z-10">
        {COMPETITION_EVENTS.map((event, index) => {
          const isLocked = userLevel < event.requiredLevel;
          const hasEnoughCoins = userCoins >= event.entryFee;
          const isJoined = participations[event.id];
          const canJoin = eventActive && !isLocked && hasEnoughCoins && !isJoined;

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
                border: isJoined 
                  ? '2px solid #22C55E'
                  : `2px solid ${isLocked ? 'rgba(100, 116, 139, 0.3)' : event.color}40`,
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              {/* Tier badge */}
              <div 
                className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: `linear-gradient(135deg, ${event.gradientStart}, ${event.gradientEnd})`,
                  color: 'white',
                }}
              >
                FASCIA {event.tier}
              </div>

              {/* Joined glow */}
              {isJoined && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="flex items-start gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: isLocked 
                      ? 'rgba(100, 116, 139, 0.3)'
                      : `linear-gradient(135deg, ${event.gradientStart} 0%, ${event.gradientEnd} 100%)`,
                    boxShadow: isLocked ? 'none' : `0 0 15px ${event.color}40`,
                  }}
                  animate={isJoined ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isLocked ? <Lock className="w-6 h-6 text-slate-500" /> : event.icon}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold flex items-center gap-2 ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                    {event.name}
                    {isJoined && <span className="text-green-400 text-xs">✓ Iscritto</span>}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                    {event.requiredLevel > 0 && (
                      <span className={isLocked ? 'text-slate-500' : 'text-amber-400'}>
                        Lv. {event.requiredLevel}+
                      </span>
                    )}
                    {event.requiredLevel > 0 && <span className="text-slate-500">|</span>}
                    <span className={`flex items-center gap-1 ${!hasEnoughCoins && !isLocked ? 'text-red-400' : 'text-slate-300'}`}>
                      <Coins className="w-3 h-3" />
                      {event.entryFee.toLocaleString()}
                    </span>
                  </div>

                  {/* Prize */}
                  <motion.div
                    className="flex items-center gap-1 mt-2 px-2 py-1 rounded-lg w-fit"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                    }}
                    animate={!isLocked ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Crown className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-green-400 text-sm">
                      Premio: {event.prize.toLocaleString()}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3">
                {isLocked ? (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Sblocca al livello {event.requiredLevel}
                  </div>
                ) : isJoined ? (
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <Medal className="w-3 h-3" />
                    In competizione! Buona fortuna!
                  </div>
                ) : !eventActive ? (
                  <div className="text-xs text-orange-400 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    Evento disponibile dalle 16:00 alle 18:00
                  </div>
                ) : !hasEnoughCoins ? (
                  <div className="text-xs text-red-400 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    Ti servono {(event.entryFee - userCoins).toLocaleString()} monete in più
                  </div>
                ) : (
                  <Button
                    onClick={() => joinCompetition(event)}
                    disabled={joining === event.id}
                    className="w-full"
                    style={{
                      background: `linear-gradient(135deg, ${event.gradientStart} 0%, ${event.gradientEnd} 100%)`,
                      border: 'none',
                    }}
                  >
                    {joining === event.id ? (
                      'Iscrizione...'
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Partecipa ({event.entryFee.toLocaleString()} monete)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <p className="text-xs text-slate-400 text-center">
          💡 I premi vengono assegnati ai Top 300 della classifica score alla fine dell'evento
        </p>
      </div>
    </motion.div>
  );
}
