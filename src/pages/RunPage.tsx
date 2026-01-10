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
  const [isMoving, setIsMoving] = useState(false);
  const [movingSeconds, setMovingSeconds] = useState(0);
  const [scoreActive, setScoreActive] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const movingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastExpMilestone = useRef(0);
  const lastKmMilestone = useRef(0);
  const previousLevelRef = useRef(user.level);
  const runStartTimeRef = useRef<number>(0);
  const lastSpeedUpdateRef = useRef<number>(Date.now());

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

  // Speed thresholds for anti-cheat
  const MIN_SPEED_THRESHOLD = 2; // km/h - minimum speed to be considered moving (walking)
  const MAX_SPEED_THRESHOLD = 20; // km/h - maximum human running speed (above = vehicle)
  const SCORE_ACTIVATION_SECONDS = 60; // 1 minute to activate score
  const GPS_ACCURACY_THRESHOLD = 20; // meters - reject readings with worse accuracy

  // GPS tracking effect with improved precision and anti-cheat
  useEffect(() => {
    if (!isRunning || isPaused || !gpsEnabled) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        
        // Reject low accuracy GPS readings
        if (accuracy > GPS_ACCURACY_THRESHOLD) {
          console.log(`GPS accuracy too low: ${accuracy.toFixed(1)}m (max: ${GPS_ACCURACY_THRESHOLD}m)`);
          return;
        }

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
          
          const timeDiff = (Date.now() - lastPositionRef.current.time) / 1000; // seconds
          
          // Filter GPS noise (< 2 meters or < 1 second)
          if (dist > 0.002 && timeDiff >= 1) {
            const currentSpeed = (dist / timeDiff) * 3600; // km/h
            
            // Anti-cheat: Ignore unrealistic speeds (vehicle detection)
            if (currentSpeed > MAX_SPEED_THRESHOLD) {
              console.log(`Speed too high (vehicle detected): ${currentSpeed.toFixed(1)} km/h`);
              toast.error('🚗 Velocità troppo alta! Sei in veicolo? Lo score è bloccato.', {
                id: 'vehicle-detected',
                duration: 3000,
              });
              setSpeed(0);
              setIsMoving(false);
              lastPositionRef.current = { ...newPos, time: Date.now() };
              return;
            }
            
            // Only count distance at human speeds
            if (currentSpeed >= MIN_SPEED_THRESHOLD && currentSpeed <= MAX_SPEED_THRESHOLD) {
              setSpeed(currentSpeed);
              const newDistance = distance + dist;
              setDistance(newDistance);
              updateRun(newDistance, newPos.lat, newPos.lng, score, currentSpeed);
            } else if (currentSpeed < MIN_SPEED_THRESHOLD) {
              // User is stationary or moving very slowly
              setSpeed(currentSpeed);
            }
          }
        }

        lastPositionRef.current = { ...newPos, time: Date.now() };
      },
      (error) => console.error('GPS tracking error:', error),
      { 
        enableHighAccuracy: true, 
        maximumAge: 0, 
        timeout: 10000,
        // Request best possible accuracy
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRunning, isPaused, gpsEnabled, distance, updateRun, score]);

  // Detect if user is moving at human pace (walking/running)
  useEffect(() => {
    if (!isRunning || isPaused) {
      setIsMoving(false);
      setMovingSeconds(0);
      setScoreActive(false);
      return;
    }

    // Valid movement: speed between walking pace and max running speed
    const isValidHumanMovement = speed >= MIN_SPEED_THRESHOLD && speed <= MAX_SPEED_THRESHOLD;
    
    setIsMoving(isValidHumanMovement);
    
    // Reset moving timer when user stops or goes too fast
    if (!isValidHumanMovement) {
      setMovingSeconds(0);
      setScoreActive(false);
    }
  }, [speed, isRunning, isPaused]);

  // Timer to track continuous movement (60 seconds / 1 minute to activate score)
  useEffect(() => {
    if (!isRunning || isPaused || !isMoving) {
      if (movingTimerRef.current) {
        clearInterval(movingTimerRef.current);
        movingTimerRef.current = null;
      }
      return;
    }

    movingTimerRef.current = setInterval(() => {
      setMovingSeconds(prev => {
        const newValue = prev + 1;
        // Activate score after 60 seconds (1 minute) of continuous human-pace movement
        if (newValue >= SCORE_ACTIVATION_SECONDS && !scoreActive) {
          setScoreActive(true);
          toast.success('⭐ Score attivato! Continua a correre!');
          console.log('Score activated after 60 seconds of movement');
        }
        return newValue;
      });
    }, 1000);

    return () => {
      if (movingTimerRef.current) {
        clearInterval(movingTimerRef.current);
        movingTimerRef.current = null;
      }
    };
  }, [isRunning, isPaused, isMoving, scoreActive]);

  // Score increment effect - only when moving at human pace AND score is active
  useEffect(() => {
    if (!isRunning || isPaused || !scoreActive || !isMoving) {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
        scoreIntervalRef.current = null;
      }
      setPointsPerSecond(0);
      return;
    }

    console.log('Starting score increment - Speed:', speed, 'ScoreActive:', scoreActive, 'IsMoving:', isMoving);

    scoreIntervalRef.current = setInterval(() => {
      // Double check we're still moving at human pace
      if (speed < MIN_SPEED_THRESHOLD || speed > MAX_SPEED_THRESHOLD) {
        setPointsPerSecond(0);
        return;
      }

      const multiplier = getFullMultiplier();
      
      // Base score formula: speed-based scoring (only for human speeds 2-20 km/h)
      // Walking (2-6 km/h): ~5-15 pts/sec
      // Jogging (6-10 km/h): ~15-40 pts/sec
      // Running (10-15 km/h): ~40-80 pts/sec
      // Fast running (15-20 km/h): ~80-120 pts/sec
      const speedBonus = Math.pow(speed, 1.3);
      const baseIncrement = speedBonus * 0.8;
      const increment = Math.floor(baseIncrement * multiplier);
      
      console.log('Score increment:', increment, 'Speed:', speed.toFixed(1));
      setPointsPerSecond(increment);
      setScore(prev => prev + increment);
    }, 1000);

    return () => {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
        scoreIntervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, scoreActive, isMoving, speed, getFullMultiplier]);

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
              <motion.button 
                onClick={handleStartRun}
                className="mb-6 rounded-2xl px-6 py-6 mx-auto max-w-sm w-full cursor-pointer relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 50%, #1E1B4B 100%)',
                  border: '3px solid #3B82F6',
                  boxShadow: '0 4px 0 0 #1E40AF, 0 0 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.1)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >

                {/* Shine effect */}
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
                    ease: "easeInOut"
                  }}
                />

                <div className="flex flex-col items-center relative z-10">
                  {/* Animated GPS Icon */}
                  <motion.div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)',
                      border: '3px solid #4ADE80',
                      boxShadow: '0 0 30px rgba(74, 222, 128, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 30px rgba(74, 222, 128, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
                        '0 0 50px rgba(74, 222, 128, 0.8), inset 0 2px 0 rgba(255,255,255,0.3)',
                        '0 0 30px rgba(74, 222, 128, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Navigation className="w-10 h-10" style={{ color: 'white', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} />
                  </motion.div>

                  {/* Title */}
                  <h2 
                    className="font-varsity text-2xl text-center mb-2 uppercase tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #FCD34D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }}
                  >
                    ALLACCIA LE SCARPE. SI PARTE!
                  </h2>

                  {/* Subtitle */}
                  <p 
                    className="text-center text-sm font-semibold mb-4"
                    style={{
                      color: '#93C5FD',
                      textShadow: '0 0 10px rgba(147, 197, 253, 0.5)',
                    }}
                  >
                    Attiva il GPS e inizia a guadagnare punti! 🎮
                  </p>

                  {/* Start Button */}
                  <motion.div 
                    className="rounded-xl px-8 py-4 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                      border: '3px solid #4ADE80',
                      boxShadow: '0 4px 0 0 #166534, 0 0 20px rgba(74, 222, 128, 0.4)',
                    }}
                    whileHover={{
                      boxShadow: '0 4px 0 0 #166534, 0 0 35px rgba(74, 222, 128, 0.6)',
                    }}
                  >
                    <Play className="w-6 h-6" style={{ color: 'white', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }} fill="white" />
                    <span 
                      className="font-varsity text-xl uppercase tracking-wide"
                      style={{
                        color: 'white',
                        textShadow: '2px 2px 0px #166534, 0 0 10px rgba(255,255,255,0.3)',
                      }}
                    >
                      INIZIA A CORRERE
                    </span>
                  </motion.div>
                </div>
              </motion.button>
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
                  speed={speed}
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

              {/* Score Status Indicator */}
              {!scoreActive && isMoving && (
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-3 text-center">
                  <p className="text-amber-400 font-semibold text-sm">
                    ⏱️ Attivazione Score: {10 - movingSeconds}s rimanenti
                  </p>
                  <p className="text-amber-300/70 text-xs mt-1">
                    Continua a muoverti per attivare lo score!
                  </p>
                </div>
              )}
              
              {!isMoving && isRunning && !isPaused && (
                <div className="relative bg-gradient-to-br from-orange-950/80 via-amber-950/60 to-orange-950/80 p-4 overflow-hidden"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                  }}>
                  {/* Scan line effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-pulse"
                      style={{ top: '50%' }} />
                  </div>
                  
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-amber-500/60" />
                  <div className="absolute top-0 right-3 w-3 h-3 border-r-2 border-t-2 border-amber-500/60" />
                  <div className="absolute bottom-0 left-3 w-3 h-3 border-l-2 border-b-2 border-amber-500/60" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-amber-500/60" />
                  
                  {/* Glowing border lines */}
                  <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                  
                  <div className="relative flex items-center justify-center gap-3">
                    {/* Hexagonal icon container */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                        }}>
                        <span className="text-lg">⏸️</span>
                      </div>
                      <div className="absolute inset-0 bg-amber-400/20 animate-ping"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                        }} />
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-amber-300 font-bold text-sm tracking-wider"
                        style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>
                        SCORE IN PAUSA
                      </span>
                      <span className="text-amber-400/70 text-xs font-mono">
                        Muoviti per guadagnare punti!
                      </span>
                    </div>
                    
                    {/* Status LED */}
                    <div className="relative ml-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                        style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Score Counter */}
              <ScoreCounter
                score={score}
                pointsPerSecond={pointsPerSecond}
                isRunning={!isPaused && scoreActive && isMoving}
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
