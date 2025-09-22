import type { TimelineProject } from '@/types/timeline';

export const exampleTimeline: TimelineProject = {
  projectId: 'example-project',
  duration: 120, // 2 minutes
  playhead: 0,
  zoom: {
    pxPerSec: 50,
    minPxPerSec: 10,
    maxPxPerSec: 1000,
  },
  tracks: [
    {
      id: 'video-track-1',
      name: 'Main Video',
      type: 'video',
      height: 60,
      visible: true,
      locked: false,
      muted: false,
      items: [
        {
          id: 'video-clip-1',
          text: 'Intro Scene',
          start: 0,
          end: 15,
          properties: {
            volume: 1,
            fade: { in: 0.5, out: 0.5 },
          },
        },
        {
          id: 'video-clip-2',
          name: 'Main Content',
          start: 15,
          end: 90,
          properties: {
            volume: 1,
            fade: { in: 0.3, out: 1.0 },
          },
        },
        {
          id: 'video-clip-3',
          name: 'Outro Scene',
          start: 90,
          end: 120,
          properties: {
            volume: 1,
            fade: { in: 0, out: 2.0 },
          },
        },
      ],
    },
    {
      id: 'audio-track-1',
      name: 'Background Music',
      type: 'audio',
      height: 60,
      visible: true,
      locked: false,
      muted: false,
      items: [
        {
          id: 'audio-clip-1',
          name: 'Ambient Music',
          start: 5,
          end: 110,
          properties: {
            volume: 0.3,
            fade: { in: 2.0, out: 3.0 },
          },
        },
      ],
    },
    {
      id: 'audio-track-2',
      name: 'Sound Effects',
      type: 'audio',
      height: 60,
      visible: true,
      locked: false,
      muted: false,
      items: [
        {
          id: 'sfx-clip-1',
          name: 'Swoosh',
          start: 14.5,
          end: 16,
          duration: 1.5,
          properties: {
            volume: 0.8,
            fade: { in: 0, out: 0.2 },
          },
        },
        {
          id: 'sfx-clip-2',
          name: 'Impact',
          start: 89,
          end: 91.5,
          duration: 2.5,
          properties: {
            volume: 0.9,
            fade: { in: 0.1, out: 0.3 },
          },
        },
      ],
    },
    {
      id: 'transcript-track-1',
      name: 'Captions',
      type: 'transcript',
      height: 60,
      visible: true,
      locked: false,
      muted: false,
      items: [
        {
          id: 'caption-1',
          name: 'Welcome to our tutorial',
          start: 2,
          end: 5,
          properties: {
            name: 'Welcome to our tutorial',
            fontSize: 24,
            position: 'bottom',
          },
        },
        {
          id: 'caption-2',
          name: 'Today we will learn about...',
          start: 15.5,
          end: 19,
          duration: 3.5,
          properties: {
            name: 'Today we will learn about creating timelines',
            fontSize: 24,
            position: 'bottom',
          },
        },
        {
          id: 'caption-3',
          name: 'Thank you for watching',
          start: 115,
          end: 118,
          properties: {
            name: 'Thank you for watching!',
            fontSize: 24,
            position: 'bottom',
          },
        },
      ],
    },
    {
      id: 'markers-track-1',
      name: 'Scene Markers',
      type: 'markers',
      height: 60,
      visible: true,
      locked: false,
      muted: false,
      items: [
        {
          id: 'marker-1',
          name: 'Scene 1: Introduction',
          start: 0,
          end: 0.1,
          duration: 0.1,
          properties: {
            label: 'Scene 1: Introduction',
          },
        },
        {
          id: 'marker-2',
          name: 'Scene 2: Main Content',
          start: 15,
          end: 15.1,
          duration: 0.1,
          properties: {
            label: 'Scene 2: Main Content',
          },
        },
        {
          id: 'marker-3',
          name: 'Scene 3: Conclusion',
          start: 90,
          end: 90.1,
          duration: 0.1,
          properties: {
            label: 'Scene 3: Conclusion',
          },
        },
      ],
    },
  ],
  selection: undefined,
  loop: {
    start: 15,
    end: 90,
  },
  settings: {
    snapToGrid: true,
    snapTolerance: 0.1,
    playbackSpeed: 1,
  },
};