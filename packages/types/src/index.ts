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

/**
 * Settings used by apps/web (Settings page).
 * All fields optional so this is non-breaking.
 */
export interface Settings {
  theme?: 'system' | 'light' | 'dark';
  units?: 'imperial' | 'metric';
  accentColor?: string;
  proteinFirst?: boolean;
  // add any others used in your UI as optional:
  pwaInstalled?: boolean;
}

/**
 * Weight log entry used by apps/web (weekly page, charts).
 * Keep fields permissive to avoid breaking callers.
 */
export interface Weight {
  /** ISO date string: 'yyyy-MM-dd' */
  date: string;
  /** main numeric weight value; some code may reference 'weight' or 'value' */
  weight?: number;
  value?: number;
  /** optional id if persisted in IndexedDB/DB */
  id?: number | string;
}
