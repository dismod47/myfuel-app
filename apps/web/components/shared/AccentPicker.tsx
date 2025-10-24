'use client';

import { Button } from '@/components/ui/button';

const PRESETS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AccentPicker() {
  return (
    <div className="flex gap-2">
      {PRESETS.map(color => (
        <button
          key={color}
          className="w-8 h-8 rounded-full border-2 border-muted"
          style={{ backgroundColor: color }}
          onClick={() => {
            document.documentElement.style.setProperty('--primary', color);
            localStorage.setItem('accent', color);
          }}
        />
      ))}
    </div>
  );
}
