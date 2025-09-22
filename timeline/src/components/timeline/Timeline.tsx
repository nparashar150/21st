'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { PlaybackControls } from './controls/PlaybackControls';
import { TrackContainer } from './tracks/TrackContainer';
import { useTimelineStore } from '@/lib/timeline-store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { timelineMath, formatTime } from '@/utils/time-math';
import { cn } from '@/lib/utils';

interface TimelineProps {
  className?: string;
  height?: number;
  onTimeUpdate?: (time: number) => void;
}

export const Timeline = ({ className, height = 600, onTimeUpdate }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playheadLineRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const containerRectRef = useRef<DOMRect | null>(null);

  const {
    project,
    currentTime,
    setCurrentTime,
    viewportStart,
    viewportEnd,
    setViewport,
    isPlaying,
    uiSettings,
  } = useTimelineStore();

  const dragTimeRef = useRef<number>(currentTime);

  useKeyboardShortcuts();

  const { pxPerSec } = project.zoom || { pxPerSec: 50 };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);

        // Initialize viewport if not set
        if (viewportEnd === 0 && pxPerSec > 0) {
          const initialViewportEnd = width / pxPerSec;
          setViewport(0, initialViewportEnd);
        }
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [pxPerSec, viewportEnd, setViewport]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || pxPerSec <= 0) return;

    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const viewportWidth = containerWidth;
    const timeWidth = viewportWidth / pxPerSec;

    const newViewportStart = scrollLeft / pxPerSec;
    const newViewportEnd = newViewportStart + timeWidth;

    setViewport(newViewportStart, newViewportEnd);
  }, [containerWidth, pxPerSec, setViewport]);

  const handleSeek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      onTimeUpdate?.(time);
    },
    [setCurrentTime, onTimeUpdate]
  );

  const handlePlayheadSeek = useCallback(
    (clientX: number, updateState = false) => {
      if (!containerRectRef.current || !playheadLineRef.current) return;

      const relativeX = clientX - containerRectRef.current.left;
      const time = viewportStart + (relativeX / pxPerSec);
      const clampedTime = Math.max(0, Math.min(project.duration, time));

      // Update ref for instant tracking
      dragTimeRef.current = clampedTime;

      // Direct DOM manipulation for instant visual feedback
      const newLeft = (clampedTime - viewportStart) * pxPerSec - 2;
      playheadLineRef.current.style.left = `${newLeft}px`;
      // Disable transitions during drag for instant response
      playheadLineRef.current.style.transition = 'none';

      // Only update React state when requested (drag end)
      if (updateState) {
        setCurrentTime(clampedTime);
        onTimeUpdate?.(clampedTime);
      }
    },
    [viewportStart, pxPerSec, project.duration, setCurrentTime, onTimeUpdate]
  );

  const handlePlayheadMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDraggingPlayhead && containerRectRef.current && playheadLineRef.current) {
        // Position line exactly at cursor
        const rect = containerRectRef.current;
        const relativeX = event.clientX - rect.left;
        const time = viewportStart + (relativeX / pxPerSec);
        const clampedTime = Math.max(0, Math.min(project.duration, time));

        // Update ref for tracking
        dragTimeRef.current = clampedTime;

        // Position line directly at cursor, constrained to track area
        const minLeft = -2;
        const maxLeft = rect.width - 2;
        const cursorLeft = event.clientX - rect.left - 2;
        const constrainedLeft = Math.max(minLeft, Math.min(maxLeft, cursorLeft));

        playheadLineRef.current.style.left = `${constrainedLeft}px`;
      }
    },
    [isDraggingPlayhead, viewportStart, pxPerSec, project.duration]
  );

  const handlePlayheadMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false);
    containerRectRef.current = null; // Clear cached rect

    // Re-enable transitions after drag
    if (playheadLineRef.current) {
      playheadLineRef.current.style.transition = '';
    }

    // Re-enable pointer events
    document.body.style.pointerEvents = '';

    // Sync React state with final drag position
    setCurrentTime(dragTimeRef.current);
    onTimeUpdate?.(dragTimeRef.current);
  }, [setCurrentTime, onTimeUpdate]);

  useEffect(() => {
    if (isDraggingPlayhead) {
      document.addEventListener('mousemove', handlePlayheadMouseMove);
      document.addEventListener('mouseup', handlePlayheadMouseUp);
      return () => {
        document.removeEventListener('mousemove', handlePlayheadMouseMove);
        document.removeEventListener('mouseup', handlePlayheadMouseUp);
      };
    }
  }, [isDraggingPlayhead, handlePlayheadMouseMove, handlePlayheadMouseUp]);

  // Keep dragTimeRef in sync with currentTime when not dragging
  useEffect(() => {
    if (!isDraggingPlayhead) {
      dragTimeRef.current = currentTime;
    }
  }, [currentTime, isDraggingPlayhead]);

  useEffect(() => {
    if (!scrollContainerRef.current || !isPlaying || !uiSettings.enablePlayheadSync) return;

    const playheadX = timelineMath.timeToPx(currentTime, pxPerSec, 0);
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const containerWidth = scrollContainerRef.current.clientWidth;

    if (playheadX < scrollLeft || playheadX > scrollLeft + containerWidth) {
      const newScrollLeft = Math.max(0, playheadX - containerWidth / 2);
      scrollContainerRef.current.scrollLeft = newScrollLeft;
    }
  }, [currentTime, pxPerSec, isPlaying, uiSettings.enablePlayheadSync]);

  const totalContentWidth = Math.max(
    (project?.duration || 0) * (pxPerSec || 50),
    containerWidth || 800
  );

  return (
    <div
      className={cn(
        'flex flex-col bg-card border rounded-lg overflow-hidden shadow-sm',
        className
      )}
      style={{ height }}
    >
      <PlaybackControls />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex" ref={containerRef}>
          <div className="w-48 bg-muted/30 border-r overflow-y-auto">
            {project.tracks
              .filter((track) => track.visible)
              .map((track) => (
                <div
                  key={track.id}
                  className="flex items-center px-3 border-b text-sm font-medium"
                  style={{ height: track.height }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                  {track.name}
                </div>
              ))}
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-auto cursor-pointer relative"
            style={{ backgroundColor: 'hsl(var(--timeline-track))' }}
            onScroll={handleScroll}
            onMouseDown={(e) => {
              // Add seeking functionality to track area
              e.preventDefault();
              e.stopPropagation();

              // Cache container rect for fast dragging
              if (scrollContainerRef.current) {
                containerRectRef.current = scrollContainerRef.current.getBoundingClientRect();
              }

              setIsDraggingPlayhead(true);
              // Start dragging - no state update, just visual feedback
              handlePlayheadSeek(e.clientX, false);

              // Disable pointer events on body to prevent interference
              document.body.style.pointerEvents = 'none';
              e.currentTarget.style.pointerEvents = 'auto';
            }}
          >
            {/* Playhead line constrained to track area */}
            <div
              ref={playheadLineRef}
              className={cn(
                "absolute top-0 bottom-0 w-1 z-30 shadow-lg",
                isDraggingPlayhead
                  ? "cursor-grabbing"
                  : "cursor-grab hover:w-1.5"
              )}
              style={{
                left: `${(currentTime - viewportStart) * pxPerSec - 2}px`,
                backgroundColor: 'hsl(var(--timeline-playhead))',
                display: 'block',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Cache timeline container rect for fast dragging
                if (scrollContainerRef.current) {
                  containerRectRef.current = scrollContainerRef.current.getBoundingClientRect();
                }

                setIsDraggingPlayhead(true);
                // Calculate time based on mouse position relative to track container
                const rect = scrollContainerRef.current?.getBoundingClientRect();
                if (rect) {
                  const relativeX = e.clientX - rect.left;
                  const time = viewportStart + (relativeX / pxPerSec);
                  const clampedTime = Math.max(0, Math.min(project.duration, time));

                  // Update ref and visual position
                  dragTimeRef.current = clampedTime;
                  if (playheadLineRef.current) {
                    const newLeft = (clampedTime - viewportStart) * pxPerSec - 2;
                    playheadLineRef.current.style.left = `${newLeft}px`;
                    playheadLineRef.current.style.transition = 'none';
                  }
                }

                // Disable pointer events on body to prevent interference
                document.body.style.pointerEvents = 'none';
                e.currentTarget.style.pointerEvents = 'auto';
              }}
              title={`Playhead: ${formatTime(currentTime, true)}`}
            />
            <div className="relative" style={{ width: totalContentWidth }}>
              {project.tracks.map((track) => (
                <TrackContainer
                  key={track.id}
                  track={track}
                  containerWidth={totalContentWidth}
                />
              ))}

              {project.selection && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-r-2 pointer-events-none z-10"
                  style={{
                    left: `${timelineMath.timeToPx(project.selection.start, pxPerSec, 0)}px`,
                    width: `${(project.selection.end - project.selection.start) * pxPerSec}px`,
                    backgroundColor: 'hsl(var(--timeline-selection))',
                    borderColor: 'hsl(var(--timeline-playhead))',
                  }}
                />
              )}

              {project.loop && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-r-2 border-dashed pointer-events-none z-10"
                  style={{
                    left: `${timelineMath.timeToPx(project.loop.start, pxPerSec, 0)}px`,
                    width: `${(project.loop.end - project.loop.start) * pxPerSec}px`,
                    borderColor: 'hsl(var(--timeline-playhead))',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-8 px-3 bg-muted/50 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(pxPerSec)}px/s</span>
          <span>Selection: {project.selection ? `${(project.selection.end - project.selection.start).toFixed(1)}s` : 'None'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{project.tracks.filter(t => t.visible).length} tracks</span>
          <span>{Math.round(project.duration)}s</span>
        </div>
      </div>
    </div>
  );
};
