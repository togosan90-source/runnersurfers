import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Navigation, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerHeader } from '@/components/game/PlayerHeader';
import { ScoreCounter } from '@/components/game/ScoreCounter';
import { RunningMetrics } from '@/components/game/RunningMetrics';
import { RunningMap } from '@/components/game/RunningMap';
import { ActiveBoostBanner } from '@/components/game/ActiveBoostBanner';
import { DailyObjective } from '@/components/game/DailyObjective';
import { DailyQuests } from '@/components/game/DailyQuests';
import { BottomNav } from '@/components/layout/BottomNav';
import { useGameStore, getScoreMultiplier, getExpNeeded, getExpPercentage, calculateCalories, SHOES, getCoinsPerKm, getReputationForDistance, getTotalShoeBonus } from '@/store/gameStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useRuns } from '@/hooks/useRuns';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format pace (min/km)
function formatPace(speedKmh: number): string {
  if (speedKmh <= 0) return "--'--\"";
  const paceMinutes = 60 / speedKmh;
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.floor((paceMinutes - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
}

export default function RunPage() {
  const { 
    isRunning, 
    startRun, 
    endRun, 
    updateRun, 
    addExp, 
    addCoins, 
    addScore,
    addReputation,
    user,
    activeBoost,
    ownedShoes,
    checkAndResetDailyQuests,
    updateDailyQuestsProgress,
    getTotalScoreBonus,
    getTotalExpBonus,
    currentRun,
  } = useGameStore();

  const { saveRun } = useRuns();
  const { incrementProfileStats, fetchProfile } = useProfile();
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const navigate = useNavigate();

  const {
    requestPermission,
    notifyKilometer,
    notifyExpMilestone,
    notifyLevelUp,
  } = useNotifications();

  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ lat: 45.6769, lng: 9.2318 }); // Default: Carate Brianza
  const [path, setPath] = useState<{ lat: number; lng: number; timestamp: number }[]>([]);
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [pointsPerSecond, setPointsPerSecond] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastExpMilestone = useRef(0);
  const lastKmMilestone = useRef(0);
  const previousLevelRef = useRef(user.level);
  const runStartTimeRef = useRef<number>(0);

  // Restore state from global store if run is in progress (e.g., after navigation)
  useEffect(() => {
    if (isRunning && currentRun) {
      setDistance(currentRun.distance);
      setScore(currentRun.score);
      setSpeed(currentRun.speed);
      setPath(currentRun.positions);
      setGpsEnabled(true);
      runStartTimeRef.current = currentRun.startTime;
      if (currentRun.positions.length > 0) {
        const lastPos = currentRun.positions[currentRun.positions.length - 1];
        setCurrentPosition({ lat: lastPos.lat, lng: lastPos.lng });
        lastPositionRef.current = { lat: lastPos.lat, lng: lastPos.lng, time: lastPos.timestamp };
      }
    }
  }, []);

  // Calculate multipliers
  const getFullMultiplier = useCallback(() => {
    let mult = getScoreMultiplier(user.level);
    const shoe = SHOES.find(s => s.id === user.equippedShoes);
    if (shoe) {
      mult *= (1 + shoe.coinBonus / 100);
    }
    if (activeBoost && activeBoost.endTime > Date.now()) {
      mult *= (1 + activeBoost.boost.scoreBonus / 100);
    }
    return mult;
  }, [user.level, user.equippedShoes, activeBoost]);

  // Request notification permission on mount and check daily quests reset
  useEffect(() => {
    requestPermission();
    checkAndResetDailyQuests();
  }, [requestPermission, checkAndResetDailyQuests]);

  // Check for level up
  useEffect(() => {
    if (user.level > previousLevelRef.current) {
      notifyLevelUp(user.level);
      previousLevelRef.current = user.level;
    }
  }, [user.level, notifyLevelUp]);

  // Start GPS tracking
  const handleStartRun = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('GPS non supportato dal browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsEnabled(true);
        startRun();
        setIsPaused(false);
        setScore(0);
        setDistance(0);
        setPath([]);
        lastPositionRef.current = null;
        lastExpMilestone.current = 0;
        lastKmMilestone.current = 0;
        runStartTimeRef.current = Date.now();
        toast.success('🏃 Corsa iniziata! Buon allenamento!');
      },
      (error) => {
        console.error('GPS Error:', error);
        toast.error('Impossibile accedere al GPS. Verifica i permessi.');
      },
      { enableHighAccuracy: true }
    );
  }, [startRun]);

  // GPS tracking effect
  useEffect(() => {
    if (!isRunning || isPaused || !gpsEnabled) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentPosition(newPos);
        setPath(prev => [...prev, { ...newPos, timestamp: Date.now() }]);

        if (lastPositionRef.current) {
          const dist = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newPos.lat,
            newPos.lng
          );
          
          if (dist > 0.001) { // Filter noise (< 1 meter)
            const timeDiff = (Date.now() - lastPositionRef.current.time) / 1000 / 3600; // hours
            const currentSpeed = dist / timeDiff;
            setSpeed(currentSpeed);
            const newDistance = distance + dist;
            setDistance(newDistance);
            updateRun(newDistance, newPos.lat, newPos.lng, score, currentSpeed);
          }
        }

        lastPositionRef.current = { ...newPos, time: Date.now() };
      },
      (error) => console.error('GPS tracking error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRunning, isPaused, gpsEnabled, distance, updateRun]);

  // Score increment effect
  // Score increment effect - only when moving
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }
      setPointsPerSecond(0);
      return;
    }

    scoreIntervalRef.current = setInterval(() => {
      // Only gain points if actually moving (speed > 2 km/h walking threshold)
      if (speed < 2) {
        setPointsPerSecond(0);
        return;
      }

      const multiplier = getFullMultiplier();
      
      // Base score formula: speed-based scoring
      // Walking (2-6 km/h): ~5-15 pts/sec
      // Jogging (6-10 km/h): ~15-40 pts/sec
      // Running (10-15 km/h): ~40-80 pts/sec
      // Sprinting (15+ km/h): ~80-150 pts/sec
      const speedBonus = Math.pow(speed, 1.3); // Exponential reward for faster speeds
      const baseIncrement = speedBonus * 0.8;
      const increment = Math.floor(baseIncrement * multiplier);
      
      setPointsPerSecond(increment);
      setScore(prev => prev + increment);
    }, 1000); // Update every second for cleaner display

    return () => {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }
    };
  }, [isRunning, isPaused, speed, getFullMultiplier]);

  // Sync score to global store periodically
  useEffect(() => {
    if (!isRunning || !currentRun) return;
    // Update the global store with current score whenever it changes
    if (currentRun.score !== score) {
      updateRun(distance, currentPosition.lat, currentPosition.lng, score, speed);
    }
  }, [score, isRunning, currentRun, distance, currentPosition, speed, updateRun]);

  // Kilometer notification effect
  useEffect(() => {
    if (!isRunning || distance === 0) return;

    const currentKm = Math.floor(distance);
    if (currentKm > lastKmMilestone.current) {
      lastKmMilestone.current = currentKm;
      notifyKilometer(currentKm);
    }
  }, [distance, isRunning, notifyKilometer]);

  // EXP and coins milestone effect
  useEffect(() => {
    if (!isRunning || distance === 0) return;

    const expNeeded = getExpNeeded(user.level + 1);
    const expPerKm = expNeeded * getExpPercentage(user.level);
    const currentExpFromRun = distance * expPerKm;
    const currentPercentage = (currentExpFromRun / expNeeded) * 100;

    const milestones = [10, 25, 50, 75, 100];
    for (const milestone of milestones) {
      if (currentPercentage >= milestone && lastExpMilestone.current < milestone) {
        lastExpMilestone.current = milestone;
        const coins = milestone === 10 ? 3 : milestone === 25 ? 5 : milestone === 50 ? 4 : milestone === 75 ? 6 : 10;
        addCoins(coins);
        notifyExpMilestone(milestone, coins);
      }
    }
  }, [distance, isRunning, user.level, addCoins, notifyExpMilestone]);

  // End run
  const handleEndRun = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const run = endRun();
    if (run) {
      setIsSaving(true);
      
      // Calculate final values with progressive system
      const expNeeded = getExpNeeded(user.level + 1);
      const shoeBonus = getTotalShoeBonus(ownedShoes);
      const expGained = Math.floor(distance * expNeeded * getExpPercentage(user.level) * (1 + shoeBonus.expBonus / 100));
      const duration = Math.floor((Date.now() - runStartTimeRef.current) / 1000);
      const avgSpeed = duration > 0 ? (distance / (duration / 3600)) : 0;
      const runCalories = calculateCalories(distance);
      
      // Progressive coins calculation with shoe bonus and skill bonus
      const baseCoinsPerKm = getCoinsPerKm(user.level);
      const skillCoinBonus = user.skillCoins / 100; // Each skill point = 1% bonus
      const coinsEarned = Math.floor(distance * baseCoinsPerKm * (1 + shoeBonus.coinBonus / 100) * (1 + skillCoinBonus));
      
      // Apply skill score bonus to final score
      const skillScoreBonus = user.skillScore / 100; // Each skill point = 1% bonus
      const finalScore = Math.floor(score * (1 + skillScoreBonus));
      
      // Calculate reputation based on daily distance
      const reputationEarned = getReputationForDistance(distance);
      
      // Get upgrade bonuses
      const upgradeScoreBonus = getTotalScoreBonus();
      const upgradeExpBonus = getTotalExpBonus();
      
      // Apply upgrade bonuses
      const finalScoreWithUpgrade = Math.floor(finalScore * (1 + upgradeScoreBonus / 100));
      const expGainedWithUpgrade = Math.floor(expGained * (1 + upgradeExpBonus / 100));

      // Add to local store (for immediate UI update)
      addScore(finalScoreWithUpgrade);
      addExp(expGainedWithUpgrade);
      addCoins(coinsEarned);
      if (reputationEarned > 0) {
        addReputation(reputationEarned);
      }
      
      // Update daily quests progress and get rewards
      const questRewards = updateDailyQuestsProgress(distance);
      let totalCoinsEarned = coinsEarned;
      let totalExpEarned = expGainedWithUpgrade;
      
      if (questRewards.questsCompleted > 0) {
        // Add quest rewards to local store
        addCoins(questRewards.coinsEarned);
        const questExpValue = Math.floor(getExpNeeded(user.level) * (questRewards.expEarned / 100));
        addExp(questExpValue);
        totalCoinsEarned += questRewards.coinsEarned;
        totalExpEarned += questExpValue;
        toast.success(`🏆 ${questRewards.questsCompleted} Quest completate! +${questRewards.coinsEarned.toLocaleString()} monete, +${questRewards.expEarned}% EXP`);
      }

      try {
        // Save run to database
        const { error: runError } = await saveRun({
          distance,
          duration,
          avgSpeed,
          calories: runCalories,
          scoreEarned: finalScoreWithUpgrade,
          expEarned: totalExpEarned,
          coinsEarned: totalCoinsEarned,
          path
        });

        if (runError) {
          console.error('Error saving run:', runError);
          toast.error('Errore nel salvataggio della corsa');
        } else {
          // Update profile directly in database with increments
          const { error: profileError } = await incrementProfileStats({
            scoreEarned: finalScoreWithUpgrade,
            expEarned: totalExpEarned,
            coinsEarned: totalCoinsEarned,
            distanceRun: distance,
            reputationEarned: reputationEarned,
          });
          
          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
          
          // Show success with earned rewards
          let message = `🎉 Corsa salvata! Score: ${finalScoreWithUpgrade.toLocaleString()}, Monete: +${totalCoinsEarned.toLocaleString()}`;
          if (reputationEarned > 0) {
            message += `, Rep: +${reputationEarned}`;
          }
          toast.success(message);
        }
      } catch (err) {
        console.error('Error syncing data:', err);
        toast.error('Errore nella sincronizzazione');
      } finally {
        setIsSaving(false);
      }
    }

    setGpsEnabled(false);
    setScore(0);
    setDistance(0);
    setPath([]);
    setSpeed(0);
  }, [endRun, score, distance, user.level, user.skillCoins, user.skillScore, ownedShoes, addScore, addExp, addCoins, addReputation, path, saveRun, incrementProfileStats, updateDailyQuestsProgress, getTotalScoreBonus, getTotalExpBonus]);

  const calories = calculateCalories(distance);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Player Header */}
        <PlayerHeader />

        {/* Start Running CTA (when not running) */}
        <AnimatePresence>
          {!isRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <button 
                onClick={handleStartRun}
                className="mb-6 rounded-2xl px-6 py-5 mx-auto max-w-sm shadow-lg w-full cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
                  borderTop: '3px solid rgba(255,255,255,0.4)',
                  borderBottom: '4px solid #1E3A8A',
                  borderLeft: '2px solid rgba(255,255,255,0.2)',
                  borderRight: '2px solid #1E40AF',
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
                    <Navigation className="w-8 h-8 text-white" />
                  </div>
                  <h2 
                    className="font-display text-xl font-black text-center mb-1 uppercase tracking-wide"
                    style={{
                      color: 'white',
                      textShadow: '2px 2px 0px #1E40AF, -1px -1px 0px #1E40AF, 1px -1px 0px #1E40AF, -1px 1px 0px #1E40AF',
                    }}
                  >
                    ALLACCIA LE SCARPE. SI PARTE
                  </h2>
                  <p 
                    className="text-center text-sm"
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '1px 1px 0px rgba(0,0,0,0.2)',
                    }}
                  >
                    Attiva il GPS e inizia a guadagnare punti!
                  </p>
                </div>

                {/* Green-Cyan Start Button */}
                <div 
                  className="mt-4 rounded-xl px-6 py-3 flex items-center justify-center gap-3 shadow-lg"
                  style={{
                    background: 'linear-gradient(90deg, #22C55E 0%, #06B6D4 100%)',
                    borderTop: '2px solid rgba(255,255,255,0.3)',
                    borderBottom: '3px solid #047857',
                  }}
                >
                  <Play className="w-5 h-5 text-white" fill="white" />
                  <span 
                    className="font-display font-black text-lg uppercase tracking-wide"
                    style={{
                      color: 'white',
                      textShadow: '1px 1px 0px rgba(0,0,0,0.2)',
                    }}
                  >
                    INIZIA A CORRERE
                  </span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running Interface */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Map - Fixed height container */}
              <div className="w-full h-[200px] sm:h-[250px] rounded-xl overflow-hidden">
                <RunningMap
                  center={currentPosition}
                  path={path}
                  isRunning={!isPaused}
                />
              </div>

              {/* Metrics - Clear separation from map */}
              <div className="mt-4">
                <RunningMetrics
                  distance={distance}
                  speed={speed}
                  pace={formatPace(speed)}
                  calories={calories}
                  isRunning={!isPaused}
                />
              </div>

              {/* Score Counter */}
              <ScoreCounter
                score={score}
                pointsPerSecond={pointsPerSecond}
                isRunning={!isPaused}
                speed={speed}
              />

              {/* Active Boost */}
              <ActiveBoostBanner />


              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  variant={isPaused ? 'default' : 'secondary'}
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      RIPRENDI
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      PAUSA
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleEndRun}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      SALVATAGGIO...
                    </>
                  ) : (
                    <>
                      <Square className="w-5 h-5" />
                      STOP
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats when not running */}
        {!isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Daily Quests Section */}
            <DailyQuests />

            {/* Install App Button - Always visible */}
            {!isInstalled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isInstallable ? (
                  <Button
                    onClick={install}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Installa App
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/install')}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Installa App
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
