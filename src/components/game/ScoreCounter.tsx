import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ScoreCounterProps {
  score: number;
  pointsPerSecond?: number;
  isRunning?: boolean;
}

export function ScoreCounter({ score, pointsPerSecond = 0, isRunning = false }: ScoreCounterProps) {
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
          ? '0 0 40px rgba(0, 150, 255, 0.5), 0 0 80px rgba(0, 100, 200, 0.3), inset 0 -20px 60px rgba(0, 150, 255, 0.2)'
          : '0 4px 20px rgba(0, 100, 200, 0.3), inset 0 -10px 40px rgba(0, 150, 255, 0.1)',
      }}
      animate={showPop ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Blue flame effect from bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden">
        {/* Base flame glow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(0, 150, 255, 0.6) 0%, rgba(0, 100, 200, 0.3) 40%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        {/* Animated flame layers */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${10 + i * 15}%`,
              width: '30px',
              height: '60px',
              background: `linear-gradient(to top, 
                rgba(0, 200, 255, 0.8) 0%, 
                rgba(0, 150, 255, 0.6) 30%, 
                rgba(100, 180, 255, 0.4) 60%, 
                transparent 100%)`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              filter: 'blur(3px)',
            }}
            animate={{
              height: ['50px', '70px', '45px', '65px', '50px'],
              opacity: [0.7, 1, 0.6, 0.9, 0.7],
              scaleX: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 1.5 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}
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

      {/* Floating sparks */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: 'radial-gradient(circle, #00f2fe 0%, #4facfe 100%)',
                boxShadow: '0 0 6px rgba(0, 200, 255, 0.8)',
              }}
              initial={{ 
                x: `${10 + Math.random() * 80}%`, 
                y: '100%',
                opacity: 0,
                scale: 0.5,
              }}
              animate={{ 
                y: '-20%',
                opacity: [0, 1, 0.8, 0],
                scale: [0.5, 1, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
