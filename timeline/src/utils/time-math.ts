import type { TimeRange, TimelineMath } from '@/types/timeline';

export const timelineMath: TimelineMath = {
  pxToTime: (px: number, pxPerSec: number, offset = 0): number => {
    return (px + offset) / pxPerSec;
  },

  timeToPx: (time: number, pxPerSec: number, offset = 0): number => {
    return time * pxPerSec - offset;
  },

  snapToGrid: (time: number, gridSize: number, tolerance: number): number => {
    const nearestGrid = Math.round(time / gridSize) * gridSize;
    const distance = Math.abs(time - nearestGrid);
    return distance <= tolerance ? nearestGrid : time;
  },

  getVisibleRange: (viewportWidth: number, pxPerSec: number, offset: number): TimeRange => {
    const start = offset / pxPerSec;
    const end = (offset + viewportWidth) / pxPerSec;
    return { start, end };
  },
};

export const formatTime = (seconds: number, showMs = false): string => {
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = Math.floor(absSeconds % 60);
  const ms = Math.floor((absSeconds % 1) * 1000);

  const sign = seconds < 0 ? '-' : '';

  if (hours > 0) {
    const formatted = `${sign}${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return showMs ? `${formatted}.${ms.toString().padStart(3, '0')}` : formatted;
  }

  const formatted = `${sign}${minutes}:${secs.toString().padStart(2, '0')}`;
  return showMs ? `${formatted}.${ms.toString().padStart(3, '0')}` : formatted;
};

export const parseTime = (timeString: string): number => {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

export const constrainTime = (time: number, min = 0, max = Infinity): number => {
  return Math.max(min, Math.min(max, time));
};

export const getTimeRangeOverlap = (range1: TimeRange, range2: TimeRange): TimeRange | null => {
  const start = Math.max(range1.start, range2.start);
  const end = Math.min(range1.end, range2.end);

  if (start >= end) {
    return null;
  }

  return { start, end };
};

export const isTimeInRange = (time: number, range: TimeRange): boolean => {
  return time >= range.start && time <= range.end;
};

export const getOptimalGridSize = (pxPerSec: number): number => {
  const targetGridPx = 40;
  const baseGrid = targetGridPx / pxPerSec;

  const intervals = [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

  return intervals.reduce((prev, curr) => {
    return Math.abs(curr - baseGrid) < Math.abs(prev - baseGrid) ? curr : prev;
  });
};

export const getTickPositions = (
  viewStart: number,
  viewEnd: number,
  pxPerSec: number,
  containerWidth: number
): Array<{ time: number; px: number; label: string; isMajor: boolean }> => {
  const gridSize = getOptimalGridSize(pxPerSec);
  const subGridSize = gridSize / 5;

  const startTick = Math.floor(viewStart / subGridSize) * subGridSize;
  const endTick = Math.ceil(viewEnd / subGridSize) * subGridSize;

  const ticks: Array<{ time: number; px: number; label: string; isMajor: boolean }> = [];

  for (let time = startTick; time <= endTick; time += subGridSize) {
    const px = timelineMath.timeToPx(time, pxPerSec, viewStart * pxPerSec);
    if (px >= -50 && px <= containerWidth + 50) {
      const isMajor = Math.abs(time % gridSize) < 0.001;
      ticks.push({
        time,
        px,
        label: isMajor ? formatTime(time) : '',
        isMajor,
      });
    }
  }

  return ticks;
};