import { useEffect, useCallback } from 'react';
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

  const shortcuts: KeyboardShortcuts = {
    'Space': useCallback(() => {
      setIsPlaying(!isPlaying);
    }, [isPlaying, setIsPlaying]),

    'ArrowLeft': useCallback(() => {
      const nudgeAmount = 0.1;
      setCurrentTime(Math.max(0, currentTime - nudgeAmount));
    }, [currentTime, setCurrentTime]),

    'ArrowRight': useCallback(() => {
      const nudgeAmount = 0.1;
      setCurrentTime(Math.min(project.duration, currentTime + nudgeAmount));
    }, [currentTime, setCurrentTime, project.duration]),

    'Slash': useCallback(() => {
      if (project.loop) {
        setLoop(undefined);
      } else if (project.selection) {
        setLoop(project.selection);
      }
    }, [project.loop, project.selection, setLoop]),

    'Equal': useCallback(() => {
      const currentZoom = project.zoom.pxPerSec;
      const newZoom = Math.min(project.zoom.maxPxPerSec, currentZoom * 1.5);
      setZoom(newZoom);
    }, [project.zoom, setZoom]),

    'Minus': useCallback(() => {
      const currentZoom = project.zoom.pxPerSec;
      const newZoom = Math.max(project.zoom.minPxPerSec, currentZoom / 1.5);
      setZoom(newZoom);
    }, [project.zoom, setZoom]),

    'Escape': useCallback(() => {
      clearSelection();
    }, [clearSelection]),

    'Delete': useCallback(() => {
      if (selectedItems.length > 0) {
        deleteItems(selectedItems);
      }
    }, [selectedItems, deleteItems]),

    'Backspace': useCallback(() => {
      if (selectedItems.length > 0) {
        deleteItems(selectedItems);
      }
    }, [selectedItems, deleteItems]),
  };

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