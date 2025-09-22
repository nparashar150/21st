'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTimelineStore } from '@/lib/timeline-store';
import { cn } from '@/lib/utils';
import { Settings, X } from 'lucide-react';

interface TimelineSettingsProps {
  className?: string;
}

export const TimelineSettings = ({ className }: TimelineSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    uiSettings,
    toggleTimeSelection,
    togglePlayheadSync,
    toggleClipAnimations,
  } = useTimelineStore();

  const settings = [
    {
      id: 'timeSelection',
      label: 'Time Selection Tool',
      description: 'Enable click & drag to select time ranges',
      enabled: uiSettings.enableTimeSelection,
      toggle: toggleTimeSelection,
    },
    {
      id: 'playheadSync',
      label: 'Playhead Auto-Scroll',
      description: 'Auto-scroll timeline to follow playhead during playback',
      enabled: uiSettings.enablePlayheadSync,
      toggle: togglePlayheadSync,
    },
    {
      id: 'clipAnimations',
      label: 'Clip Animations',
      description: 'Enable hover and transition animations on clips',
      enabled: uiSettings.enableClipAnimations,
      toggle: toggleClipAnimations,
    },
  ];

  return (
    <div className={cn('relative', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isOpen ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Timeline Settings</p>
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Timeline Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-0">
            {settings.map((setting, index) => (
              <div key={setting.id}>
                <div className="grid grid-cols-[20px_1fr] gap-3 items-start py-3">
                  <div className="flex justify-center pt-0.5">
                    <Checkbox
                      id={setting.id}
                      checked={setting.enabled}
                      onCheckedChange={setting.toggle}
                    />
                  </div>
                  <div className="min-w-0">
                    <Label
                      htmlFor={setting.id}
                      className="text-sm font-medium cursor-pointer leading-none block"
                    >
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {setting.description}
                    </p>
                  </div>
                </div>
                {index < settings.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="text-xs text-muted-foreground">
            <p className="mb-1">💡 <strong>Tips:</strong></p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Disable Time Selection if you prefer click-to-seek only</li>
              <li>Turn off animations for better performance on large projects</li>
              <li>Auto-scroll helps track playhead during playback</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};