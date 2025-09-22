# Timeline UI - Professional Multi-Track Timeline Editor

A production-ready, accessible, performant multi-track timeline UI built with modern web technologies. Features comprehensive light/dark theme support, drag & drop interactions, keyboard controls, and virtualization for long media.

![Timeline UI Screenshot](https://via.placeholder.com/800x400/1f2937/ffffff?text=Timeline+UI+Demo)

**Built with:** React 19 • Next.js 15 • TypeScript • Tailwind CSS • shadcn/ui

## ✨ Features

### Core Timeline Features
- **Multi-track support**: Video, audio, transcript, markers, and asset tracks
- **Timeline ruler** with zoomable time scale and smooth playhead
- **Clip tokens** with drag & drop, resize, and selection
- **Virtualization** for smooth performance with long media (30+ minutes)
- **Real-time playback sync** with RAF-based updates

### Interactions & Controls
- **Play/pause, seek, scrub** with low-latency response
- **Keyboard shortcuts**: Space, arrow keys, zoom, undo/redo
- **Selection and loop regions** with visual indicators
- **Snap-to-grid** with configurable tolerance
- **Undo/redo stack** for all editing operations

### Theming & Accessibility
- **Full light/dark theme support** with design tokens
- **Auto-detect OS preference** with manual override
- **WCAG AA contrast compliance** for all text/control combinations
- **Keyboard navigation** and focus management
- **Screen reader support** with ARIA labels
- **Reduced motion support** for accessibility

### Performance & Technical
- **Virtualized rendering** for visible time windows only
- **Canvas-based ruler** for smooth 60fps updates
- **RequestAnimationFrame** for playhead synchronization
- **Double-precision time math** utilities
- **Zustand state management** with history

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to see the timeline demo.

## 📖 Usage

### Basic Timeline

```tsx
import { Timeline } from '@/components/timeline/Timeline';
import { ThemeProvider } from '@/lib/theme';

function App() {
  return (
    <ThemeProvider>
      <Timeline
        height={600}
        onTimeUpdate={(time) => console.log('Current time:', time)}
      />
    </ThemeProvider>
  );
}
```

### With Media Element

```tsx
import { useMediaSync } from '@/hooks/useMediaSync';
import { useRef } from 'react';

function VideoTimeline() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { seekTo } = useMediaSync({
    mediaElement: videoRef.current,
    onTimeUpdate: (time) => console.log('Synced time:', time),
  });

  return (
    <div>
      <video ref={videoRef} src="/your-video.mp4" />
      <Timeline onTimeUpdate={seekTo} />
    </div>
  );
}
```

## 🎨 Theming

The timeline uses a comprehensive design token system supporting light and dark themes.

### Theme API

```tsx
import { useTheme } from '@/lib/theme';

function ThemeControls() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('auto')}>Auto</button>
      <p>Current: {resolvedTheme}</p>
    </div>
  );
}
```

### Design Tokens

All colors and spacing use CSS variables that automatically switch between light/dark modes:

```css
/* Light theme */
:root {
  --color-timeline-bg-page: #ffffff;
  --color-timeline-playhead: #007bff;
  --color-timeline-token-bg: #e3f2fd;
  /* ... */
}

/* Dark theme */
[data-theme="dark"] {
  --color-timeline-bg-page: #0d1117;
  --color-timeline-playhead: #58a6ff;
  --color-timeline-token-bg: #1f2937;
  /* ... */
}
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←/→` | Nudge playhead ±0.1s |
| `/` | Toggle loop region |
| `+/-` | Zoom in/out |
| `Escape` | Clear selection |
| `Delete/Backspace` | Delete selected items |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Y` | Redo |

## 🏗️ Architecture

### Core Components

- **Timeline**: Main container with ruler, tracks, and controls
- **TimelineRuler**: Canvas-based ruler with time ticks and playhead
- **TrackContainer**: Individual track with virtualized item rendering
- **ClipToken**: Draggable/resizable clip with tooltip
- **PlaybackControls**: Transport controls, zoom, and settings

### State Management

Uses Zustand for predictable state management:

```tsx
import { useTimelineStore } from '@/lib/timeline-store';

const {
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  project,
  selectedItems,
  undo,
  redo
} = useTimelineStore();
```

### Time Math Utilities

Precise time ↔ pixel conversion utilities:

```tsx
import { timelineMath } from '@/utils/time-math';

// Convert time to pixel position
const x = timelineMath.timeToPx(30, 100, 0); // 30s at 100px/s

// Convert pixel to time
const time = timelineMath.pxToTime(3000, 100, 0); // 30s

// Snap to grid
const snapped = timelineMath.snapToGrid(30.15, 1, 0.1); // 30.0
```

## 📁 Project Structure

```
src/
├── components/
│   ├── timeline/
│   │   ├── core/           # Core timeline components
│   │   ├── controls/       # Playback controls
│   │   ├── tracks/         # Track containers
│   │   └── tokens/         # Clip tokens
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Core libraries (theme, store)
├── types/                  # TypeScript definitions
├── utils/                  # Utility functions
└── constants/              # Design tokens and constants
```

## 🧪 Testing

Run the development server to test:

```bash
pnpm dev
```

### Manual Testing Checklist

- ✅ Play/pause with spacebar
- ✅ Seek by clicking ruler
- ✅ Drag clips to move
- ✅ Resize clips by dragging edges
- ✅ Zoom with +/- keys
- ✅ Theme switching (light/dark/auto)
- ✅ Keyboard navigation
- ✅ Selection and loop regions
- ✅ Undo/redo operations

## 🚢 Production Ready Features

### Performance
- Virtualized rendering for 30+ minute media
- Canvas-based ruler for 60fps updates
- RAF-based playhead synchronization
- Optimized re-renders with React.memo

### Accessibility
- WCAG AA contrast compliance
- Keyboard navigation support
- Screen reader ARIA labels
- Reduced motion support

### Browser Support
- Modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
- Progressive enhancement for older browsers
- Responsive design for mobile/tablet

## 🙏 Acknowledgments

Built with:
- **React 19** & **Next.js 15** for the framework
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for component foundation
- **Zustand** for state management
- **Lucide React** for icons
