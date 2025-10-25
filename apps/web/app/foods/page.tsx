'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FoodDialog } from '@/components/shared/FoodDialog';
import { ImportExportButtons } from '@/components/shared/ImportExportButtons';
import type { Food } from '@myfuel/types';

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const allFoods = await db.foods.toArray();
    setFoods(allFoods);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this food? This will not remove existing logs.')) {
      await db.foods.delete(id);
      loadFoods();
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
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md bg-background"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Foods added via Quick Add will appear here. Search uses USDA API.
        </p>
      </Card>

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
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No foods yet. Use Quick Add to search and add foods from USDA database.
                  </td>
                </tr>
              ) : (
                filteredFoods.map(food => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <FoodDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        food={editingFood}
        onSave={loadFoods}
      />
    </div>
  );
}
