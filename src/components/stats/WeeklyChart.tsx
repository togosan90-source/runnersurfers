import { useMemo, memo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

export const WeeklyChart = memo(function WeeklyChart({ runs, dataKey }: WeeklyChartProps) {
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

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
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
  }, [dataKey]);

  return (
    <div 
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
        border: '3px solid #FCD34D',
        boxShadow: '0 4px 0 0 #451A03, 0 0 25px rgba(252, 211, 77, 0.3)',
      }}
    >
      {/* Static wind icon */}
      <div
        className="absolute right-3 top-3 text-2xl pointer-events-none opacity-80"
        style={{ filter: 'drop-shadow(0 0 8px rgba(253, 230, 138, 0.6))' }}
      >
        💨
      </div>
      
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
});
