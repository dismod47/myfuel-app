'use client';

import { useState, useEffect } from 'react';
import { Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/db/db';
import toast from 'react-hot-toast';

interface Workout {
  id?: number;
  date: string;
  exerciseName: string;
  type: 'cardio' | 'strength';
  duration?: number; // minutes
  caloriesBurned: number;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

interface Props {
  currentDate: string;
  onUpdate: () => void;
}

export function WorkoutTracker({ currentDate, onUpdate }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Workout>>({
    type: 'strength',
    exerciseName: '',
    caloriesBurned: 0,
  });

  useEffect(() => {
    loadWorkouts();
  }, [currentDate]);

  const loadWorkouts = async () => {
    // For now, use localStorage since we need to add workouts table to Dexie
    const stored = localStorage.getItem(`workouts_${currentDate}`);
    if (stored) {
      setWorkouts(JSON.parse(stored));
    } else {
      setWorkouts([]);
    }
  };

  const handleAdd = () => {
    if (!formData.exerciseName || !formData.caloriesBurned) {
      toast.error('Please fill in required fields');
      return;
    }

    const newWorkout: Workout = {
      id: Date.now(),
      date: currentDate,
      exerciseName: formData.exerciseName!,
      type: formData.type!,
      duration: formData.duration,
      caloriesBurned: formData.caloriesBurned!,
      sets: formData.sets,
      reps: formData.reps,
      weight: formData.weight,
      notes: formData.notes,
    };

    const updated = [...workouts, newWorkout];
    localStorage.setItem(`workouts_${currentDate}`, JSON.stringify(updated));
    setWorkouts(updated);
    setShowDialog(false);
    setFormData({ type: 'strength', exerciseName: '', caloriesBurned: 0 });
    toast.success('Workout added!');
    onUpdate();
  };

  const handleDelete = (id: number) => {
    const updated = workouts.filter(w => w.id !== id);
    localStorage.setItem(`workouts_${currentDate}`, JSON.stringify(updated));
    setWorkouts(updated);
    toast.success('Workout removed');
    onUpdate();
  };

  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Workout Summary</h2>
            <p className="text-muted-foreground">Total calories burned: {totalCaloriesBurned} kcal</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No workouts logged for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map(workout => (
              <Card key={workout.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{workout.exerciseName}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        workout.type === 'cardio' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {workout.type}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>🔥 {workout.caloriesBurned} kcal burned</p>
                      {workout.duration && <p>⏱️ {workout.duration} minutes</p>}
                      {workout.sets && workout.reps && (
                        <p>💪 {workout.sets} sets × {workout.reps} reps {workout.weight ? `@ ${workout.weight}lbs` : ''}</p>
                      )}
                      {workout.notes && <p className="italic">"{workout.notes}"</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(workout.id!)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Exercise Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md bg-background mt-1"
              >
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Exercise Name *</label>
              <Input
                value={formData.exerciseName}
                onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
                placeholder="e.g., Bench Press, Running, Squats"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Calories Burned *</label>
                <Input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {formData.type === 'strength' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Sets</label>
                  <Input
                    type="number"
                    value={formData.sets || ''}
                    onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reps</label>
                  <Input
                    type="number"
                    value={formData.reps || ''}
                    onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Weight (lbs)</label>
                  <Input
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="How did it feel?"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Add Workout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}