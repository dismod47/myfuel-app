import { db } from '@/lib/db/db';
import type { Food } from '@myfuel/types';

interface ParsedItem {
  foodId: number;
  quantity: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
  raw: string;
}

export async function parseSmartText(input: string): Promise<ParsedItem[]> {
  const items = input.split(',').map(s => s.trim()).filter(Boolean);
  const allFoods = await db.foods.toArray();
  const results: ParsedItem[] = [];

  for (const item of items) {
    const match = item.match(/^(.+?)\s+([\d.]+)\s*(\w+)$/);
    if (!match) continue;

    const [, name, quantityStr, unit] = match;
    const quantity = parseFloat(quantityStr);

    const food = fuzzyMatchFood(name.trim(), allFoods);
    if (!food) continue;

    let multiplier = 1;

    if (food.unitDefault === 'serving') {
      multiplier = quantity;
    } else if (food.unitDefault === 'g' || food.unitDefault === 'ml') {
      multiplier = quantity / 100;
    }

    results.push({
      foodId: food.id!,
      quantity,
      kcal: food.kcalPerUnit * multiplier,
      p: food.proteinPerUnit * multiplier,
      c: food.carbPerUnit * multiplier,
      f: food.fatPerUnit * multiplier,
      raw: item,
    });
  }

  return results;
}

function fuzzyMatchFood(name: string, foods: Food[]): Food | null {
  const lowerName = name.toLowerCase();
  return foods.find(f => f.name.toLowerCase().includes(lowerName)) || null;
}
