export interface TimelineProject {
  projectId: string;
  duration: number;
  zoom: {
    pxPerSec: number;
    minPxPerSec: number;
    maxPxPerSec: number;
  };
  tracks: Track[];
  playhead: number;
  selection?: TimeRange;
  loop?: TimeRange;
  settings: {
    snapToGrid: boolean;
    snapTolerance: number;
    playbackSpeed: number;
  };
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  visible: boolean;
  height: number;
  items: TrackItem[];
  color?: string;
  muted?: boolean;
  solo?: boolean;
  locked?: boolean;
}

export type TrackType = 'video' | 'audio' | 'transcript' | 'markers' | 'assets';

export interface TrackItem {
  id: string;
  start: number;
  end: number;
  text?: string;
  name?: string;
  speaker?: string;
  meta?: Record<string, unknown>;
  selected?: boolean;
  type?: string;
  duration?: number;
  color?: string;
  properties?: Record<string, unknown>;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface TranscriptToken extends TrackItem {
  word: string;
  confidence?: number;
  speaker?: string;
  punctuation?: string;
}

export interface VideoClip extends TrackItem {
  src: string;
  thumbnails?: string[];
  volume?: number;
  offset?: number;
}

export interface AudioClip extends TrackItem {
  src: string;
  waveform?: number[];
  volume?: number;
  offset?: number;
}

export interface Marker extends TrackItem {
  label: string;
  color?: string;
  type: 'chapter' | 'bookmark' | 'annotation';
}

export interface UISettings {
  enableTimeSelection: boolean;
  enablePlayheadSync: boolean;
  enableClipAnimations: boolean;
}

export interface TimelineState {
  project: TimelineProject;
  isPlaying: boolean;
  currentTime: number;
  viewportStart: number;
  viewportEnd: number;
  selectedItems: string[];
  dragState?: DragState;
  undoStack: TimelineProject[];
  redoStack: TimelineProject[];
  uiSettings: UISettings;
}

export interface DragState {
  type: 'move' | 'resize-start' | 'resize-end' | 'select';
  itemIds: string[];
  startTime: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  originalItems: TrackItem[];
}

export interface TimelineMath {
  pxToTime: (px: number, pxPerSec: number, offset?: number) => number;
  timeToPx: (time: number, pxPerSec: number, offset?: number) => number;
  snapToGrid: (time: number, gridSize: number, tolerance: number) => number;
  getVisibleRange: (viewportWidth: number, pxPerSec: number, offset: number) => TimeRange;
}

export interface KeyboardShortcuts {
  'Space': () => void;
  'ArrowLeft': () => void;
  'ArrowRight': () => void;
  'Slash': () => void;
  'Equal': () => void;
  'Minus': () => void;
  'Escape': () => void;
  'Delete': () => void;
  'Backspace': () => void;
}

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}