import { Card } from '@/components/ui/card';
import type { Goals } from '@myfuel/types';

interface Props {
  eaten: { kcal: number; p: number; c: number; f: number };
  target?: Goals;
}

export function MacroBars({ eaten, target }: Props) {
  const kcalTarget = target?.kcalTarget || 2000;
  const pTarget = target?.proteinTarget || 150;
  const cTarget = target?.carbTarget || 200;
  const fTarget = target?.fatTarget || 67;

  const kcalPercent = Math.min((eaten.kcal / kcalTarget) * 100, 100);
  const pPercent = Math.min((eaten.p / pTarget) * 100, 100);
  const cPercent = Math.min((eaten.c / cTarget) * 100, 100);
  const fPercent = Math.min((eaten.f / fTarget) * 100, 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Calories</span>
          <span className="text-sm text-muted-foreground">
            {eaten.kcal.toFixed(0)} / {kcalTarget} kcal
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${kcalPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Protein</span>
            <span className="text-xs text-muted-foreground">
              {eaten.p.toFixed(0)}g / {pTarget}g
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${pPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Carbs</span>
            <span className="text-xs text-muted-foreground">
              {eaten.c.toFixed(0)}g / {cTarget}g
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${cPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Fat</span>
            <span className="text-xs text-muted-foreground">
              {eaten.f.toFixed(0)}g / {fTarget}g
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${fPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
