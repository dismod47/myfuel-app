'use client';

import { useState, useEffect } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db/db';
import { SmartTextInput } from '@/components/shared/SmartTextInput';
import { MacroBars } from '@/components/shared/MacroBars';
import { MealSection } from '@/components/shared/MealSection';
import { ProteinFirstChip } from '@/components/shared/ProteinFirstChip';
import { TemplateQuickAdd } from '@/components/shared/TemplateQuickAdd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutTracker } from '@/components/shared/WorkoutTracker';
import toast from 'react-hot-toast';
import type { Log, Goals } from '@myfuel/types';

export default function TodayPage() {
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logs, setLogs] = useState<Log[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentDate, refreshKey]);

  const loadData = async () => {
    const todayLogs = await db.logs.where('date').equals(currentDate).toArray();
    const currentGoals = await db.goals.toCollection().last();
    setLogs(todayLogs);
    setGoals(currentGoals || null);
  };

  const handlePreviousDay = () => {
    const newDate = subDays(parseISO(currentDate), 1);
    setCurrentDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const newDate = addDays(parseISO(currentDate), 1);
    setCurrentDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
  };

  const totals = logs.reduce(
    (acc, log) => ({
      kcal: acc.kcal + log.kcal,
      p: acc.p + log.p,
      c: acc.c + log.c,
      f: acc.f + log.f,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Today</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handlePreviousDay}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div 
              className="relative cursor-pointer border rounded-md hover:bg-accent transition-colors"
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                input?.showPicker?.();
              }}
            >
              <input
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                className="px-4 py-2 bg-transparent cursor-pointer min-w-[180px] outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <Button 
              variant="outline" 
              size="icon"
              onClick={handleNextDay}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl font-semibold">
            {format(parseISO(currentDate), 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        <MacroBars
          eaten={{ kcal: totals.kcal, p: totals.p, c: totals.c, f: totals.f }}
          target={goals || undefined}
        />

        {goals && <ProteinFirstChip eaten={totals.p} target={goals.proteinTarget} />}
      </Card>

      <Tabs defaultValue="diet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diet">Diet</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diet" className="space-y-4 mt-6">
          <TemplateQuickAdd currentDate={currentDate} onApplied={() => setRefreshKey(k => k + 1)} />
          <SmartTextInput currentDate={currentDate} onAdded={() => setRefreshKey(k => k + 1)} />

          <div className="space-y-4">
            {mealTypes.map(meal => (
              <MealSection
                key={meal}
                meal={meal}
                date={currentDate}
                logs={logs.filter(l => l.meal === meal)}
                onUpdate={() => setRefreshKey(k => k + 1)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="fitness" className="mt-6">
          <WorkoutTracker currentDate={currentDate} onUpdate={() => setRefreshKey(k => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}