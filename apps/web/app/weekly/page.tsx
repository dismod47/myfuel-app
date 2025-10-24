'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db/db';
import { Card } from '@/components/ui/card';
import { TrendChart } from '@/components/shared/TrendChart';
import { WeightChart } from '@/components/shared/WeightChart';
import { SafetyFlagBanner } from '@/components/shared/SafetyFlagBanner';
import { calculateRollingAverages, estimateDateToGoal } from '@/lib/utils/trends';
import type { Log, Weight, Goals } from '@myfuel/types';
import { subDays, format } from 'date-fns';

export default function WeeklyPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const recentLogs = await db.logs
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();

    const recentWeights = await db.weights
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();

    const currentGoals = await db.goals.toCollection().last();

    setLogs(recentLogs);
    setWeights(recentWeights);
    setGoals(currentGoals || null);
  };

  const rollingData = calculateRollingAverages(logs, 7);
  const dateToGoal = goals && weights.length > 0
    ? estimateDateToGoal(weights, goals, rollingData)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Weekly Trends</h1>

      <SafetyFlagBanner weights={weights} />

      {dateToGoal && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Goal Estimate</h2>
          <p className="text-muted-foreground">
            At your current pace, you should reach your goal weight around{' '}
            <span className="font-semibold text-foreground">{dateToGoal}</span>
          </p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Calorie Trends</h2>
        <TrendChart data={rollingData} targetKcal={goals?.kcalTarget} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Weight Progress</h2>
        <WeightChart weights={weights} targetWeight={goals?.weightTarget} />
      </Card>
    </div>
  );
}
