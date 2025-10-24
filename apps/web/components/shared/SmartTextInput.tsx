'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/db/db';
import toast from 'react-hot-toast';
import type { Food } from '@myfuel/types';

interface Props {
  currentDate: string;
  onAdded: () => void;
}

export function SmartTextInput({ currentDate, onAdded }: Props) {
  const [input, setInput] = useState('');
  const [meal, setMeal] = useState('snack');
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [matchedFoods, setMatchedFoods] = useState<Food[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const foods = await db.foods.toArray();
    setAllFoods(foods);
  };

  useEffect(() => {
    if (input.trim().length > 0) {
      const searchTerm = input.toLowerCase().trim();
      const matches = allFoods
        .filter(food => food.name.toLowerCase().includes(searchTerm))
        .slice(0, 10);
      setMatchedFoods(matches);
      setShowDropdown(matches.length > 0);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
      setMatchedFoods([]);
    }
  }, [input, allFoods]);

  const handleFoodClick = (food: Food) => {
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

      const multiplier = qty / 100;
      const log = {
        date: currentDate,
        meal,
        foodId: selectedFood.id!,
        quantity: qty,
        kcal: selectedFood.kcalPerUnit * multiplier,
        p: selectedFood.proteinPerUnit * multiplier,
        c: selectedFood.carbPerUnit * multiplier,
        f: selectedFood.fatPerUnit * multiplier,
      };

      await db.logs.add(log);
      toast.success(`Added ${qty}g ${selectedFood.name}`);
      setInput('');
      setShowQuantityDialog(false);
      setSelectedFood(null);
      onAdded();
    } catch (error) {
      toast.error('Failed to add food');
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
              placeholder="Start typing food name... (e.g., chicken, rice, banana)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => input.length > 0 && setShowDropdown(true)}
            />
            
            {showDropdown && matchedFoods.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto">
                {matchedFoods.map((food, index) => (
                  <div
                    key={food.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-accent ${
                      index === selectedIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleFoodClick(food)}
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.brand && `${food.brand} • `}
                      {food.kcalPerUnit.toFixed(0)} kcal, 
                      P: {food.proteinPerUnit.toFixed(1)}g, 
                      C: {food.carbPerUnit.toFixed(1)}g, 
                      F: {food.fatPerUnit.toFixed(1)}g (per 100{food.unitDefault})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Type to search from {allFoods.length} foods. Select from dropdown to enter quantity.
        </p>
      </Card>

      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How much {selectedFood?.name}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantity (in grams or ml)
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
                <p className="text-sm text-muted-foreground">
                  {(selectedFood.kcalPerUnit * parseFloat(quantity) / 100).toFixed(0)} kcal • 
                  P: {(selectedFood.proteinPerUnit * parseFloat(quantity) / 100).toFixed(1)}g • 
                  C: {(selectedFood.carbPerUnit * parseFloat(quantity) / 100).toFixed(1)}g • 
                  F: {(selectedFood.fatPerUnit * parseFloat(quantity) / 100).toFixed(1)}g
                </p>
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