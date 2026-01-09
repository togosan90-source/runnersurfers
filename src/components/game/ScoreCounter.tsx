import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ScoreCounterProps {
  score: number;
  pointsPerSecond?: number;
  isRunning?: boolean;
  speed?: number;
}

export function ScoreCounter({ score, pointsPerSecond = 0, isRunning = false, speed = 0 }: ScoreCounterProps) {
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
          ? '0 0 40px rgba(0, 150, 255, 0.5), 0 0 80px rgba(0, 100, 200, 0.3)'
          : '0 4px 20px rgba(0, 100, 200, 0.3)',
      }}
      animate={showPop ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg" />

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
    </motion.div>
  );
}
