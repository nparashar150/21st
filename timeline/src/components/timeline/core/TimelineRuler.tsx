'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useTimelineStore } from '@/lib/timeline-store';
import { formatTime } from '@/utils/time-math';
import { cn } from '@/lib/utils';

interface TimelineRulerProps {
  className?: string;
  containerWidth: number;
  viewportStart: number;
  pxPerSec: number;
  onSeek?: (time: number) => void;
}

export const TimelineRuler = ({
  className,
  containerWidth,
  viewportStart: propViewportStart,
  pxPerSec: propPxPerSec,
  onSeek
}: TimelineRulerProps) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const rulerRectRef = useRef<DOMRect | null>(null);
  const { project, currentTime, viewportStart, viewportEnd, isPlaying } = useTimelineStore();
  const [isDragging, setIsDragging] = useState(false);

  // Use props if provided, otherwise fallback to store
  const pxPerSec = propPxPerSec || project.zoom.pxPerSec;
  const effectiveViewportStart = propViewportStart !== undefined ? propViewportStart : viewportStart;
  const rulerHeight = 40;

  const handleSeek = useCallback(
    (clientX: number) => {
      if (!rulerRectRef.current) return;

      const relativeX = clientX - rulerRectRef.current.left;
      // Convert pixel position to time, accounting for viewport offset
      const time = effectiveViewportStart + (relativeX / pxPerSec);
      const clampedTime = Math.max(0, Math.min(project.duration, time));

      onSeek?.(clampedTime);
    },
    [pxPerSec, effectiveViewportStart, project.duration, onSeek]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      // Cache ruler rect for fast dragging
      if (rulerRef.current) {
        rulerRectRef.current = rulerRef.current.getBoundingClientRect();
      }

      setIsDragging(true);
      handleSeek(event.clientX);
    },
    [handleSeek]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging) {
        handleSeek(event.clientX);
      }
    },
    [isDragging, handleSeek]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    rulerRectRef.current = null; // Clear cached rect
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);


  return (
    <div
      ref={rulerRef}
      className={cn('relative border-b h-10 bg-muted/20 cursor-pointer', className)}
      onMouseDown={handleMouseDown}
      role="slider"
      aria-label="Timeline scrubber"
      aria-valuemin={0}
      aria-valuemax={project.duration}
      aria-valuenow={currentTime}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const newTime = Math.max(0, currentTime - 0.1);
          onSeek?.(newTime);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const newTime = Math.min(project.duration, currentTime + 0.1);
          onSeek?.(newTime);
        }
      }}
    >
      <div className="absolute top-1 left-2 text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded text-[10px]">
        {formatTime(currentTime, true)}
      </div>

      <div className="absolute top-1 right-2 text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded text-[10px]">
        {formatTime(project.duration)}
      </div>
    </div>
  );
};