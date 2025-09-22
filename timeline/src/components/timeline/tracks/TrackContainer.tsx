'use client';

import { useRef, useCallback, useMemo } from 'react';
import { ClipToken } from '../tokens/ClipToken';
import { useTimelineStore } from '@/lib/timeline-store';
import { timelineMath } from '@/utils/time-math';
import { cn } from '@/lib/utils';
import type { Track } from '@/types/timeline';

interface TrackContainerProps {
  track: Track;
  containerWidth: number;
  className?: string;
}

export const TrackContainer = ({ track, containerWidth, className }: TrackContainerProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const {
    project,
    viewportStart,
    viewportEnd,
    clearSelection,
    setSelection,
    uiSettings,
  } = useTimelineStore();

  const { pxPerSec } = project.zoom;

  // Virtualization: only render items that are visible or partially visible
  const visibleItems = useMemo(() => {
    const buffer = 100; // px buffer for smooth scrolling
    const timeBuffer = buffer / pxPerSec;

    return track.items.filter((item) => {
      return (
        item.end >= viewportStart - timeBuffer &&
        item.start <= viewportEnd + timeBuffer
      );
    });
  }, [track.items, viewportStart, viewportEnd, pxPerSec]);

  const handleTrackClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  const handleTrackMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.target !== event.currentTarget) return;
      if (!uiSettings.enableTimeSelection) return; // Skip if time selection is disabled

      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = event.clientX - rect.left;
      const startTime = timelineMath.pxToTime(startX, pxPerSec, viewportStart * pxPerSec);

      let isSelecting = false;
      let selectionStart = startTime;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentX = moveEvent.clientX - rect.left;
        const currentTime = timelineMath.pxToTime(currentX, pxPerSec, viewportStart * pxPerSec);

        if (!isSelecting && Math.abs(currentX - startX) > 5) {
          isSelecting = true;
        }

        if (isSelecting) {
          const selectionEnd = currentTime;
          setSelection({
            start: Math.min(selectionStart, selectionEnd),
            end: Math.max(selectionStart, selectionEnd),
          });
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [pxPerSec, viewportStart, setSelection, uiSettings.enableTimeSelection]
  );

  const getTrackTypeIcon = (type: Track['type']) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'transcript':
        return '📝';
      case 'markers':
        return '📍';
      case 'assets':
        return '📁';
      default:
        return '📄';
    }
  };

  if (!track.visible) {
    return null;
  }

  return (
    <div className={cn('border-b', className)}>
      <div
        ref={trackRef}
        className="relative cursor-crosshair"
        style={{ height: track.height }}
        onClick={handleTrackClick}
        onMouseDown={handleTrackMouseDown}
        role="region"
        aria-label={`${track.type} track: ${track.name}`}
      >
        {/* Grid lines (optional) */}
        {project.settings.snapToGrid && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Add grid visualization here if needed */}
          </div>
        )}

        {/* Render visible items */}
        {visibleItems.map((item) => (
          <ClipToken
            key={item.id}
            item={item}
            trackId={track.id}
            pxPerSec={pxPerSec}
            viewportStart={viewportStart}
            trackHeight={track.height}
          />
        ))}

        {/* Selection overlay */}
        {project.selection && (
          <div
            className="absolute top-0 bottom-0 bg-timeline-selection pointer-events-none border border-timeline-accent"
            style={{
              left: `${timelineMath.timeToPx(project.selection.start, pxPerSec, viewportStart * pxPerSec)}px`,
              width: `${(project.selection.end - project.selection.start) * pxPerSec}px`,
            }}
          />
        )}

        {/* Loop overlay */}
        {project.loop && (
          <div
            className="absolute top-0 bottom-0 border-2 border-timeline-accent border-dashed pointer-events-none"
            style={{
              left: `${timelineMath.timeToPx(project.loop.start, pxPerSec, viewportStart * pxPerSec)}px`,
              width: `${(project.loop.end - project.loop.start) * pxPerSec}px`,
            }}
          />
        )}

        {/* Track type specific overlays */}
        {track.type === 'transcript' && track.items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-timeline-border" />
        )}
      </div>
    </div>
  );
};