const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;

export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  dataType: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
}

export interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export async function searchUSDAFoods(query: string, pageSize: number = 20): Promise<USDASearchResult> {
  try {
    const response = await fetch(
      `${USDA_API_BASE}/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('USDA API search error:', error);
    throw error;
  }
}

export function convertUSDAToLocalFood(usdaFood: USDAFood) {
  // Extract key nutrients
  const nutrients = usdaFood.foodNutrients || [];
  
  const getNutrientValue = (nutrientId: number) => {
    const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
    return nutrient ? nutrient.value : 0;
  };

  // Nutrient IDs from USDA
  // 1008 = Energy (kcal)
  // 1003 = Protein
  // 1005 = Carbohydrate
  // 1004 = Total lipid (fat)
  
  const kcal = getNutrientValue(1008);
  const protein = getNutrientValue(1003);
  const carbs = getNutrientValue(1005);
  const fat = getNutrientValue(1004);

  return {
    name: usdaFood.description,
    brand: usdaFood.brandOwner || 'USDA',
    unitDefault: 'g' as const,
    servingName: null,
    servingGrams: null,
    kcalPerUnit: kcal,
    proteinPerUnit: protein,
    carbPerUnit: carbs,
    fatPerUnit: fat,
    usdaFdcId: usdaFood.fdcId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
