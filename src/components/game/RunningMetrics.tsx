import { motion } from 'framer-motion';
import { Route, Gauge, Clock, Flame } from 'lucide-react';

interface RunningMetricsProps {
  distance: number;
  speed: number;
  pace: string;
  calories: number;
  isRunning?: boolean;
}

export function RunningMetrics({ 
  distance, 
  speed, 
  pace, 
  calories,
  isRunning = false 
}: RunningMetricsProps) {
  // Calculate flame intensity based on speed (0-15 km/h mapped to 0-1)
  const flameIntensity = Math.min(speed / 15, 1);
  const flameCount = Math.floor(4 + flameIntensity * 4); // 4-8 flames per card
  const animationSpeed = Math.max(0.5, 1.5 - flameIntensity);

  const metrics = [
    {
      icon: Route,
      label: 'Distanza',
      description: 'Km percorsi',
      value: distance.toFixed(2),
      unit: 'km',
    },
    {
      icon: Gauge,
      label: 'Velocità',
      description: 'Km ogni ora',
      value: speed.toFixed(1),
      unit: 'km/h',
    },
    {
      icon: Clock,
      label: 'Andatura',
      description: 'Tempo per 1 km',
      value: pace,
      unit: 'min/km',
    },
    {
      icon: Flame,
      label: 'Calorie',
      description: 'Energia bruciata',
      value: calories.toString(),
      unit: 'kcal',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: isRunning ? [1, 1.02, 1] : 1,
          }}
          transition={{ 
            delay: index * 0.1,
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          className="relative overflow-hidden rounded-xl p-4"
          style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 50%, #1b3a5f 100%)',
            boxShadow: isRunning 
              ? `0 0 ${20 + flameIntensity * 20}px rgba(0, 150, 255, ${0.4 + flameIntensity * 0.2}), inset 0 -${10 + flameIntensity * 10}px ${30 + flameIntensity * 20}px rgba(0, 150, 255, ${0.15 + flameIntensity * 0.15})`
              : '0 4px 15px rgba(0, 100, 200, 0.2), inset 0 -8px 25px rgba(0, 150, 255, 0.1)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg" />

          {/* Blue flame effect from bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
            style={{ height: `${60 + flameIntensity * 40}px` }}
          >
            {/* Base flame glow */}
            <motion.div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full"
              style={{
                height: `${40 + flameIntensity * 30}px`,
                background: `radial-gradient(ellipse at bottom, 
                  rgba(0, ${180 + flameIntensity * 75}, 255, ${0.5 + flameIntensity * 0.3}) 0%, 
                  rgba(0, 100, 200, ${0.2 + flameIntensity * 0.2}) 40%, 
                  transparent 70%)`,
                filter: `blur(${6 + flameIntensity * 3}px)`,
              }}
              animate={{ 
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.05 + flameIntensity * 0.05, 1],
              }}
              transition={{ duration: animationSpeed, repeat: Infinity }}
            />
            
            {/* White-hot core at high speed */}
            {flameIntensity > 0.5 && (
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: '50%',
                  height: `${20 + flameIntensity * 15}px`,
                  background: `radial-gradient(ellipse at bottom, 
                    rgba(255, 255, 255, ${flameIntensity * 0.4}) 0%, 
                    rgba(200, 240, 255, ${flameIntensity * 0.2}) 30%, 
                    transparent 60%)`,
                  filter: 'blur(4px)',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: animationSpeed * 0.5, repeat: Infinity }}
              />
            )}
            
            {/* Animated flame layers */}
            {[...Array(flameCount)].map((_, i) => {
              const xPos = (i / flameCount) * 100;
              const baseHeight = 25 + flameIntensity * 25;
              
              return (
                <motion.div
                  key={i}
                  className="absolute bottom-0"
                  style={{
                    left: `${xPos}%`,
                    width: `${12 + flameIntensity * 8}px`,
                    background: `linear-gradient(to top, 
                      rgba(${flameIntensity > 0.7 ? '255, 255, 255' : '0, 220, 255'}, ${0.8 + flameIntensity * 0.2}) 0%, 
                      rgba(0, ${200 + flameIntensity * 55}, 255, ${0.6 + flameIntensity * 0.2}) 20%, 
                      rgba(0, 150, 255, ${0.4 + flameIntensity * 0.2}) 50%, 
                      transparent 100%)`,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    filter: `blur(${1.5 + flameIntensity * 0.5}px)`,
                    transformOrigin: 'bottom center',
                  }}
                  animate={{
                    height: [
                      `${baseHeight}px`, 
                      `${baseHeight + 15 + flameIntensity * 10}px`, 
                      `${baseHeight - 5}px`, 
                      `${baseHeight + 10}px`, 
                      `${baseHeight}px`
                    ],
                    opacity: [0.6, 1, 0.5, 0.9, 0.6],
                    scaleX: [1, 1.2 + flameIntensity * 0.2, 0.8, 1.1, 1],
                  }}
                  transition={{
                    duration: animationSpeed + (i % 3) * 0.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
              );
            })}
          </div>

          {/* Icon badge */}
          <motion.div 
            className="relative z-10 w-10 h-10 rounded-lg flex items-center justify-center mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 200, 255, 0.3) 0%, rgba(0, 150, 255, 0.2) 100%)',
              boxShadow: '0 0 10px rgba(0, 200, 255, 0.3)',
            }}
            animate={isRunning ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 10px rgba(0, 200, 255, 0.3)',
                `0 0 ${15 + flameIntensity * 10}px rgba(0, 200, 255, ${0.5 + flameIntensity * 0.3})`,
                '0 0 10px rgba(0, 200, 255, 0.3)',
              ],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <metric.icon className="w-5 h-5 text-cyan-400" />
          </motion.div>
          
          {/* Value */}
          <div className="relative z-10 flex items-baseline gap-1.5 mb-1">
            <motion.span 
              className="font-sporty text-2xl font-bold italic"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #4facfe 50%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 6px rgba(0, 200, 255, 0.5))',
              }}
              animate={isRunning ? {
                filter: [
                  'drop-shadow(0 0 6px rgba(0, 200, 255, 0.5))',
                  `drop-shadow(0 0 ${10 + flameIntensity * 8}px rgba(0, 200, 255, ${0.7 + flameIntensity * 0.3}))`,
                  'drop-shadow(0 0 6px rgba(0, 200, 255, 0.5))',
                ],
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {metric.value}
            </motion.span>
            <span 
              className="font-mono text-sm"
              style={{ color: 'rgba(0, 212, 255, 0.9)' }}
            >
              {metric.unit}
            </span>
          </div>
          
          {/* Label and description */}
          <div className="relative z-10">
            <span 
              className="font-calligraphy text-lg"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {metric.label}
            </span>
            <p 
              className="text-xs mt-0.5"
              style={{ color: 'rgba(150, 200, 255, 0.7)' }}
            >
              {metric.description}
            </p>
          </div>

          {/* Live indicator */}
          <motion.div
            className="absolute top-3 right-3 w-2 h-2 rounded-full"
            style={{
              background: flameIntensity > 0.5 
                ? 'radial-gradient(circle, #ffffff 0%, #00f2fe 100%)'
                : 'radial-gradient(circle, #00f2fe 0%, #4facfe 100%)',
              boxShadow: `0 0 ${6 + flameIntensity * 4}px rgba(0, 200, 255, 0.8)`,
            }}
            animate={isRunning ? {
              opacity: [1, 0.4, 1],
              scale: [1, 0.8, 1],
            } : { opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating sparks */}
          {isRunning && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {[...Array(Math.floor(3 + flameIntensity * 4))].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${1 + flameIntensity * 0.5}px`,
                    height: `${1 + flameIntensity * 0.5}px`,
                    background: 'radial-gradient(circle, #00f2fe 0%, #4facfe 100%)',
                    boxShadow: '0 0 4px rgba(0, 200, 255, 0.8)',
                  }}
                  initial={{ 
                    x: `${10 + Math.random() * 80}%`, 
                    y: '100%',
                    opacity: 0,
                  }}
                  animate={{ 
                    y: '-20%',
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: Math.max(1, 1.5 - flameIntensity * 0.5),
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
