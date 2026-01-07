import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface Run {
  id: string;
  date: string;
  distance: number;
  scoreEarned: number;
}

interface WeeklyChartProps {
  runs: Run[];
  dataKey: 'distance' | 'score';
}

export function WeeklyChart({ runs, dataKey }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];

      const dayRuns = runs.filter(r => r.date.split('T')[0] === dateStr);
      const totalDistance = dayRuns.reduce((sum, r) => sum + r.distance, 0);
      const totalScore = dayRuns.reduce((sum, r) => sum + r.scoreEarned, 0);

      data.push({
        day: dayName,
        distance: Number(totalDistance.toFixed(2)),
        score: totalScore,
        isToday: i === 0,
      });
    }

    return data;
  }, [runs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const unit = dataKey === 'distance' ? 'km' : 'pts';
      return (
        <div 
          className="rounded-lg px-3 py-2 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
            border: '2px solid #FCD34D',
          }}
        >
          <p className="text-sm font-medium text-amber-100">{label}</p>
          <p className="text-sm text-yellow-300 font-bold">
            {dataKey === 'distance' ? value.toFixed(2) : value.toLocaleString()} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
        border: '3px solid #FCD34D',
        boxShadow: '0 4px 0 0 #451A03, 0 0 25px rgba(252, 211, 77, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)',
      }}
    >
      {/* Wind Lines Animation */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: 40 + Math.random() * 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, rgba(253, 230, 138, 0.6) 50%, transparent 100%)',
            borderRadius: 2,
            top: `${15 + i * 10}%`,
          }}
          initial={{ 
            x: '-100%',
            opacity: 0,
          }}
          animate={{ 
            x: ['0%', '400%'],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Floating Dust Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            background: 'rgba(253, 230, 138, 0.7)',
            boxShadow: '0 0 6px rgba(253, 230, 138, 0.5)',
            top: `${20 + Math.random() * 60}%`,
          }}
          initial={{ 
            x: -20,
            opacity: 0,
          }}
          animate={{ 
            x: [0, 300],
            y: [0, -10, 10, -5, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Wind Icon */}
      <motion.div
        className="absolute right-3 top-3 text-2xl pointer-events-none"
        animate={{ 
          x: [0, 5, 0],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: 'drop-shadow(0 0 8px rgba(253, 230, 138, 0.6))'
        }}
      >
        💨
      </motion.div>
      
      <h4 
        className="font-varsity text-xl uppercase tracking-wide mb-4 relative z-10"
        style={{
          color: '#FEF3C7',
          textShadow: '2px 2px 0px #78350F',
        }}
      >
        📊 {dataKey === 'distance' ? 'Distanza Giornaliera' : 'Score Giornaliero'}
      </h4>
      <div className="h-48 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#FDE68A', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#FDE68A', fontSize: 10 }}
              tickFormatter={(value) => dataKey === 'distance' ? `${value}` : `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar 
              dataKey={dataKey} 
              radius={[8, 8, 4, 4]}
              maxBarSize={45}
              label={({ x, y, width, value }) => (
                <g>
                  <rect
                    x={x - 2}
                    y={y - 28}
                    width={width + 4}
                    height={22}
                    rx={6}
                    fill={value > 0 ? "url(#labelGradient)" : "transparent"}
                    stroke={value > 0 ? "#FCD34D" : "transparent"}
                    strokeWidth={1.5}
                    filter="url(#glow)"
                  />
                  <text
                    x={x + width / 2}
                    y={y - 13}
                    fill="#FEF3C7"
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="bold"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {value > 0 ? (dataKey === 'distance' ? `${value.toFixed(2)} km` : value.toLocaleString()) : ''}
                  </text>
                </g>
              )}
            >
              <defs>
                <linearGradient id="labelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#FCD34D' : '#F59E0B'}
                  stroke={entry.isToday ? '#FEF3C7' : '#FCD34D'}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
