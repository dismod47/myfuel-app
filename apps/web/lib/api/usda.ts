const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;

export interface USDANutrient {
  nutrientId: number;
  value: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: USDANutrient[];
}

export async function searchUSDA(query: string) {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=15`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.foods || [];
  } catch (err) {
    console.error('USDA API error:', err);
    return [];
  }
}

export function convertUSDAFood(usda: USDAFood) {
  const nutrients = usda.foodNutrients || [];
  const getValue = (id: number) => {
    const n = nutrients.find(x => x.nutrientId === id);
    return n ? n.value : 0;
  };

  return {
    name: usda.description,
    brand: usda.brandOwner || 'USDA',
    unitDefault: 'g' as const,
    servingName: null,
    servingGrams: null,
    kcalPerUnit: getValue(1008),
    proteinPerUnit: getValue(1003),
    carbPerUnit: getValue(1005),
    fatPerUnit: getValue(1004),
    usdaFdcId: usda.fdcId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
