'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GoalsForm } from '@/components/shared/GoalsForm';
import { ImportExportButtons } from '@/components/shared/ImportExportButtons';
import type { Goals } from '@myfuel/types';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goals | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const currentGoals = await db.goals.toCollection().last();
    setGoals(currentGoals || null);
  };

  const handleSave = async (newGoals: Goals) => {
    try {
      // Clear old goals and add new one
      await db.goals.clear();
      await db.goals.add(newGoals);
      loadGoals();
    } catch (error) {
      toast.error('Failed to save goals');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals & Activity</h1>
        <ImportExportButtons type="full" onImport={loadGoals} />
      </div>

      <Card className="p-6">
        <GoalsForm initialGoals={goals} onSave={handleSave} />
      </Card>
    </div>
  );
}