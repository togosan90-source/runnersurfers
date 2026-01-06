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
      label: 'Distanza',
      description: 'Km percorsi',
      value: distance.toFixed(2),
      unit: 'km',
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      icon: Gauge,
      label: 'Velocità',
      description: 'Km ogni ora',
      value: speed.toFixed(1),
      unit: 'km/h',
      gradient: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      icon: Clock,
      label: 'Andatura',
      description: 'Tempo per 1 km',
      value: pace,
      unit: 'min/km',
      gradient: 'from-warning/20 to-warning/5',
      iconBg: 'bg-warning/20',
      iconColor: 'text-warning',
    },
    {
      icon: Flame,
      label: 'Calorie',
      description: 'Energia bruciata',
      value: calories.toString(),
      unit: 'kcal',
      gradient: 'from-destructive/20 to-destructive/5',
      iconBg: 'bg-destructive/20',
      iconColor: 'text-destructive',
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
          className="relative overflow-hidden rounded-xl p-4 transition-shadow duration-300"
          style={{
            background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
            border: '3px solid white',
            boxShadow: '0 4px 0 0 #1E40AF, inset 0 1px 0 0 rgba(255,255,255,0.3)',
          }}
        >
          {/* Icon badge with pulse animation */}
          <motion.div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            animate={isRunning ? {
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <metric.icon className="w-6 h-6 text-white" />
          </motion.div>
          
          {/* Value with brush script style */}
          <div className="flex items-baseline gap-2 mb-2">
            <motion.span 
              className="font-brush text-3xl text-white"
              style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
              }}
              animate={isRunning ? {
                opacity: [1, 0.7, 1],
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {metric.value}
            </motion.span>
            <span className="font-brush text-lg text-white/90">
              {metric.unit}
            </span>
          </div>
          
          {/* Label and description with brush font */}
          <div>
            <span className="font-brush text-xl text-white">
              {metric.label}
            </span>
            <p className="font-brush text-base mt-0.5 text-white/80">
              {metric.description}
            </p>
          </div>

          {/* Live indicator dot */}
          <motion.div
            className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-white"
            animate={isRunning ? {
              opacity: [1, 0.4, 1],
              scale: [1, 0.8, 1],
            } : { opacity: 1 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
