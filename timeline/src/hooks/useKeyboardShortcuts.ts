import { useEffect, useMemo } from 'react';
import { useTimelineStore } from '@/lib/timeline-store';
import type { KeyboardShortcuts } from '@/types/timeline';

export const useKeyboardShortcuts = () => {
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    project,
    setZoom,
    selectedItems,
    deleteItems,
    clearSelection,
    undo,
    redo,
    setLoop,
  } = useTimelineStore();

  const shortcuts: KeyboardShortcuts = useMemo(() => ({
    'Space': () => {
      setIsPlaying(!isPlaying);
    },

    'ArrowLeft': () => {
      const nudgeAmount = 0.1;
      setCurrentTime(Math.max(0, currentTime - nudgeAmount));
    },

    'ArrowRight': () => {
      const nudgeAmount = 0.1;
      setCurrentTime(Math.min(project.duration, currentTime + nudgeAmount));
    },

    'Slash': () => {
      if (project.loop) {
        setLoop(undefined);
      } else if (project.selection) {
        setLoop(project.selection);
      }
    },

    'Equal': () => {
      const currentZoom = project.zoom.pxPerSec;
      const newZoom = Math.min(project.zoom.maxPxPerSec, currentZoom * 1.5);
      setZoom(newZoom);
    },

    'Minus': () => {
      const currentZoom = project.zoom.pxPerSec;
      const newZoom = Math.max(project.zoom.minPxPerSec, currentZoom / 1.5);
      setZoom(newZoom);
    },

    'Escape': () => {
      clearSelection();
    },

    'Delete': () => {
      if (selectedItems.length > 0) {
        deleteItems(selectedItems);
      }
    },

    'Backspace': () => {
      if (selectedItems.length > 0) {
        deleteItems(selectedItems);
      }
    },
  }), [
    isPlaying, setIsPlaying,
    currentTime, setCurrentTime,
    project.duration, project.loop, project.selection, project.zoom,
    setLoop, setZoom, clearSelection,
    selectedItems, deleteItems
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      // Handle modifier key combinations
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            return;
          case 'y':
            event.preventDefault();
            redo();
            return;
        }
      }

      // Handle basic shortcuts
      const shortcutKey = event.key as keyof KeyboardShortcuts;
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, undo, redo]);

  return shortcuts;
};