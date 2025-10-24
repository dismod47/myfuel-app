'use client';

import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { exportFullJSON, importFullJSON, exportFoodsCSV, importFoodsCSV } from '@/lib/utils/export';
import toast from 'react-hot-toast';

interface Props {
  type: 'foods' | 'full';
  onImport: () => void;
}

export function ImportExportButtons({ type, onImport }: Props) {
  const handleExport = async () => {
    try {
      const data = type === 'foods' ? await exportFoodsCSV() : await exportFullJSON();
      const blob = new Blob([data], { type: type === 'foods' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'foods' ? 'foods.csv' : 'myfuel-backup.json';
      a.click();
      toast.success('Export complete');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'foods' ? '.csv' : '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        if (type === 'foods') {
          await importFoodsCSV(text);
        } else {
          const mode = confirm('Merge with existing data? (Cancel to overwrite)') ? 'merge' : 'overwrite';
          await importFullJSON(text, mode);
        }
        toast.success('Import complete');
        onImport();
      } catch (error) {
        toast.error('Import failed');
      }
    };
    input.click();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </>
  );
}
