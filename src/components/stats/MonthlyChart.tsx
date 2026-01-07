import { useMemo, memo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Run {
  id: string;
  date: string;
  distance: number;
  scoreEarned: number;
}

interface MonthlyChartProps {
  runs: Run[];
  dataKey: 'distance' | 'score';
}

export const MonthlyChart = memo(function MonthlyChart({ runs, dataKey }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];

    // Group by week
    for (let week = 4; week >= 0; week--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (week * 7 + 6));
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (week * 7));

      const weekRuns = runs.filter(r => {
        const runDate = new Date(r.date);
        return runDate >= weekStart && runDate <= weekEnd;
      });

      const totalDistance = weekRuns.reduce((sum, r) => sum + r.distance, 0);
      const totalScore = weekRuns.reduce((sum, r) => sum + r.scoreEarned, 0);

      data.push({
        week: `Sett ${5 - week}`,
        distance: Number(totalDistance.toFixed(2)),
        score: totalScore,
      });
    }

    return data;
  }, [runs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const unit = dataKey === 'distance' ? 'km' : 'pts';
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-accent font-bold">
            {dataKey === 'distance' ? value.toFixed(2) : value.toLocaleString()} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h4 className="font-bold mb-4">
        📊 {dataKey === 'distance' ? 'Distanza Settimanale' : 'Score Settimanale'}
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value) => dataKey === 'distance' ? `${value}` : `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
