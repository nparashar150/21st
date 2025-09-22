import { useEffect, useRef, useCallback } from 'react';
import { useTimelineStore } from '@/lib/timeline-store';

interface UseMediaSyncOptions {
  mediaElement?: HTMLMediaElement;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

export const useMediaSync = ({ mediaElement, onTimeUpdate, onEnded }: UseMediaSyncOptions = {}) => {
  const rafRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    project,
  } = useTimelineStore();

  // Sync timeline playback with media element
  useEffect(() => {
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.currentTime = currentTime;
      mediaElement.play().catch(console.warn);
    } else {
      mediaElement.pause();
    }
  }, [isPlaying, mediaElement, currentTime]);

  // Sync playback speed
  useEffect(() => {
    if (mediaElement) {
      mediaElement.playbackRate = project.settings.playbackSpeed;
    }
  }, [mediaElement, project.settings.playbackSpeed]);

  // Handle loop playback
  useEffect(() => {
    if (!mediaElement || !project.loop) return;

    const handleTimeUpdate = () => {
      if (mediaElement.currentTime >= project.loop!.end) {
        mediaElement.currentTime = project.loop!.start;
        setCurrentTime(project.loop!.start);
      }
    };

    mediaElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
  }, [mediaElement, project.loop, setCurrentTime]);

  // Handle media ended
  useEffect(() => {
    if (!mediaElement) return;

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    mediaElement.addEventListener('ended', handleEnded);
    return () => mediaElement.removeEventListener('ended', handleEnded);
  }, [mediaElement, setIsPlaying, onEnded]);

  // RAF-based time sync for smooth playhead updates
  const updateTime = useCallback(() => {
    if (!isPlaying) return;

    const now = performance.now();
    const deltaTime = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;

    if (mediaElement) {
      // Sync with media element
      const mediaTime = mediaElement.currentTime;
      const timeDiff = Math.abs(mediaTime - currentTime);

      // Only update if there's a significant difference (avoid jitter)
      if (timeDiff > 0.1) {
        setCurrentTime(mediaTime);
        onTimeUpdate?.(mediaTime);
      }
    } else {
      // Manual time progression when no media element
      const newTime = currentTime + deltaTime * project.settings.playbackSpeed;

      if (project.loop && newTime >= project.loop.end) {
        setCurrentTime(project.loop.start);
        onTimeUpdate?.(project.loop.start);
      } else if (newTime >= project.duration) {
        setCurrentTime(project.duration);
        setIsPlaying(false);
        onEnded?.();
      } else {
        setCurrentTime(newTime);
        onTimeUpdate?.(newTime);
      }
    }

    rafRef.current = requestAnimationFrame(updateTime);
  }, [
    isPlaying,
    currentTime,
    mediaElement,
    project.duration,
    project.loop,
    project.settings.playbackSpeed,
    setCurrentTime,
    setIsPlaying,
    onTimeUpdate,
    onEnded,
  ]);

  // Start/stop RAF loop
  useEffect(() => {
    if (isPlaying) {
      lastUpdateTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(updateTime);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, updateTime]);

  // Seek function for external use
  const seekTo = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(project.duration, time));
      setCurrentTime(clampedTime);

      if (mediaElement) {
        mediaElement.currentTime = clampedTime;
      }

      onTimeUpdate?.(clampedTime);
    },
    [mediaElement, project.duration, setCurrentTime, onTimeUpdate]
  );

  return {
    seekTo,
    isPlaying,
    currentTime,
    duration: project.duration,
  };
};