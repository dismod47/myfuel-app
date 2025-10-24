import Dexie, { Table } from 'dexie';
import type { Food, Log, Template, Goals, Weight, Settings, SyncState } from '@myfuel/types';

class MyFuelDatabase extends Dexie {
  foods!: Table<Food, number>;
  logs!: Table<Log, number>;
  templates!: Table<Template, number>;
  goals!: Table<Goals, number>;
  weights!: Table<Weight, number>;
  settings!: Table<Settings, number>;
  sync_state!: Table<SyncState, number>;

  constructor() {
    super('myfuel');
    this.version(1).stores({
      foods: '++id, name, brand, unitDefault',
      logs: '++id, date, meal, foodId',
      templates: '++id, name',
      goals: '++id, createdAt',
      weights: '++id, date',
      settings: '++id',
      sync_state: '++id',
    });
  }
}

export const db = new MyFuelDatabase();

export async function seedDemoData() {
  const foodCount = await db.foods.count();
  if (foodCount > 0) return;

  // Load comprehensive food database from static file
  try {
    const response = await fetch('/lib/data/usda_foods.json');
    const usdaFoods = await response.json();
    
    const foodsToImport = usdaFoods.map((f: any) => ({
      ...f,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.foods.bulkAdd(foodsToImport);
    console.log(`Imported ${foodsToImport.length} foods from USDA database`);
  } catch (error) {
    console.error('Failed to load food database, using basic demo foods:', error);
    
    // Fallback to basic demo foods if file loading fails
    const demoFoods: Food[] = [
      { name: 'Oats', brand: 'Generic', unitDefault: 'g', kcalPerUnit: 389, proteinPerUnit: 16.9, carbPerUnit: 66.3, fatPerUnit: 6.9 },
      { name: 'Whey Protein', brand: 'Optimum Nutrition', unitDefault: 'serving', servingName: 'scoop', servingGrams: 30, kcalPerUnit: 120, proteinPerUnit: 24, carbPerUnit: 3, fatPerUnit: 1 },
      { name: 'Milk', brand: 'Generic', unitDefault: 'ml', kcalPerUnit: 0.42, proteinPerUnit: 0.033, carbPerUnit: 0.048, fatPerUnit: 0.01 },
      { name: 'Chicken Breast', brand: 'Generic', unitDefault: 'g', kcalPerUnit: 165, proteinPerUnit: 31, carbPerUnit: 0, fatPerUnit: 3.6 },
      { name: 'Olive Oil', brand: 'Generic', unitDefault: 'serving', servingName: 'tbsp', servingGrams: 14, kcalPerUnit: 119, proteinPerUnit: 0, carbPerUnit: 0, fatPerUnit: 13.5 },
      { name: 'Eggs', brand: 'Generic', unitDefault: 'serving', servingName: 'egg', servingGrams: 50, kcalPerUnit: 72, proteinPerUnit: 6.3, carbPerUnit: 0.4, fatPerUnit: 4.8 },
    ];

    await db.foods.bulkAdd(demoFoods);
  }

  const defaultGoals: Goals = {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.goals.add(defaultGoals);

  const today = new Date();
  const demoLogs: Log[] = [];
  const demoWeights: Weight[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    demoLogs.push(
      { date: dateStr, meal: 'breakfast', foodId: 1, quantity: 60, kcal: 233, p: 10.1, c: 39.8, f: 4.1 },
      { date: dateStr, meal: 'breakfast', foodId: 2, quantity: 1, kcal: 120, p: 24, c: 3, f: 1 },
      { date: dateStr, meal: 'lunch', foodId: 4, quantity: 180, kcal: 297, p: 55.8, c: 0, f: 6.5 },
      { date: dateStr, meal: 'dinner', foodId: 4, quantity: 150, kcal: 247, p: 46.5, c: 0, f: 5.4 }
    );

    demoWeights.push({ date: dateStr, weight: 80 - i * 0.2, unit: 'kg' });
  }

  await db.logs.bulkAdd(demoLogs);
  await db.weights.bulkAdd(demoWeights);

  const defaultSettings: Settings = {
    theme: 'system',
    accent: '#3b82f6',
    showProteinFirst: true,
    pwaTipsDismissed: false,
  };

  await db.settings.add(defaultSettings);
}

if (typeof window !== 'undefined') {
  db.open().then(seedDemoData);
}
