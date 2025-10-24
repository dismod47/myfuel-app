'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TemplateDialog } from '@/components/shared/TemplateDialog';
import type { Template } from '@myfuel/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const allTemplates = await db.templates.toArray();
    setTemplates(allTemplates);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this template?')) {
      await db.templates.delete(id);
      loadTemplates();
      toast.success('Template deleted');
    }
  };

  const handleApply = async (template: Template) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logs = [];

    for (const item of template.items) {
      const food = await db.foods.get(item.foodId);
      if (!food) continue;

      const multiplier = item.quantity / 100;
      logs.push({
        date: today,
        meal: 'snack',
        foodId: item.foodId,
        quantity: item.quantity,
        kcal: food.kcalPerUnit * multiplier,
        p: food.proteinPerUnit * multiplier,
        c: food.carbPerUnit * multiplier,
        f: food.fatPerUnit * multiplier,
      });
    }

    await db.logs.bulkAdd(logs);
    toast.success(`Applied template: ${template.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meal Templates</h1>
        <Button onClick={() => { setEditingTemplate(null); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <Card key={template.id} className="p-4">
            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {template.items.length} item{template.items.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApply(template)}>
                Apply to Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id!)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <TemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={editingTemplate}
        onSave={loadTemplates}
      />
    </div>
  );
}
