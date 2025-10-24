import { db } from '@/lib/db/db';
import Papa from 'papaparse';

export async function exportFullJSON(): Promise<string> {
  const data = {
    foods: await db.foods.toArray(),
    logs: await db.logs.toArray(),
    templates: await db.templates.toArray(),
    goals: await db.goals.toArray(),
    weights: await db.weights.toArray(),
    settings: await db.settings.toArray(),
  };

  return JSON.stringify(data, null, 2);
}

export async function importFullJSON(jsonStr: string, mode: 'merge' | 'overwrite'): Promise<void> {
  const data = JSON.parse(jsonStr);

  if (mode === 'overwrite') {
    await db.foods.clear();
    await db.logs.clear();
    await db.templates.clear();
    await db.goals.clear();
    await db.weights.clear();
    await db.settings.clear();
  }

  if (data.foods) await db.foods.bulkAdd(data.foods);
  if (data.logs) await db.logs.bulkAdd(data.logs);
  if (data.templates) await db.templates.bulkAdd(data.templates);
  if (data.goals) await db.goals.bulkAdd(data.goals);
  if (data.weights) await db.weights.bulkAdd(data.weights);
  if (data.settings) await db.settings.bulkAdd(data.settings);
}

export async function exportFoodsCSV(): Promise<string> {
  const foods = await db.foods.toArray();
  const csv = Papa.unparse(foods.map(f => ({
    name: f.name,
    brand: f.brand || '',
    unitDefault: f.unitDefault,
    servingName: f.servingName || '',
    servingGrams: f.servingGrams || '',
    kcalPer100g: f.kcalPerUnit,
    proteinPer100g: f.proteinPerUnit,
    carbsPer100g: f.carbPerUnit,
    fatPer100g: f.fatPerUnit,
  })));

  return csv;
}

export async function importFoodsCSV(csvStr: string): Promise<void> {
  const parsed = Papa.parse(csvStr, { header: true });
  const foods = parsed.data.map((row: any) => ({
    name: row.name,
    brand: row.brand || undefined,
    unitDefault: row.unitDefault || 'g',
    servingName: row.servingName || undefined,
    servingGrams: row.servingGrams ? parseFloat(row.servingGrams) : undefined,
    kcalPerUnit: parseFloat(row.kcalPer100g),
    proteinPerUnit: parseFloat(row.proteinPer100g),
    carbPerUnit: parseFloat(row.carbsPer100g),
    fatPerUnit: parseFloat(row.fatPer100g),
  }));

  await db.foods.bulkAdd(foods);
}
