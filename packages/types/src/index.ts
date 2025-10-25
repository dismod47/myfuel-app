export interface Food {
  id?: number;
  name: string;
  brand: string | null;
  unitDefault: 'g' | 'ml' | 'serving';
  servingName: string | null;
  servingGrams: number | null;
  kcalPerUnit: number;
  proteinPerUnit: number;
  carbPerUnit: number;
  fatPerUnit: number;
  usdaFdcId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Log {
  id?: number;
  date: string;
  meal: string;
  foodId: number;
  quantity: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface Goals {
  id?: number;
  kcalTarget: number;
  macroMode: 'g' | 'percent';
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  unitSystem: 'metric' | 'imperial';
  activityPreset: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  dailySteps: number;
  weightTarget: number;
  pacePerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id?: number;
  name: string;
  items: Array<{ foodId: number; quantity: number }>;
  createdAt: Date;
}
