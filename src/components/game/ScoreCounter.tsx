import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ScoreCounterProps {
  score: number;
  pointsPerSecond?: number;
  isRunning?: boolean;
  speed?: number; // km/h for flame intensity
}

export function ScoreCounter({ score, pointsPerSecond = 0, isRunning = false, speed = 0 }: ScoreCounterProps) {
  // Calculate flame intensity based on speed (0-20 km/h mapped to 0-1)
  const flameIntensity = Math.min(speed / 15, 1);
  const flameCount = Math.floor(6 + flameIntensity * 8); // 6-14 flames
  const baseFlameHeight = 50 + flameIntensity * 50; // 50-100px
  const animationSpeed = Math.max(0.5, 1.5 - flameIntensity); // Faster at higher speeds
  const [prevScore, setPrevScore] = useState(score);
  const [showPop, setShowPop] = useState(false);

  useEffect(() => {
    if (score > prevScore) {
      setShowPop(true);
      setTimeout(() => setShowPop(false), 300);
    }
    setPrevScore(score);
  }, [score, prevScore]);

  return (
    <motion.div
      className="relative rounded-2xl p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 50%, #1b3a5f 100%)',
        boxShadow: isRunning 
          ? `0 0 ${40 + flameIntensity * 40}px rgba(0, ${150 + flameIntensity * 50}, 255, ${0.5 + flameIntensity * 0.3}), 0 0 ${80 + flameIntensity * 40}px rgba(0, 100, 200, ${0.3 + flameIntensity * 0.2}), inset 0 -${20 + flameIntensity * 20}px ${60 + flameIntensity * 40}px rgba(0, 150, 255, ${0.2 + flameIntensity * 0.3})`
          : '0 4px 20px rgba(0, 100, 200, 0.3), inset 0 -10px 40px rgba(0, 150, 255, 0.1)',
      }}
      animate={showPop ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Blue flame effect from bottom - intensity based on speed */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ height: `${120 + flameIntensity * 60}px` }}
      >
        {/* Base flame glow - more intense with speed */}
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full"
          style={{
            height: `${80 + flameIntensity * 60}px`,
            background: `radial-gradient(ellipse at bottom, 
              rgba(0, ${180 + flameIntensity * 75}, 255, ${0.6 + flameIntensity * 0.4}) 0%, 
              rgba(0, 100, 200, ${0.3 + flameIntensity * 0.3}) 40%, 
              transparent 70%)`,
            filter: `blur(${8 + flameIntensity * 4}px)`,
          }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.05 + flameIntensity * 0.1, 1],
          }}
          transition={{ duration: animationSpeed, repeat: Infinity }}
        />
        
        {/* Inner white-hot core at high speed */}
        {flameIntensity > 0.5 && (
          <motion.div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: '60%',
              height: `${40 + flameIntensity * 30}px`,
              background: `radial-gradient(ellipse at bottom, 
                rgba(255, 255, 255, ${flameIntensity * 0.5}) 0%, 
                rgba(200, 240, 255, ${flameIntensity * 0.3}) 30%, 
                transparent 60%)`,
              filter: 'blur(6px)',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: animationSpeed * 0.5, repeat: Infinity }}
          />
        )}
        
        {/* Dynamic flame layers - more flames at higher speed */}
        {[...Array(flameCount)].map((_, i) => {
          const xPos = (i / flameCount) * 100;
          const heightVariation = baseFlameHeight + Math.random() * 30;
          const widthBase = 20 + flameIntensity * 15;
          
          return (
            <motion.div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${xPos}%`,
                width: `${widthBase + Math.random() * 10}px`,
                background: `linear-gradient(to top, 
                  rgba(${flameIntensity > 0.7 ? '255, 255, 255' : '0, 220, 255'}, ${0.9 + flameIntensity * 0.1}) 0%, 
                  rgba(0, ${200 + flameIntensity * 55}, 255, ${0.7 + flameIntensity * 0.2}) 20%, 
                  rgba(0, 150, 255, ${0.5 + flameIntensity * 0.2}) 50%, 
                  rgba(100, 180, 255, 0.3) 70%, 
                  transparent 100%)`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                filter: `blur(${2 + flameIntensity}px)`,
                transformOrigin: 'bottom center',
              }}
              animate={{
                height: [
                  `${heightVariation}px`, 
                  `${heightVariation + 30 + flameIntensity * 20}px`, 
                  `${heightVariation - 10}px`, 
                  `${heightVariation + 20 + flameIntensity * 15}px`, 
                  `${heightVariation}px`
                ],
                opacity: [0.7, 1, 0.6, 0.95, 0.7],
                scaleX: [1, 1.3 + flameIntensity * 0.3, 0.8, 1.2 + flameIntensity * 0.2, 1],
                rotate: [0, 3 + flameIntensity * 2, -2, 2, 0],
              }}
              transition={{
                duration: animationSpeed + (i % 3) * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.08,
              }}
            />
          );
        })}
      </div>

      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg" />

      <div className="relative z-10">
        {/* Score label */}
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span 
            className="font-calligraphy text-2xl"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0, 200, 255, 0.5)',
            }}
          >
            Score
          </span>
        </div>

        {/* Score value */}
        <div 
          className="font-sporty text-4xl md:text-5xl font-bold tracking-tight italic"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #4facfe 50%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(0, 200, 255, 0.6))',
          }}
        >
          <CountUp
            start={prevScore}
            end={score}
            duration={0.5}
            separator=","
            preserveValue
          />
        </div>

        <AnimatePresence>
          {isRunning && pointsPerSecond > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-1 mt-3"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span 
                className="font-mono text-sm font-bold"
                style={{
                  color: '#00d4ff',
                  textShadow: '0 0 10px rgba(0, 200, 255, 0.5)',
                }}
              >
                +{pointsPerSecond.toFixed(0)} pts/sec
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating sparks - more and faster at high speed */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(Math.floor(8 + flameIntensity * 12))].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${1.5 + flameIntensity}px`,
                height: `${1.5 + flameIntensity}px`,
                background: flameIntensity > 0.7 
                  ? 'radial-gradient(circle, #ffffff 0%, #00f2fe 100%)'
                  : 'radial-gradient(circle, #00f2fe 0%, #4facfe 100%)',
                boxShadow: `0 0 ${6 + flameIntensity * 4}px rgba(${flameIntensity > 0.7 ? '255, 255, 255' : '0, 200, 255'}, ${0.8 + flameIntensity * 0.2})`,
              }}
              initial={{ 
                x: `${5 + Math.random() * 90}%`, 
                y: '100%',
                opacity: 0,
                scale: 0.5,
              }}
              animate={{ 
                y: '-30%',
                opacity: [0, 1, 0.9, 0],
                scale: [0.5, 1 + flameIntensity * 0.5, 0.8, 0.2],
              }}
              transition={{
                duration: Math.max(1, 2 - flameIntensity),
                repeat: Infinity,
                delay: i * (0.2 - flameIntensity * 0.1),
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
