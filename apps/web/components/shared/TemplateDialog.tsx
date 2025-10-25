'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db/db';
import type { Template, Food } from '@myfuel/types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave: () => void;
}

export function TemplateDialog({ open, onOpenChange, template, onSave }: Props) {
  const [name, setName] = useState('');
  const [items, setItems] = useState<Array<{ foodId: number; quantity: number }>>([]);
  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    if (open) {
      loadFoods();
      if (template) {
        setName(template.name);
        setItems(template.items);
      } else {
        setName('');
        setItems([]);
      }
    }
  }, [open, template]);

  const loadFoods = async () => {
    const all = await db.foods.toArray();
    setFoods(all);
  };

  const handleAddItem = () => {
    if (foods.length > 0) {
      setItems([...items, { foodId: foods[0].id!, quantity: 100 }]);
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Name is required');
      return;
    }

    const templateData: Template = {
      name,
      items,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (template?.id) {
      await db.templates.update(template.id, { ...templateData });
      toast.success('Template updated');
    } else {
      await db.templates.add(templateData);
      toast.success('Template created');
    }

    onOpenChange(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Template Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Items</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <select
                    value={item.foodId}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].foodId = parseInt(e.target.value);
                      setItems(newItems);
                    }}
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                  >
                    {foods.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].quantity = parseFloat(e.target.value);
                      setItems(newItems);
                    }}
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddItem}>Add Item</Button>
            </div>
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
