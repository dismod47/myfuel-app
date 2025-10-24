import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: Array<{ date: string; kcal: number }>;
  targetKcal?: number;
}

export function TrendChart({ data, targetKcal }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="kcal" stroke="#3b82f6" name="Calories" />
        {targetKcal && (
          <Line
            type="monotone"
            dataKey={() => targetKcal}
            stroke="#10b981"
            strokeDasharray="5 5"
            name="Target"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
