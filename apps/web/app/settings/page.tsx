'use client';

import { useState, useEffect } from 'react';
import { db, seedDemoData } from '@/lib/db/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AccentPicker } from '@/components/shared/AccentPicker';
import { InstallPWA } from '@/components/shared/InstallPWA';
import type { Settings } from '@myfuel/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const current = await db.settings.toCollection().last();
    setSettings(current || null);
  };

  const handleResetDemo = async () => {
    if (confirm('Reset all data and reload demo? This cannot be undone.')) {
      await db.delete();
      await db.open();
      await seedDemoData();
      toast.success('Demo data reset');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <ThemeToggle />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Accent Color</label>
            <AccentPicker />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Progressive Web App</h2>
        <InstallPWA />
        <p className="text-sm text-muted-foreground mt-4">
          ✓ Offline ready — your data is always available
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cloud Sync</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Cloud synchronization is coming soon. For now, use Import/Export to back up your data.
        </p>
        <Button disabled>
          Enable Sync (Coming Soon)
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Data</h2>
        <Button variant="destructive" onClick={handleResetDemo}>
          Reset to Demo Data
        </Button>
      </Card>
    </div>
  );
}
