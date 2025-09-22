import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { TimelineState, TimelineProject, TrackItem, TimeRange, UISettings } from '@/types/timeline';
import { timelineMath } from '@/utils/time-math';

interface TimelineActions {
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (pxPerSec: number) => void;
  setViewport: (start: number, end: number) => void;
  selectItems: (itemIds: string[]) => void;
  addToSelection: (itemId: string) => void;
  clearSelection: () => void;
  moveItems: (itemIds: string[], deltaTime: number) => void;
  resizeItem: (itemId: string, newStart: number, newEnd: number) => void;
  splitItem: (itemId: string, splitTime: number) => void;
  mergeItems: (itemIds: string[]) => void;
  deleteItems: (itemIds: string[]) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  setPlayhead: (time: number) => void;
  setSelection: (range: TimeRange | undefined) => void;
  setLoop: (range: TimeRange | undefined) => void;
  toggleSnapToGrid: () => void;
  setSnapTolerance: (tolerance: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  loadProject: (project: TimelineProject) => void;
  toggleTimeSelection: () => void;
  togglePlayheadSync: () => void;
  toggleClipAnimations: () => void;
}

const createInitialProject = (): TimelineProject => ({
  projectId: 'default',
  duration: 300,
  zoom: {
    pxPerSec: 100,
    minPxPerSec: 10,
    maxPxPerSec: 1000,
  },
  tracks: [
    {
      id: 'video-1',
      type: 'video',
      name: 'Video Track',
      visible: true,
      height: 80,
      items: [],
    },
    {
      id: 'audio-1',
      type: 'audio',
      name: 'Audio Track',
      visible: true,
      height: 60,
      items: [],
    },
    {
      id: 'transcript-1',
      type: 'transcript',
      name: 'Transcript',
      visible: true,
      height: 40,
      items: [],
    },
  ],
  playhead: 0,
  settings: {
    snapToGrid: true,
    snapTolerance: 0.1,
    playbackSpeed: 1,
  },
});

export const useTimelineStore = create<TimelineState & TimelineActions>()(
  subscribeWithSelector((set, get) => ({
    project: createInitialProject(),
    isPlaying: false,
    currentTime: 0,
    viewportStart: 0,
    viewportEnd: 10,
    selectedItems: [],
    undoStack: [],
    redoStack: [],

    // UI Settings
    uiSettings: {
      enableTimeSelection: true,
      enablePlayheadSync: true,
      enableClipAnimations: false,
    },

    setCurrentTime: (time: number) => {
      set((state) => ({
        currentTime: Math.max(0, Math.min(time, state.project.duration)),
        project: {
          ...state.project,
          playhead: Math.max(0, Math.min(time, state.project.duration)),
        },
      }));
    },

    setIsPlaying: (playing: boolean) => {
      set({ isPlaying: playing });
    },

    setZoom: (pxPerSec: number) => {
      set((state) => {
        const { minPxPerSec, maxPxPerSec } = state.project.zoom;
        const newPxPerSec = Math.max(minPxPerSec, Math.min(maxPxPerSec, pxPerSec));
        return {
          project: {
            ...state.project,
            zoom: {
              ...state.project.zoom,
              pxPerSec: newPxPerSec,
            },
          },
        };
      });
    },

    setViewport: (start: number, end: number) => {
      set({ viewportStart: start, viewportEnd: end });
    },

    selectItems: (itemIds: string[]) => {
      set({ selectedItems: itemIds });
    },

    addToSelection: (itemId: string) => {
      set((state) => ({
        selectedItems: [...new Set([...state.selectedItems, itemId])],
      }));
    },

    clearSelection: () => {
      set({ selectedItems: [] });
    },

    pushHistory: () => {
      set((state) => ({
        undoStack: [...state.undoStack, structuredClone(state.project)].slice(-50),
        redoStack: [],
      }));
    },

    moveItems: (itemIds: string[], deltaTime: number) => {
      const { pushHistory } = get();
      pushHistory();

      set((state) => {
        const newTracks = state.project.tracks.map((track) => ({
          ...track,
          items: track.items.map((item) => {
            if (itemIds.includes(item.id)) {
              const newStart = Math.max(0, item.start + deltaTime);
              const duration = item.end - item.start;
              return {
                ...item,
                start: newStart,
                end: newStart + duration,
              };
            }
            return item;
          }),
        }));

        return {
          project: {
            ...state.project,
            tracks: newTracks,
          },
        };
      });
    },

    resizeItem: (itemId: string, newStart: number, newEnd: number) => {
      const { pushHistory } = get();
      pushHistory();

      set((state) => {
        const newTracks = state.project.tracks.map((track) => ({
          ...track,
          items: track.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                start: Math.max(0, newStart),
                end: Math.max(newStart + 0.01, newEnd),
              };
            }
            return item;
          }),
        }));

        return {
          project: {
            ...state.project,
            tracks: newTracks,
          },
        };
      });
    },

