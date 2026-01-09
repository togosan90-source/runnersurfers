import { Route, Gauge, Clock, Flame, Zap } from 'lucide-react';

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
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgGradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
      iconBg: 'bg-emerald-500/30',
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      borderColor: 'border-emerald-500/40',
    },
    {
      icon: Gauge,
      label: 'Velocità',
      description: 'Km ogni ora',
      value: speed.toFixed(1),
      unit: 'km/h',
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      bgGradient: 'from-blue-500/20 via-indigo-500/15 to-purple-500/10',
      iconBg: 'bg-blue-500/30',
      iconColor: 'text-blue-400',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      borderColor: 'border-blue-500/40',
    },
    {
      icon: Clock,
      label: 'Andatura',
      description: 'Tempo per 1 km',
      value: pace,
      unit: 'min/km',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      bgGradient: 'from-amber-500/20 via-orange-500/15 to-red-500/10',
      iconBg: 'bg-amber-500/30',
      iconColor: 'text-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      borderColor: 'border-amber-500/40',
    },
    {
      icon: Flame,
      label: 'Calorie',
      description: 'Energia bruciata',
      value: calories.toString(),
      unit: 'kcal',
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      bgGradient: 'from-rose-500/20 via-pink-500/15 to-fuchsia-500/10',
      iconBg: 'bg-rose-500/30',
      iconColor: 'text-rose-400',
      glowColor: 'rgba(244, 63, 94, 0.4)',
      borderColor: 'border-rose-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`relative overflow-hidden rounded-xl p-4 border ${metric.borderColor} bg-gradient-to-br ${metric.bgGradient} backdrop-blur-sm`}
          style={{
            boxShadow: `0 4px 20px ${metric.glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          {/* Decorative corner accents */}
          <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${metric.borderColor} rounded-tl-xl opacity-60`} />
          <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${metric.borderColor} rounded-br-xl opacity-60`} />
          
          {/* Gradient overlay stripe */}
          <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l ${metric.bgGradient} opacity-50`} />
          
          {/* Icon badge */}
          <div 
            className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${metric.iconBg} border border-white/10`}
            style={{
              boxShadow: `0 0 15px ${metric.glowColor}`,
            }}
          >
            <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
          </div>
          
          {/* Value */}
          <div className="relative z-10 flex items-baseline gap-1.5 mb-1">
            <span 
              className={`font-sporty text-2xl font-bold italic bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}
              style={{
                filter: `drop-shadow(0 0 8px ${metric.glowColor})`,
              }}
            >
              {metric.value}
            </span>
            <span className={`font-mono text-sm ${metric.iconColor}`}>
              {metric.unit}
            </span>
          </div>
          
          {/* Label and description */}
          <div className="relative z-10">
            <span className={`font-semibold text-sm bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
              {metric.label}
            </span>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              {metric.description}
            </p>
          </div>

          {/* Status indicator */}
          <div 
            className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-r ${metric.gradient}`}
            style={{
              boxShadow: `0 0 8px ${metric.glowColor}`,
            }}
          />
          
          {/* Decorative sparkle dots */}
          <div className="absolute bottom-2 left-1/2 flex gap-1">
            <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${metric.gradient} opacity-60`} />
            <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${metric.gradient} opacity-40`} />
            <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${metric.gradient} opacity-20`} />
          </div>
        </div>
      ))}
    </div>
  );
}
