import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { db } from '@/lib/db/db';
import type { Log } from '@myfuel/types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  meal: string;
  date: string;
  logs: Log[];
  onUpdate: () => void;
}

export function MealSection({ meal, date, logs, onUpdate }: Props) {
  const [foodNames, setFoodNames] = useState<Record<number, string>>({});

  useEffect(() => {
    loadFoodNames();
  }, [logs]);

  const loadFoodNames = async () => {
    const names: Record<number, string> = {};
    for (const log of logs) {
      const food = await db.foods.get(log.foodId);
      if (food) names[log.foodId] = food.name;
    }
    setFoodNames(names);
  };

  const handleDelete = async (logId: number) => {
    await db.logs.delete(logId);
    toast.success('Item removed');
    onUpdate();
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

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold capitalize">{meal}</h3>
        <span className="text-sm text-muted-foreground">
          {totals.kcal.toFixed(0)} kcal
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet</p>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="flex items-center justify-between py-2 border-t">
              <div>
                <p className="font-medium">{foodNames[log.foodId] || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {log.quantity}g • {log.kcal.toFixed(0)} kcal • P: {log.p.toFixed(0)}g C: {log.c.toFixed(0)}g F: {log.f.toFixed(0)}g
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(log.id!)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
