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
  const metrics = [
    {
      icon: Route,
      label: 'DISTANZA',
      value: distance.toFixed(2),
      unit: 'KM',
      color: '#00ff88',
      shadowColor: 'rgba(0, 255, 136, 0.5)',
    },
    {
      icon: Gauge,
      label: 'VELOCITÀ',
      value: speed.toFixed(1),
      unit: 'KM/H',
      color: '#00d4ff',
      shadowColor: 'rgba(0, 212, 255, 0.5)',
    },
    {
      icon: Clock,
      label: 'PASSO',
      value: pace,
      unit: '/KM',
      color: '#ff00ff',
      shadowColor: 'rgba(255, 0, 255, 0.5)',
    },
    {
      icon: Flame,
      label: 'CALORIE',
      value: calories.toString(),
      unit: 'KCAL',
      color: '#ff3366',
      shadowColor: 'rgba(255, 51, 102, 0.5)',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%)',
            border: `1px solid ${metric.color}40`,
            borderRadius: '4px',
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          }}
        >
          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${metric.color}10 50%, transparent 100%)`,
              height: '200%',
            }}
            animate={{ y: ['-100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner cuts decoration */}
          <div 
            className="absolute top-0 right-0 w-3 h-3"
            style={{
              background: `linear-gradient(135deg, transparent 50%, ${metric.color}60 50%)`,
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-3 h-3"
            style={{
              background: `linear-gradient(-45deg, transparent 50%, ${metric.color}60 50%)`,
            }}
          />

          {/* Glowing border lines */}
          <div 
            className="absolute top-0 left-0 right-3 h-px"
            style={{ background: `linear-gradient(90deg, ${metric.color}, transparent)` }}
          />
          <div 
            className="absolute bottom-0 left-3 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${metric.color})` }}
          />
          <div 
            className="absolute top-3 right-0 bottom-0 w-px"
            style={{ background: `linear-gradient(180deg, ${metric.color}, transparent)` }}
          />
          <div 
            className="absolute top-0 left-0 bottom-3 w-px"
            style={{ background: `linear-gradient(180deg, transparent, ${metric.color})` }}
          />

          <div className="relative z-10 p-4">
            {/* Header with icon */}
            <div className="flex items-center justify-between mb-2">
              <div 
                className="flex items-center gap-2"
              >
                <div 
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    background: `${metric.color}15`,
                    border: `1px solid ${metric.color}50`,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                >
                  <metric.icon 
                    className="w-4 h-4" 
                    style={{ 
                      color: metric.color,
                      filter: `drop-shadow(0 0 4px ${metric.shadowColor})`,
                    }} 
                  />
                </div>
                <span 
                  className="text-[10px] font-mono font-bold tracking-[0.2em]"
                  style={{ 
                    color: metric.color,
                    textShadow: `0 0 10px ${metric.shadowColor}`,
                  }}
                >
                  {metric.label}
                </span>
              </div>
              
              {/* Status LED */}
              <motion.div
                className="w-2 h-2"
                style={{
                  background: metric.color,
                  boxShadow: `0 0 8px ${metric.shadowColor}, 0 0 16px ${metric.shadowColor}`,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
                animate={{ opacity: isRunning ? [0.5, 1, 0.5] : 0.3 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>

            {/* Value display */}
            <div className="flex items-baseline gap-1">
              <span 
                className="font-mono text-3xl font-bold tracking-tight"
                style={{
                  color: metric.color,
                  textShadow: `0 0 20px ${metric.shadowColor}, 0 0 40px ${metric.shadowColor}`,
                }}
              >
                {metric.value}
              </span>
              <span 
                className="font-mono text-xs font-medium opacity-70"
                style={{ color: metric.color }}
              >
                {metric.unit}
              </span>
            </div>

            {/* Data bar visualization */}
            <div className="mt-2 h-1 w-full overflow-hidden" style={{ background: `${metric.color}20` }}>
              <motion.div
                className="h-full"
                style={{ background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)` }}
                initial={{ width: '0%' }}
                animate={{ width: isRunning ? '100%' : '30%' }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0, repeatType: 'reverse' }}
              />
            </div>

            {/* Hex pattern decoration */}
            <div className="absolute bottom-1 right-2 flex gap-0.5 opacity-30">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5"
                  style={{
                    background: metric.color,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    opacity: 1 - i * 0.25,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
