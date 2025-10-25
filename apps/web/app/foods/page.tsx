'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { db } from '@/lib/db/db';
import { searchUSDAFoods, convertUSDAToLocalFood, type USDAFood } from '@/lib/api/usda';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FoodDialog } from '@/components/shared/FoodDialog';
import { ImportExportButtons } from '@/components/shared/ImportExportButtons';
import type { Food } from '@myfuel/types';
import toast from 'react-hot-toast';

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [usdaResults, setUsdaResults] = useState<USDAFood[]>([]);
  const [showUsdaResults, setShowUsdaResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const allFoods = await db.foods.toArray();
    setFoods(allFoods);
  };

  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const result = await searchUSDAFoods(searchTerm, 20);
          setUsdaResults(result.foods || []);
          setShowUsdaResults(true);
        } catch (error) {
          console.error('USDA search failed:', error);
          toast.error('Failed to search USDA database');
        } finally {
          setSearching(false);
        }
      }, 500);
    } else {
      setShowUsdaResults(false);
      setUsdaResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this food? This will not remove existing logs.')) {
      await db.foods.delete(id);
      loadFoods();
      toast.success('Food deleted');
    }
  };

  const handleAddUSDAFood = async (usdaFood: USDAFood) => {
    try {
      // Check if already exists
      const existing = await db.foods
        .where('usdaFdcId')
        .equals(usdaFood.fdcId)
        .first();

      if (existing) {
        toast.error('This food is already in your library');
        return;
      }

      const converted = convertUSDAToLocalFood(usdaFood);
      await db.foods.add(converted);
      toast.success(`Added "${converted.name}" to your library!`);
      loadFoods();
    } catch (error) {
      toast.error('Failed to add food');
      console.error(error);
    }
  };

  const filteredFoods = searchTerm
    ? foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : foods;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Food Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {foods.length} foods in your library
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExportButtons type="foods" onImport={loadFoods} />
          <Button onClick={() => { setEditingFood(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your library or USDA database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {searching && (
          <p className="text-xs text-muted-foreground mt-2">Searching USDA database...</p>
        )}
      </Card>

      {/* USDA Search Results */}
      {showUsdaResults && usdaResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">USDA Database Results</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowUsdaResults(false)}>
              Hide
            </Button>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-right">Kcal</th>
                    <th className="px-4 py-3 text-right">Protein (g)</th>
                    <th className="px-4 py-3 text-right">Carbs (g)</th>
                    <th className="px-4 py-3 text-right">Fat (g)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {usdaResults.map(usdaFood => {
                    const converted = convertUSDAToLocalFood(usdaFood);
                    return (
                      <tr key={usdaFood.fdcId} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{usdaFood.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {usdaFood.brandOwner || 'USDA'}
                        </td>
                        <td className="px-4 py-3 text-right">{converted.kcalPerUnit.toFixed(0)}</td>
                        <td className="px-4 py-3 text-right">{converted.proteinPerUnit.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right">{converted.carbPerUnit.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right">{converted.fatPerUnit.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddUSDAFood(usdaFood)}
                          >
                            Add to Library
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Your Library */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Library</h2>
        {filteredFoods.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No foods in your library yet. Search above to add foods from USDA database.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-left">Unit</th>
                    <th className="px-4 py-3 text-right">Kcal</th>
                    <th className="px-4 py-3 text-right">Protein (g)</th>
                    <th className="px-4 py-3 text-right">Carbs (g)</th>
                    <th className="px-4 py-3 text-right">Fat (g)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFoods.map(food => (
                    <tr key={food.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{food.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{food.brand || '—'}</td>
                      <td className="px-4 py-3">
                        {food.unitDefault === 'serving' && food.servingName
                          ? `${food.servingName} (${food.servingGrams}g)`
                          : `per 100${food.unitDefault}`}
                      </td>
                      <td className="px-4 py-3 text-right">{food.kcalPerUnit.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right">{food.proteinPerUnit.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">{food.carbPerUnit.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">{food.fatPerUnit.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(food)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(food.id!)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <FoodDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        food={editingFood}
        onSave={loadFoods}
      />
    </div>
  );
}
