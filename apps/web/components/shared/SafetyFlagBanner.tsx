import { AlertTriangle } from 'lucide-react';
import { calculateWeeklySafetyFlag } from '@/lib/utils/trends';
import type { Weight } from '@myfuel/types';

interface Props {
  weights: Weight[];
}

export function SafetyFlagBanner({ weights }: Props) {
  const flag = calculateWeeklySafetyFlag(weights);

  if (!flag?.show) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-800 dark:text-yellow-200">{flag.message}</p>
    </div>
  );
}
