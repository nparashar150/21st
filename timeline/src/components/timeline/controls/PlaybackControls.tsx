'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useTimelineStore } from '@/lib/timeline-store';
import { formatTime } from '@/utils/time-math';
import { cn } from '@/lib/utils';
import { exampleTimeline } from '@/data/example-timeline';
import { TimelineSettings } from './TimelineSettings';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Repeat,
  FileText,
} from 'lucide-react';

interface PlaybackControlsProps {
  className?: string;
}

export const PlaybackControls = ({ className }: PlaybackControlsProps) => {
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    project,
    setZoom,
    setPlaybackSpeed,
    toggleSnapToGrid,
    setLoop,
    undo,
    redo,
    undoStack,
    redoStack,
    loadProject,
    uiSettings,
  } = useTimelineStore();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(project.duration, currentTime + 10));
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(project.zoom.maxPxPerSec, project.zoom.pxPerSec * 1.5);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(project.zoom.minPxPerSec, project.zoom.pxPerSec / 1.5);
    setZoom(newZoom);
  };

  const handleSpeedChange = (values: number[]) => {
    setPlaybackSpeed(values[0]);
  };

  const handleToggleLoop = () => {
    if (project.loop) {
      setLoop(undefined);
    } else if (project.selection) {
      setLoop(project.selection);
    }
  };

  const handleLoadExample = () => {
    loadProject(exampleTimeline);
  };

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-3 p-3 bg-muted/30 border-b', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleLoadExample}>
              <FileText className="h-4 w-4 mr-1" />
              Load Example
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Load a sample timeline with video, audio, and transcript tracks</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 h-6">
          <Button variant="ghost" size="sm" onClick={handleSkipBack}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSkipForward}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2 text-sm font-mono h-6">
          <span>{formatTime(currentTime, true)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatTime(project.duration)}</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2 h-6">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <div className="w-20 flex items-center">
            <Slider
              value={[project.settings.playbackSpeed]}
              onValueChange={handleSpeedChange}
              min={0.25}
              max={2}
              step={0.25}
              className="flex-1"
            />
          </div>
          <span className="text-xs w-8 text-center">{project.settings.playbackSpeed}x</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={project.loop ? 'default' : 'ghost'}
              size="sm"
              onClick={handleToggleLoop}
              disabled={!uiSettings.enableTimeSelection}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {!uiSettings.enableTimeSelection
                ? 'Enable Time Selection in settings to use loop'
                : project.loop
                  ? 'Disable loop'
                  : 'Loop selected time range'
              }
            </p>
          </TooltipContent>
        </Tooltip>

        <Button
          variant={project.settings.snapToGrid ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleSnapToGrid}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 h-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={project.zoom.pxPerSec <= project.zoom.minPxPerSec}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-24 flex items-center">
            <Slider
              value={[project.zoom.pxPerSec]}
              onValueChange={(values) => setZoom(values[0])}
              min={project.zoom.minPxPerSec}
              max={project.zoom.maxPxPerSec}
              step={1}
              className="flex-1"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={project.zoom.pxPerSec >= project.zoom.maxPxPerSec}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 h-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={undoStack.length === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={redoStack.length === 0}
            className="rotate-180"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <TimelineSettings />
      </div>
    </TooltipProvider>
  );
};