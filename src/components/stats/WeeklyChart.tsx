import { useMemo } from 'react';
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
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary font-bold">
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
        📊 {dataKey === 'distance' ? 'Distanza Giornaliera' : 'Score Giornaliero'}
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
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
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar 
              dataKey={dataKey} 
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
