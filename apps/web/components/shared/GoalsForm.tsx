'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Goals } from '@myfuel/types';
import toast from 'react-hot-toast';

interface Props {
  initialGoals: Goals | null;
  onSave: (goals: Goals) => void;
}

export function GoalsForm({ initialGoals, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Goals>>({
    kcalTarget: 2200,
    macroMode: 'g',
    proteinTarget: 165,
    carbTarget: 220,
    fatTarget: 73,
    unitSystem: 'metric',
    activityPreset: 'moderate',
    dailySteps: 8000,
    weightTarget: 75,
    pacePerWeek: -0.5,
  });

  useEffect(() => {
    if (initialGoals) {
      setFormData(initialGoals);
    }
  }, [initialGoals]);

  const handleSubmit = () => {
    const goalsData: Goals = {
      ...formData as Goals,
      createdAt: initialGoals?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSave(goalsData);
    toast.success('Goals updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Daily Calorie Target</label>
          <Input
            type="number"
            value={formData.kcalTarget}
            onChange={(e) => setFormData({ ...formData, kcalTarget: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Macro Mode</label>
          <select
            value={formData.macroMode}
            onChange={(e) => setFormData({ ...formData, macroMode: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="g">Grams</option>
            <option value="percent">Percent</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Protein Target (g)</label>
          <Input
            type="number"
            value={formData.proteinTarget}
            onChange={(e) => setFormData({ ...formData, proteinTarget: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Carb Target (g)</label>
          <Input
            type="number"
            value={formData.carbTarget}
            onChange={(e) => setFormData({ ...formData, carbTarget: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Fat Target (g)</label>
          <Input
            type="number"
            value={formData.fatTarget}
            onChange={(e) => setFormData({ ...formData, fatTarget: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Unit System</label>
          <select
            value={formData.unitSystem}
            onChange={(e) => setFormData({ ...formData, unitSystem: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, in)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Activity Level</label>
          <select
            value={formData.activityPreset}
            onChange={(e) => setFormData({ ...formData, activityPreset: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="athlete">Athlete</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Daily Steps</label>
          <Input
            type="number"
            value={formData.dailySteps}
            onChange={(e) => setFormData({ ...formData, dailySteps: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Weight Goal ({formData.unitSystem === 'metric' ? 'kg' : 'lb'})</label>
          <Input
            type="number"
            value={formData.weightTarget}
            onChange={(e) => setFormData({ ...formData, weightTarget: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Pace per Week ({formData.unitSystem === 'metric' ? 'kg' : 'lb'})</label>
          <Input
            type="number"
            step="0.1"
            value={formData.pacePerWeek}
            onChange={(e) => setFormData({ ...formData, pacePerWeek: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <Button onClick={handleSubmit} size="lg">Apply Targets</Button>
    </div>
  );
}