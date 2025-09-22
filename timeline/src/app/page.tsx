'use client';

import { useEffect } from 'react';
import { Timeline } from '@/components/timeline/Timeline';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTimelineStore } from '@/lib/timeline-store';
import { useMediaSync } from '@/hooks/useMediaSync';

// Sample data for demonstration
const sampleData = {
  projectId: 'demo-project',
  duration: 120, // 2 minutes
  zoom: {
    pxPerSec: 100,
    minPxPerSec: 10,
    maxPxPerSec: 1000,
  },
  tracks: [
    {
      id: 'video-1',
      type: 'video' as const,
      name: 'Main Video',
      visible: true,
      height: 80,
      items: [
        {
          id: 'video-clip-1',
          start: 0,
          end: 30,
          text: 'Introduction Scene',
          meta: { src: '/demo-video.mp4' },
        },
        {
          id: 'video-clip-2',
          start: 35,
          end: 65,
          text: 'Main Content',
          meta: { src: '/demo-video-2.mp4' },
        },
        {
          id: 'video-clip-3',
          start: 70,
          end: 120,
          text: 'Conclusion',
          meta: { src: '/demo-video-3.mp4' },
        },
      ],
    },
    {
      id: 'audio-1',
      type: 'audio' as const,
      name: 'Background Music',
      visible: true,
      height: 60,
      items: [
        {
          id: 'audio-clip-1',
          start: 0,
          end: 120,
          text: 'Ambient Music Track',
          meta: { src: '/background-music.mp3', volume: 0.3 },
        },
      ],
    },
    {
      id: 'transcript-1',
      type: 'transcript' as const,
      name: 'Transcript',
      visible: true,
      height: 40,
      items: [
        {
          id: 'word-1',
          start: 2,
          end: 2.5,
          text: 'Welcome',
          speaker: 'Narrator',
        },
        {
          id: 'word-2',
          start: 2.5,
          end: 2.8,
          text: 'to',
          speaker: 'Narrator',
        },
        {
          id: 'word-3',
          start: 2.8,
          end: 3.2,
          text: 'our',
          speaker: 'Narrator',
        },
        {
          id: 'word-4',
          start: 3.2,
          end: 3.8,
          text: 'timeline',
          speaker: 'Narrator',
        },
        {
          id: 'word-5',
          start: 3.8,
          end: 4.3,
          text: 'demo.',
          speaker: 'Narrator',
        },
        {
          id: 'word-6',
          start: 36,
          end: 36.4,
          text: 'This',
          speaker: 'Narrator',
        },
        {
          id: 'word-7',
          start: 36.4,
          end: 36.7,
          text: 'is',
          speaker: 'Narrator',
        },
        {
          id: 'word-8',
          start: 36.7,
          end: 37.0,
          text: 'the',
          speaker: 'Narrator',
        },
        {
          id: 'word-9',
          start: 37.0,
          end: 37.4,
          text: 'main',
          speaker: 'Narrator',
        },
        {
          id: 'word-10',
          start: 37.4,
          end: 37.9,
          text: 'content',
          speaker: 'Narrator',
        },
        {
          id: 'word-11',
          start: 37.9,
          end: 38.4,
          text: 'section.',
          speaker: 'Narrator',
        },
      ],
    },
    {
      id: 'markers-1',
      type: 'markers' as const,
      name: 'Chapter Markers',
      visible: true,
      height: 30,
      items: [
        {
          id: 'marker-1',
          start: 0,
          end: 0.1,
          text: 'Intro',
          type: 'chapter',
        },
        {
          id: 'marker-2',
          start: 35,
          end: 35.1,
          text: 'Main Content',
          type: 'chapter',
        },
        {
          id: 'marker-3',
          start: 70,
          end: 70.1,
          text: 'Conclusion',
          type: 'chapter',
        },
      ],
    },
  ],
  playhead: 0,
  settings: {
    snapToGrid: true,
    snapTolerance: 0.1,
    playbackSpeed: 1,
  },
};

export default function TimelineDemo() {
  const { project } = useTimelineStore();

  // Initialize with sample data
  useEffect(() => {
    const { project: currentProject, ...store } = useTimelineStore.getState();

    // Only initialize if we don't have tracks
    if (currentProject.tracks.length === 0) {
      store.project = { ...currentProject, ...sampleData };
      useTimelineStore.setState({ project: store.project });
    }
  }, []);

  // Media sync for demo (without actual media element)
  const { seekTo, isPlaying, currentTime } = useMediaSync({
    onTimeUpdate: (time) => {
      console.log('Timeline time update:', time);
    },
    onEnded: () => {
      console.log('Timeline playback ended');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Timeline UI</h1>
              <p className="text-sm text-muted-foreground">
                Professional multi-track timeline editor
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-medium mb-2">Keyboard Shortcuts:</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
                    <span className="text-muted-foreground">Play/Pause</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">←/→</kbd>
                    <span className="text-muted-foreground">Nudge playhead</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">+/-</kbd>
                    <span className="text-muted-foreground">Zoom in/out</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Mouse Interactions:</h3>
                <div className="space-y-1.5 text-muted-foreground">
                  <div>• Click ruler to seek to time</div>
                  <div>• Drag clips to reposition</div>
                  <div>• Drag clip edges to resize</div>
                  <div>• Drag empty space to select region</div>
                </div>
              </div>
            </div>
          </div>

          <Timeline height={500} />

          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-muted-foreground">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Time: </span>
                <span className="font-mono">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Zoom: </span>
                <span>{project.zoom.pxPerSec}px/s</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tracks: </span>
                <span>{project.tracks.filter(t => t.visible).length}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
