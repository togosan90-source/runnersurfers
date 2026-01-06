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
      className={`relative rounded-2xl p-6 overflow-hidden ${isRunning ? 'glow-primary' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
        border: '2px solid #bae6fd',
        boxShadow: '0 4px 20px rgba(186, 230, 253, 0.3)',
      }}
      animate={showPop ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      {isRunning && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      )}

      <div className="relative z-10">
        {/* Score label with calligraphy font */}
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-green-500" />
          <span className="font-calligraphy text-2xl text-green-500">
            Score
          </span>
        </div>

        {/* Score value with sporty italic font */}
        <div 
          className="font-sporty text-4xl md:text-5xl font-bold text-foreground tracking-tight italic"
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
              className="flex items-center gap-1 mt-3 text-accent"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-sm font-bold">
                +{pointsPerSecond.toFixed(0)} pts/sec
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated particles when running */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: '100%',
                opacity: 0 
              }}
              animate={{ 
                y: '-100%',
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
