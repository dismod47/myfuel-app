'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db/db';
import type { Food } from '@myfuel/types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: Food | null;
  onSave: () => void;
}

export function FoodDialog({ open, onOpenChange, food, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Food>>({
    name: '',
    brand: '',
    unitDefault: 'g',
    kcalPerUnit: 0,
    proteinPerUnit: 0,
    carbPerUnit: 0,
    fatPerUnit: 0,
    servingName: '',
    servingGrams: 0,
  });

  useEffect(() => {
    if (food) {
      setFormData(food);
    } else {
      setFormData({
        name: '',
        brand: '',
        unitDefault: 'g',
        kcalPerUnit: 0,
        proteinPerUnit: 0,
        carbPerUnit: 0,
        fatPerUnit: 0,
        servingName: '',
        servingGrams: 0,
      });
    }
  }, [food]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    const foodData: Food = {
      ...formData as Food,
      createdAt: food?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (food?.id) {
      await db.foods.update(food.id, foodData);
      toast.success('Food updated');
    } else {
      await db.foods.add(foodData);
      toast.success('Food added');
    }

    onOpenChange(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{food ? 'Edit Food' : 'Add Food'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Brand</label>
            <Input
              value={formData.brand || ''}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Unit</label>
            <select
              value={formData.unitDefault}
              onChange={(e) => setFormData({ ...formData, unitDefault: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="g">per 100g</option>
              <option value="ml">per 100ml</option>
              <option value="serving">per serving</option>
            </select>
          </div>
          {formData.unitDefault === 'serving' && (
            <>
              <div>
                <label className="text-sm font-medium">Serving Name</label>
                <Input
                  placeholder="scoop, tbsp, etc."
                  value={formData.servingName || ''}
                  onChange={(e) => setFormData({ ...formData, servingName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Serving Grams</label>
                <Input
                  type="number"
                  value={formData.servingGrams || 0}
                  onChange={(e) => setFormData({ ...formData, servingGrams: parseFloat(e.target.value) })}
                />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium">Kcal per unit</label>
            <Input
              type="number"
              value={formData.kcalPerUnit}
              onChange={(e) => setFormData({ ...formData, kcalPerUnit: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Protein (g) per unit</label>
            <Input
              type="number"
              value={formData.proteinPerUnit}
              onChange={(e) => setFormData({ ...formData, proteinPerUnit: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Carbs (g) per unit</label>
            <Input
              type="number"
              value={formData.carbPerUnit}
              onChange={(e) => setFormData({ ...formData, carbPerUnit: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fat (g) per unit</label>
            <Input
              type="number"
              value={formData.fatPerUnit}
              onChange={(e) => setFormData({ ...formData, fatPerUnit: parseFloat(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
