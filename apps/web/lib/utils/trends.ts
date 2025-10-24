import type { Log, Weight, Goals } from '@myfuel/types';
import { format, addDays, differenceInDays } from 'date-fns';

interface DailyTotal {
  date: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export function calculateRollingAverages(logs: Log[], windowDays: number): DailyTotal[] {
  const dailyTotals = new Map<string, DailyTotal>();

  logs.forEach(log => {
    const existing = dailyTotals.get(log.date) || { date: log.date, kcal: 0, p: 0, c: 0, f: 0 };
    existing.kcal += log.kcal;
    existing.p += log.p;
    existing.c += log.c;
    existing.f += log.f;
    dailyTotals.set(log.date, existing);
  });

  return Array.from(dailyTotals.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function estimateDateToGoal(
  weights: Weight[],
  goals: Goals,
  rollingData: DailyTotal[]
): string | null {
  if (weights.length < 2 || rollingData.length < 7) return null;

  const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = sortedWeights[sortedWeights.length - 1];
  const weekAgoWeight = sortedWeights[Math.max(0, sortedWeights.length - 8)];

  const weightDiff = latestWeight.weight - weekAgoWeight.weight;
  const daysDiff = differenceInDays(new Date(latestWeight.date), new Date(weekAgoWeight.date));

  if (daysDiff === 0) return null;

  const weeklyRate = (weightDiff / daysDiff) * 7;
  const remainingWeight = Math.abs(goals.weightTarget - latestWeight.weight);

  if (Math.abs(weeklyRate) < 0.01) return null;

  const weeksToGoal = remainingWeight / Math.abs(weeklyRate);
  const daysToGoal = Math.round(weeksToGoal * 7);

  const goalDate = addDays(new Date(latestWeight.date), daysToGoal);
  return format(goalDate, 'MMMM d, yyyy');
}

export function calculateWeeklySafetyFlag(weights: Weight[]): { show: boolean; message: string } | null {
  if (weights.length < 2) return null;

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const weekAgo = sorted[Math.max(0, sorted.length - 8)];

  const percentChange = Math.abs((latest.weight - weekAgo.weight) / weekAgo.weight) * 100;

  if (percentChange > 1) {
    return {
      show: true,
      message: `Warning: Your weight changed by ${percentChange.toFixed(1)}% this week. Consider adjusting your pace.`,
    };
  }

  return null;
}
