'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/db/db';
import { searchUSDAFoods, convertUSDAToLocalFood, type USDAFood } from '@/lib/api/usda';
import toast from 'react-hot-toast';
import type { Food } from '@myfuel/types';
import { Loader2 } from 'lucide-react';

interface Props {
  currentDate: string;
  onAdded: () => void;
}

export function SmartTextInput({ currentDate, onAdded }: Props) {
  const [input, setInput] = useState('');
  const [meal, setMeal] = useState('snack');
  const [localFoods, setLocalFoods] = useState<Food[]>([]);
  const [usdaFoods, setUsdaFoods] = useState<USDAFood[]>([]);
  const [matchedFoods, setMatchedFoods] = useState<(Food | USDAFood)[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFood, setSelectedFood] = useState<Food | USDAFood | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadLocalFoods();
  }, []);

  const loadLocalFoods = async () => {
    const foods = await db.foods.toArray();
    setLocalFoods(foods);
  };

  useEffect(() => {
    if (input.trim().length > 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce API search
      searchTimeoutRef.current = setTimeout(async () => {
        setSearching(true);
        
        // Search local foods first
        const searchTerm = input.toLowerCase().trim();
        const localMatches = localFoods
          .filter(food => food.name.toLowerCase().includes(searchTerm))
          .slice(0, 5);

        // Search USDA API
        try {
          const result = await searchUSDAFoods(input, 10);
          setUsdaFoods(result.foods || []);
          
          // Combine results: local first, then USDA
          const combined = [...localMatches, ...result.foods.slice(0, 10)];
          setMatchedFoods(combined);
          setShowDropdown(combined.length > 0);
          setSelectedIndex(0);
        } catch (error) {
          console.error('API search failed:', error);
          // Fallback to local only
          setMatchedFoods(localMatches);
          setShowDropdown(localMatches.length > 0);
          setSelectedIndex(0);
        } finally {
          setSearching(false);
        }
      }, 500); // 500ms debounce
    } else {
      setShowDropdown(false);
      setMatchedFoods([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [input, localFoods]);

  const isLocalFood = (food: Food | USDAFood): food is Food => {
    return 'id' in food;
  };

  const handleFoodClick = (food: Food | USDAFood) => {
    setSelectedFood(food);
    setQuantity('100');
    setShowDropdown(false);
    setShowQuantityDialog(true);
  };

  const handleAddWithQuantity = async () => {
    if (!selectedFood) return;

    try {
      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }

      let foodToAdd: Food;

      // If it's a USDA food, save it to local DB first
      if (!isLocalFood(selectedFood)) {
        const convertedFood = convertUSDAToLocalFood(selectedFood);
        const existingFood = await db.foods
          .where('usdaFdcId')
          .equals(selectedFood.fdcId)
          .first();

        if (existingFood) {
          foodToAdd = existingFood;
        } else {
          const id = await db.foods.add(convertedFood);
          foodToAdd = { ...convertedFood, id };
          toast.success(`Added "${foodToAdd.name}" to your food library!`);
          loadLocalFoods(); // Refresh local foods
        }
      } else {
        foodToAdd = selectedFood;
      }

      const multiplier = qty / 100;
      const log = {
        date: currentDate,
        meal,
        foodId: foodToAdd.id!,
        quantity: qty,
        kcal: foodToAdd.kcalPerUnit * multiplier,
        p: foodToAdd.proteinPerUnit * multiplier,
        c: foodToAdd.carbPerUnit * multiplier,
        f: foodToAdd.fatPerUnit * multiplier,
      };

      await db.logs.add(log);
      toast.success(`Added ${qty}g ${foodToAdd.name}`);
      setInput('');
      setShowQuantityDialog(false);
      setSelectedFood(null);
      onAdded();
    } catch (error) {
      toast.error('Failed to add food');
      console.error(error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % matchedFoods.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + matchedFoods.length) % matchedFoods.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchedFoods[selectedIndex]) {
        handleFoodClick(matchedFoods[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const getFoodDisplay = (food: Food | USDAFood) => {
    if (isLocalFood(food)) {
      return {
        name: food.name,
        brand: food.brand || 'Local',
        kcal: food.kcalPerUnit.toFixed(0),
        protein: food.proteinPerUnit.toFixed(1),
        carbs: food.carbPerUnit.toFixed(1),
        fat: food.fatPerUnit.toFixed(1),
        source: '📁 Saved'
      };
    } else {
      const converted = convertUSDAToLocalFood(food);
      return {
        name: food.description,
        brand: food.brandOwner || 'USDA',
        kcal: converted.kcalPerUnit.toFixed(0),
        protein: converted.proteinPerUnit.toFixed(1),
        carbs: converted.carbPerUnit.toFixed(1),
        fat: converted.fatPerUnit.toFixed(1),
        source: '🌐 USDA'
      };
    }
  };

  return (
    <>
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Quick Add Food</h2>
        <div className="flex gap-2 relative">
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Search foods... (local + USDA database)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => input.length > 2 && setShowDropdown(true)}
            />
            
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {showDropdown && matchedFoods.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto">
                {matchedFoods.map((food, index) => {
                  const display = getFoodDisplay(food);
                  return (
                    <div
                      key={isLocalFood(food) ? `local-${food.id}` : `usda-${food.fdcId}`}
                      className={`px-4 py-3 cursor-pointer hover:bg-accent ${
                        index === selectedIndex ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleFoodClick(food)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{display.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {display.brand} • {display.source}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {display.kcal} kcal, P: {display.protein}g, C: {display.carbs}g, F: {display.fat}g (per 100g)
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {searching ? 'Searching USDA database...' : `Search from local library + USDA FoodData Central`}
        </p>
      </Card>

      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              How much {selectedFood && getFoodDisplay(selectedFood).name}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantity (in grams)
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddWithQuantity()}
              />
            </div>
            {selectedFood && quantity && !isNaN(parseFloat(quantity)) && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Nutritional Info:</p>
                {(() => {
                  const display = getFoodDisplay(selectedFood);
                  const multiplier = parseFloat(quantity) / 100;
                  return (
                    <p className="text-sm text-muted-foreground">
                      {(parseFloat(display.kcal) * multiplier).toFixed(0)} kcal • 
                      P: {(parseFloat(display.protein) * multiplier).toFixed(1)}g • 
                      C: {(parseFloat(display.carbs) * multiplier).toFixed(1)}g • 
                      F: {(parseFloat(display.fat) * multiplier).toFixed(1)}g
                    </p>
                  );
                })()}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWithQuantity}>
                Add to {meal}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
