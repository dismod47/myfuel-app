'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/db/db';
import { FileText, Sparkles } from 'lucide-react';
import type { Template } from '@myfuel/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  currentDate: string;
  onApplied: () => void;
}

interface PreMadeTemplate {
  name: string;
  description: string;
  items: Array<{ foodName: string; quantity: number }>;
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export function TemplateQuickAdd({ currentDate, onApplied }: Props) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [preMadeTemplates, setPreMadeTemplates] = useState<PreMadeTemplate[]>([]);
  const [showPreMade, setShowPreMade] = useState(true);

  useEffect(() => {
    if (open) {
      loadTemplates();
      loadPreMadeTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    const all = await db.templates.toArray();
    setTemplates(all);
  };

  const loadPreMadeTemplates = async () => {
    try {
      const response = await fetch('/data/premade_templates.json');
      const data = await response.json();
      setPreMadeTemplates(data);
    } catch (error) {
      console.error('Failed to load pre-made templates:', error);
    }
  };

  const handleApplyCustom = async (template: Template) => {
    const logs = [];
    for (const item of template.items) {
      const food = await db.foods.get(item.foodId);
      if (!food) continue;

      const multiplier = item.quantity / 100;
      logs.push({
        date: currentDate,
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
    setOpen(false);
    onApplied();
  };

  const handleApplyPreMade = async (template: PreMadeTemplate) => {
    const logs = [];
    const allFoods = await db.foods.toArray();

    for (const item of template.items) {
      const food = allFoods.find(f => f.name === item.foodName);
      if (!food) {
        toast.error(`Food not found: ${item.foodName}`);
        continue;
      }

      const multiplier = item.quantity / 100;
      logs.push({
        date: currentDate,
        meal: 'snack',
        foodId: food.id!,
        quantity: item.quantity,
        kcal: food.kcalPerUnit * multiplier,
        p: food.proteinPerUnit * multiplier,
        c: food.carbPerUnit * multiplier,
        f: food.fatPerUnit * multiplier,
      });
    }

    if (logs.length > 0) {
      await db.logs.bulkAdd(logs);
      toast.success(`Applied meal: ${template.name}`);
      setOpen(false);
      onApplied();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileText className="w-4 h-4 mr-2" />
        Meal Templates
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply Meal Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex gap-2">
              <Button 
                variant={showPreMade ? 'default' : 'outline'}
                onClick={() => setShowPreMade(true)}
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Pre-Made Meals
              </Button>
              <Button 
                variant={!showPreMade ? 'default' : 'outline'}
                onClick={() => setShowPreMade(false)}
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Your Templates
              </Button>
            </div>

            {showPreMade ? (
              <div className="grid gap-4 md:grid-cols-2">
                {preMadeTemplates.map((template, index) => (
                  <Card key={index} className="p-4 hover:border-primary transition-colors cursor-pointer" onClick={() => handleApplyPreMade(template)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 my-3 p-2 bg-muted rounded-md">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Kcal</div>
                        <div className="font-semibold">{template.totalKcal}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Protein</div>
                        <div className="font-semibold">{template.totalProtein}g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Carbs</div>
                        <div className="font-semibold">{template.totalCarbs}g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Fat</div>
                        <div className="font-semibold">{template.totalFat}g</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium">Includes:</p>
                      {template.items.map((item, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          • {item.foodName} ({item.quantity}g)
                        </p>
                      ))}
                    </div>

                    <Button className="w-full mt-3" size="sm">
                      Add to Today
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No custom templates yet. Create one in the Templates page!
                  </p>
                ) : (
                  templates.map(t => (
                    <Card key={t.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{t.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t.items.length} item{t.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button onClick={() => handleApplyCustom(t)} size="sm">
                          Apply
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}