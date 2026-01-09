import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Zap, TrendingUp } from 'lucide-react';

interface ScoreCounterProps {
  score: number;
  pointsPerSecond?: number;
  isRunning?: boolean;
  speed?: number;
}

export function ScoreCounter({ score, pointsPerSecond = 0, isRunning = false, speed = 0 }: ScoreCounterProps) {
  const [prevScore, setPrevScore] = useState(score);
  const [showPop, setShowPop] = useState(false);
  
  const accentColor = '#00d4ff';
  const shadowColor = 'rgba(0, 212, 255, 0.5)';

  useEffect(() => {
    if (score > prevScore) {
      setShowPop(true);
      setTimeout(() => setShowPop(false), 300);
    }
    setPrevScore(score);
  }, [score, prevScore]);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%)',
        border: `1px solid ${accentColor}40`,
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
      }}
      animate={showPop ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${accentColor}10 50%, transparent 100%)`,
          height: '200%',
        }}
        animate={{ y: ['-100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner cuts decoration */}
      <div 
        className="absolute top-0 right-0 w-4 h-4"
        style={{ background: `linear-gradient(135deg, transparent 50%, ${accentColor}60 50%)` }}
      />
      <div 
        className="absolute bottom-0 left-0 w-4 h-4"
        style={{ background: `linear-gradient(-45deg, transparent 50%, ${accentColor}60 50%)` }}
      />

      {/* Glowing border lines */}
      <div 
        className="absolute top-0 left-0 right-4 h-px"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
      <div 
        className="absolute bottom-0 left-4 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
      />
      <div 
        className="absolute top-4 right-0 bottom-0 w-px"
        style={{ background: `linear-gradient(180deg, ${accentColor}, transparent)` }}
      />
      <div 
        className="absolute top-0 left-0 bottom-4 w-px"
        style={{ background: `linear-gradient(180deg, transparent, ${accentColor})` }}
      />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 flex items-center justify-center"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}50`,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              <Zap 
                className="w-5 h-5" 
                style={{ 
                  color: accentColor,
                  filter: `drop-shadow(0 0 4px ${shadowColor})`,
                }} 
              />
            </div>
            <span 
              className="text-xs font-mono font-bold tracking-[0.2em]"
              style={{ 
                color: accentColor,
                textShadow: `0 0 10px ${shadowColor}`,
              }}
            >
              SCORE
            </span>
          </div>
          
          {/* Status LED */}
          <motion.div
            className="w-3 h-3"
            style={{
              background: accentColor,
              boxShadow: `0 0 8px ${shadowColor}, 0 0 16px ${shadowColor}`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            animate={{ opacity: isRunning ? [0.5, 1, 0.5] : 0.3 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Score value */}
        <div 
          className="font-mono text-5xl md:text-6xl font-bold tracking-tight"
          style={{
            color: accentColor,
            textShadow: `0 0 20px ${shadowColor}, 0 0 40px ${shadowColor}`,
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

        {/* Data bar visualization */}
        <div className="mt-4 h-1.5 w-full overflow-hidden" style={{ background: `${accentColor}20` }}>
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }}
            initial={{ width: '0%' }}
            animate={{ width: isRunning ? '100%' : '30%' }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0, repeatType: 'reverse' }}
          />
        </div>

        <AnimatePresence>
          {isRunning && pointsPerSecond > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mt-3"
            >
              <TrendingUp 
                className="w-4 h-4" 
                style={{ 
                  color: '#00ff88',
                  filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.5))',
                }} 
              />
              <span 
                className="font-mono text-sm font-bold"
                style={{
                  color: '#00ff88',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                }}
              >
                +{pointsPerSecond.toFixed(0)} PTS/SEC
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hex pattern decoration */}
        <div className="absolute bottom-2 right-3 flex gap-1 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2"
              style={{
                background: accentColor,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                opacity: 1 - i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
