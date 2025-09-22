'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useTimelineStore } from '@/lib/timeline-store';
import { timelineMath, formatTime } from '@/utils/time-math';
import { cn } from '@/lib/utils';
import type { TrackItem } from '@/types/timeline';

interface ClipTokenProps {
  item: TrackItem;
  trackId: string;
  pxPerSec: number;
  viewportStart: number;
  trackHeight: number;
  className?: string;
}

export const ClipToken = ({
  item,
  trackId,
  pxPerSec,
  viewportStart,
  trackHeight,
  className,
}: ClipTokenProps) => {
  const tokenRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'start' | 'end' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });

  const {
    selectedItems,
    selectItems,
    addToSelection,
    clearSelection,
    moveItems,
    resizeItem,
    project,
    uiSettings,
  } = useTimelineStore();

  const isSelected = selectedItems.includes(item.id);
  const duration = item.end - item.start;

  // Calculate position and width
  const left = timelineMath.timeToPx(item.start, pxPerSec, viewportStart * pxPerSec);
  const width = Math.max(8, duration * pxPerSec);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, action: 'move' | 'resize-start' | 'resize-end') => {
      event.preventDefault();
      event.stopPropagation();

      if (!isSelected && !event.metaKey && !event.shiftKey) {
        selectItems([item.id]);
      } else if (event.metaKey || event.shiftKey) {
        if (isSelected) {
          const newSelection = selectedItems.filter((id) => id !== item.id);
          selectItems(newSelection);
        } else {
          addToSelection(item.id);
        }
        return;
      }

      if (action === 'move') {
        setIsDragging(true);
      } else {
        setIsResizing(action === 'resize-start' ? 'start' : 'end');
      }

      setDragStart({
        x: event.clientX,
        time: item.start,
      });
    },
    [item.id, item.start, isSelected, selectedItems, selectItems, addToSelection]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!tokenRef.current || (!isDragging && !isResizing)) return;

      const deltaX = event.clientX - dragStart.x;
      const deltaTime = deltaX / pxPerSec;

      if (project.settings.snapToGrid) {
        // Implement snapping logic here
      }

      if (isDragging) {
        const newStart = Math.max(0, dragStart.time + deltaTime);
        moveItems([item.id], newStart - item.start);
      } else if (isResizing === 'start') {
        const newStart = Math.max(0, Math.min(item.end - 0.01, dragStart.time + deltaTime));
        resizeItem(item.id, newStart, item.end);
      } else if (isResizing === 'end') {
        const newEnd = Math.max(item.start + 0.01, item.start + duration + deltaTime);
        resizeItem(item.id, item.start, newEnd);
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      pxPerSec,
      item.id,
      item.start,
      item.end,
      duration,
      moveItems,
      resizeItem,
      project.settings.snapToGrid,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!event.metaKey && !event.shiftKey) {
        selectItems([item.id]);
      }
    },
    [item.id, selectItems]
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      // Could trigger edit mode or properties panel
    },
    []
  );

  const tokenContent = (
    <div
      ref={tokenRef}
      className={cn(
        'absolute flex items-center justify-between rounded border',
        'min-w-2 min-h-6 px-2 select-none cursor-pointer',
        uiSettings.enableClipAnimations && 'transition-all duration-150 hover:brightness-110',
        uiSettings.enableClipAnimations && (isDragging || isResizing) && 'scale-[1.02] shadow-lg',
        !uiSettings.enableClipAnimations && (isDragging || isResizing) && 'opacity-80',
        isSelected && 'ring-2',
        className
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        height: `${Math.min(trackHeight - 8, 36)}px`,
        top: `${(trackHeight - Math.min(trackHeight - 8, 36)) / 2}px`,
        backgroundColor: 'hsl(var(--timeline-clip))',
        borderColor: 'hsl(var(--timeline-clip-border))',
        color: 'hsl(var(--timeline-clip-text))',
        ...(isSelected && {
          ringColor: 'hsl(var(--timeline-playhead))',
          backgroundColor: 'hsl(var(--timeline-playhead) / 0.2)',
        }),
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      aria-label={`Clip: ${item.text || 'Untitled'} from ${formatTime(item.start)} to ${formatTime(item.end)}`}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Handle deletion
        }
      }}
    >
      {/* Resize handle - start */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 hover:opacity-100 rounded-l",
          uiSettings.enableClipAnimations && "transition-opacity"
        )}
        style={{
          ':hover': {
            backgroundColor: 'hsl(var(--timeline-playhead))',
          },
        }}
        onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="text-xs font-medium truncate">
          {item.text || `Clip ${item.id.slice(-4)}`}
        </div>
        {item.speaker && width > 60 && (
          <div className="text-[10px] text-muted-foreground truncate">
            {item.speaker}
          </div>
        )}
      </div>

      {/* Duration indicator */}
      {width > 50 && (
        <div className="text-[10px] text-muted-foreground ml-1 font-mono">
          {formatTime(duration)}
        </div>
      )}

      {/* Resize handle - end */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 hover:opacity-100 rounded-r",
          uiSettings.enableClipAnimations && "transition-opacity"
        )}
        style={{
          ':hover': {
            backgroundColor: 'hsl(var(--timeline-playhead))',
          },
        }}
        onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{tokenContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium">{item.text || 'Untitled Clip'}</div>
            <div className="text-sm text-muted-foreground">
              Start: {formatTime(item.start, true)}
            </div>
            <div className="text-sm text-muted-foreground">
              End: {formatTime(item.end, true)}
            </div>
            <div className="text-sm text-muted-foreground">
              Duration: {formatTime(duration, true)}
            </div>
            {item.speaker && (
              <div className="text-sm text-muted-foreground">
                Speaker: {item.speaker}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};