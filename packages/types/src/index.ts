export type UnitSystem = 'metric' | 'imperial';
export type MacroMode = 'g' | 'percent';
export type ActivityPreset = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type UnitDefault = 'g' | 'ml' | 'serving';

export interface Food {
  id?: number;
  userId?: string;
  name: string;
  brand?: string;
  unitDefault: UnitDefault;
  kcalPerUnit: number;
  proteinPerUnit: number;
  carbPerUnit: number;
  fatPerUnit: number;
  servingName?: string;
  servingGrams?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
  note?: string;
}

export interface Template {
  id?: number;
  name: string;
  items: Array<{ foodId: number; quantity: number }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Goals {
  id?: number;
  kcalTarget: number;
  macroMode: MacroMode;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  unitSystem: UnitSystem;
  activityPreset: ActivityPreset;
  dailySteps: number;
  weightTarget: number;
  pacePerWeek: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Weight {
  id?: number;
  date: string;
  weight: number;
  unit: 'kg' | 'lb';
}

export interface Settings {
  id?: number;
  theme: 'light' | 'dark' | 'system';
  accent: string;
  showProteinFirst: boolean;
  pwaTipsDismissed: boolean;
}

export interface SyncState {
  id?: number;
  enabled: boolean;
  provider: 'supabase' | null;
  lastSyncAt?: Date;
}
// Add this interface
export interface PreMadeTemplate {
  name: string;
  description: string;
  items: Array<{ foodName: string; quantity: number }>;
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}