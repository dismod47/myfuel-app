import type { ActivityPreset } from '@myfuel/types';

const ACTIVITY_FACTORS: Record<ActivityPreset, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  sex: 'male' | 'female',
  activityPreset: ActivityPreset,
  dailySteps: number
): number {
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTORS[activityPreset];
  const stepsBonus = dailySteps * 0.04;

  return Math.round(tdee + stepsBonus);
}

export function convertMacrosGToPercent(
  protein: number,
  carbs: number,
  fat: number,
  totalKcal: number
): { p: number; c: number; f: number } {
  const pKcal = protein * 4;
  const cKcal = carbs * 4;
  const fKcal = fat * 9;
  const total = pKcal + cKcal + fKcal;

  return {
    p: Math.round((pKcal / total) * 100),
    c: Math.round((cKcal / total) * 100),
    f: Math.round((fKcal / total) * 100),
  };
}

export function convertMacrosPercentToG(
  pPercent: number,
  cPercent: number,
  fPercent: number,
  totalKcal: number
): { p: number; c: number; f: number } {
  return {
    p: Math.round((totalKcal * (pPercent / 100)) / 4),
    c: Math.round((totalKcal * (cPercent / 100)) / 4),
    f: Math.round((totalKcal * (fPercent / 100)) / 9),
  };
}
