'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database, Loader2 } from 'lucide-react';
import { db } from '@/lib/db/db';
import { importUSDAFoods } from '@/lib/utils/usda-import';
import toast from 'react-hot-toast';

interface Props {
  onImport: () => void;
}

export function USDAImporter({ onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleImport = async () => {
    setLoading(true);
    setProgress({ current: 0, total: 0 });

    try {
      const result = await importUSDAFoods((current, total) => {
        setProgress({ current, total });
      });

      toast.success(`Successfully imported ${result.imported} foods!`);
      setOpen(false);
      onImport();
    } catch (error) {
      toast.error('Failed to import foods from USDA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Database className="w-4 h-4 mr-2" />
        Import from USDA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Foods from USDA FoodData Central</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will import hundreds of common foods from the USDA database including:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Fresh fruits and vegetables</li>
              <li>Meats, poultry, and seafood</li>
              <li>Dairy products</li>
              <li>Grains and cereals</li>
              <li>Nuts, seeds, and legumes</li>
              <li>Popular branded foods</li>
            </ul>

            {loading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">
                    Importing foods... {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport}>
                  Start Import
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
