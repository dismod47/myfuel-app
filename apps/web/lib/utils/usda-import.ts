import { db } from '@/lib/db/db';
import type { Food } from '@myfuel/types';

const USDA_API_KEY = 'A9CBEGZ3Ga13rc75WVVguoYKDreIp4Dl4bO68wDi';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Popular search terms to get a diverse food database
const SEARCH_QUERIES = [
  // Proteins
  'chicken breast', 'ground beef', 'salmon', 'tuna', 'turkey', 'pork', 'eggs',
  'greek yogurt', 'cottage cheese', 'tofu', 'tempeh', 'shrimp', 'cod', 'tilapia',
  
  // Dairy
  'milk', 'cheese', 'yogurt', 'butter', 'cream cheese', 'mozzarella', 'cheddar',
  
  // Grains & Carbs
  'brown rice', 'white rice', 'quinoa', 'oats', 'whole wheat bread', 'pasta',
  'sweet potato', 'potato', 'couscous', 'barley',
  
  // Fruits
  'banana', 'apple', 'orange', 'strawberry', 'blueberry', 'avocado', 'mango',
  'grape', 'watermelon', 'pineapple', 'peach', 'pear',
  
  // Vegetables
  'broccoli', 'spinach', 'kale', 'carrot', 'tomato', 'cucumber', 'bell pepper',
  'onion', 'garlic', 'cauliflower', 'zucchini', 'asparagus', 'green beans',
  
  // Nuts & Seeds
  'almonds', 'peanuts', 'cashews', 'walnuts', 'peanut butter', 'almond butter',
  'chia seeds', 'flax seeds', 'sunflower seeds', 'pumpkin seeds',
  
  // Legumes
  'black beans', 'chickpeas', 'lentils', 'kidney beans', 'pinto beans',
  
  // Fats & Oils
  'olive oil', 'coconut oil', 'avocado oil', 'canola oil',
  
  // Common Beverages & Snacks
  'protein powder', 'granola', 'crackers', 'hummus', 'salsa', 'dark chocolate',
];

interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: USDAFoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
}

function extractNutrientValue(nutrients: USDAFoodNutrient[], nutrientIds: number[]): number {
  const nutrient = nutrients.find(n => nutrientIds.includes(n.nutrientId));
  return nutrient?.value || 0;
}

function convertUSDAFoodToMyFuel(usdaFood: USDAFood): Food | null {
  try {
    const nutrients = usdaFood.foodNutrients;
    
    // Nutrient IDs from USDA database
    const ENERGY_KCAL = [1008]; // Energy (kcal)
    const PROTEIN = [1003]; // Protein
    const CARBS = [1005]; // Carbohydrate, by difference
    const FAT = [1004]; // Total lipid (fat)

    const kcal = extractNutrientValue(nutrients, ENERGY_KCAL);
    const protein = extractNutrientValue(nutrients, PROTEIN);
    const carbs = extractNutrientValue(nutrients, CARBS);
    const fat = extractNutrientValue(nutrients, FAT);

    // Skip foods with no calorie data
    if (kcal === 0 && protein === 0 && carbs === 0 && fat === 0) {
      return null;
    }

    let name = usdaFood.description;
    let brand = usdaFood.brandOwner;

    // Clean up the name
    name = name.trim();
    if (name.length > 100) {
      name = name.substring(0, 100);
    }

    // Determine serving info
    let unitDefault: 'g' | 'ml' | 'serving' = 'g';
    let servingName: string | undefined;
    let servingGrams: number | undefined;

    if (usdaFood.servingSize && usdaFood.servingSizeUnit) {
      if (usdaFood.servingSizeUnit === 'ml' || usdaFood.servingSizeUnit === 'mL') {
        unitDefault = 'ml';
      } else if (usdaFood.householdServingFullText) {
        unitDefault = 'serving';
        servingName = usdaFood.householdServingFullText.split(',')[0].trim();
        servingGrams = usdaFood.servingSize;
      }
    }

    return {
      name,
      brand,
      unitDefault,
      servingName,
      servingGrams,
      kcalPerUnit: kcal,
      proteinPerUnit: protein,
      carbPerUnit: carbs,
      fatPerUnit: fat,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error converting USDA food:', error);
    return null;
  }
}

async function searchUSDAFoods(query: string, pageSize: number = 10): Promise<USDAFood[]> {
  try {
    const response = await fetch(`${USDA_BASE_URL}/foods/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        pageSize,
        dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'],
      }),
    });

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: USDASearchResult = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error(`Failed to search for "${query}":`, error);
    return [];
  }
}

export async function importUSDAFoods(
  onProgress?: (current: number, total: number) => void
): Promise<{ imported: number; skipped: number }> {
  const foodsToImport: Food[] = [];
  const seenNames = new Set<string>();
  let imported = 0;
  let skipped = 0;

  const totalQueries = SEARCH_QUERIES.length;

  for (let i = 0; i < totalQueries; i++) {
    const query = SEARCH_QUERIES[i];
    
    if (onProgress) {
      onProgress(i + 1, totalQueries);
    }

    // Fetch up to 10 results per query
    const usdaFoods = await searchUSDAFoods(query, 10);

    for (const usdaFood of usdaFoods) {
      const food = convertUSDAFoodToMyFuel(usdaFood);
      
      if (!food) {
        skipped++;
        continue;
      }

      // Deduplicate by name (case-insensitive)
      const normalizedName = food.name.toLowerCase();
      if (seenNames.has(normalizedName)) {
        skipped++;
        continue;
      }

      seenNames.add(normalizedName);
      foodsToImport.push(food);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Bulk import to database
  if (foodsToImport.length > 0) {
    try {
      await db.foods.bulkAdd(foodsToImport);
      imported = foodsToImport.length;
    } catch (error) {
      console.error('Error bulk adding foods:', error);
      // Try adding one by one if bulk fails
      for (const food of foodsToImport) {
        try {
          await db.foods.add(food);
          imported++;
        } catch (e) {
          skipped++;
        }
      }
    }
  }

  return { imported, skipped };
}