    splitItem: (itemId: string, splitTime: number) => {
      const { pushHistory } = get();
      pushHistory();

      set((state) => {
        const newTracks = state.project.tracks.map((track) => {
          const itemIndex = track.items.findIndex((item) => item.id === itemId);
          if (itemIndex === -1) return track;

          const item = track.items[itemIndex];
          if (splitTime <= item.start || splitTime >= item.end) return track;

          const newItems = [...track.items];
          const firstPart = {
            ...item,
            id: `${item.id}-1`,
            end: splitTime,
          };
          const secondPart = {
            ...item,
            id: `${item.id}-2`,
            start: splitTime,
          };

          newItems.splice(itemIndex, 1, firstPart, secondPart);

          return {
            ...track,
            items: newItems,
          };
        });

        return {
          project: {
            ...state.project,
            tracks: newTracks,
          },
        };
      });
    },

    mergeItems: (itemIds: string[]) => {
      const { pushHistory } = get();
      pushHistory();

      set((state) => {
        const newTracks = state.project.tracks.map((track) => {
          const itemsToMerge = track.items.filter((item) => itemIds.includes(item.id));
          if (itemsToMerge.length < 2) return track;

          const sortedItems = itemsToMerge.sort((a, b) => a.start - b.start);
          const mergedItem = {
            ...sortedItems[0],
            id: `merged-${Date.now()}`,
            start: sortedItems[0].start,
            end: sortedItems[sortedItems.length - 1].end,
            text: sortedItems.map((item) => item.text || '').join(' '),
          };

          const remainingItems = track.items.filter((item) => !itemIds.includes(item.id));

          return {
            ...track,
            items: [...remainingItems, mergedItem],
          };
        });

        return {
          project: {
            ...state.project,
            tracks: newTracks,
          },
          selectedItems: [],
        };
      });
    },

    deleteItems: (itemIds: string[]) => {
      const { pushHistory } = get();
      pushHistory();

      set((state) => {
        const newTracks = state.project.tracks.map((track) => ({
          ...track,
          items: track.items.filter((item) => !itemIds.includes(item.id)),
        }));

        return {
          project: {
            ...state.project,
            tracks: newTracks,
          },
          selectedItems: state.selectedItems.filter((id) => !itemIds.includes(id)),
        };
      });
    },

    undo: () => {
      set((state) => {
        if (state.undoStack.length === 0) return state;

        const previousProject = state.undoStack[state.undoStack.length - 1];
        const newUndoStack = state.undoStack.slice(0, -1);
        const newRedoStack = [...state.redoStack, state.project];

        return {
          project: previousProject,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          selectedItems: [],
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.redoStack.length === 0) return state;

        const nextProject = state.redoStack[state.redoStack.length - 1];
        const newRedoStack = state.redoStack.slice(0, -1);
        const newUndoStack = [...state.undoStack, state.project];

        return {
          project: nextProject,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          selectedItems: [],
        };
      });
    },

    setPlayhead: (time: number) => {
      set((state) => ({
        project: {
          ...state.project,
          playhead: Math.max(0, Math.min(time, state.project.duration)),
        },
      }));
    },

    setSelection: (range: TimeRange | undefined) => {
      set((state) => ({
        project: {
          ...state.project,
          selection: range,
        },
      }));
    },

    setLoop: (range: TimeRange | undefined) => {
      set((state) => ({
        project: {
          ...state.project,
          loop: range,
        },
      }));
    },

    toggleSnapToGrid: () => {
      set((state) => ({
        project: {
          ...state.project,
          settings: {
            ...state.project.settings,
            snapToGrid: !state.project.settings.snapToGrid,
          },
        },
      }));
    },

    setSnapTolerance: (tolerance: number) => {
      set((state) => ({
        project: {
          ...state.project,
          settings: {
            ...state.project.settings,
            snapTolerance: tolerance,
          },
        },
      }));
    },

    setPlaybackSpeed: (speed: number) => {
      set((state) => ({
        project: {
          ...state.project,
          settings: {
            ...state.project.settings,
            playbackSpeed: speed,
          },
        },
      }));
    },

    loadProject: (project: TimelineProject) => {
      const { pushHistory } = get();
      pushHistory();

      set({
        project,
        currentTime: 0,
        viewportStart: 0,
        viewportEnd: Math.min(project.duration, 10),
        selectedItems: [],
        isPlaying: false,
      });
    },

    toggleTimeSelection: () => {
      set((state) => ({
        uiSettings: {
          ...state.uiSettings,
          enableTimeSelection: !state.uiSettings.enableTimeSelection,
        },
      }));
    },

    togglePlayheadSync: () => {
      set((state) => ({
        uiSettings: {
          ...state.uiSettings,
          enablePlayheadSync: !state.uiSettings.enablePlayheadSync,
        },
      }));
    },

    toggleClipAnimations: () => {
      set((state) => ({
        uiSettings: {
          ...state.uiSettings,
          enableClipAnimations: !state.uiSettings.enableClipAnimations,
        },
      }));
    },
  }))
);