import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Weight } from '@myfuel/types';

interface Props {
  weights: Weight[];
  targetWeight?: number;
}

export function WeightChart({ weights, targetWeight }: Props) {
  const data = weights.map(w => ({
    date: w.date,
    weight: w.weight,
    target: targetWeight,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="Weight" />
        {targetWeight && (
          <Line
            type="monotone"
            dataKey="target"
            stroke="#10b981"
            strokeDasharray="5 5"
            name="Goal"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
