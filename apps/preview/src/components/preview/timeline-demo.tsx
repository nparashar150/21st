'use client';

import { useState } from 'react';
import { Timeline, createTimeline, type TimelineTrack } from '@21st/timeline';

export default function TimelineDemo() {
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'empty-video',
      name: 'Video Track',
      type: 'video',
      height: 60,
      visible: true,
      items: []
    },
    {
      id: 'empty-audio',
      name: 'Audio Track',
      type: 'audio',
      height: 60,
      visible: true,
      items: []
    }
  ]);
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoadingExample, setIsLoadingExample] = useState(false);

  const handleLoadExample = () => {
    setIsLoadingExample(true);
    const randomComplexity = Math.max(2, Math.floor(Math.random() * 6));
    const randomDuration = 60 + Math.random() * 240;
    const randomSeed = Math.floor(Math.random() * 1000000);

    const generatedTimeline = createTimeline({
      complexity: randomComplexity,
      duration: randomDuration,
      seed: randomSeed
    });

    setTracks(generatedTimeline.tracks);
    setDuration(generatedTimeline.duration);
    setCurrentTime(0);
    setIsLoadingExample(false);
  };

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-border bg-card p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-xl font-semibold text-foreground'>Interactive Timeline</h2>
            <p className='text-sm text-muted-foreground mt-1'>
              Professional video editing timeline with tracks, clips, and advanced controls
            </p>
          </div>
          <button
            onClick={handleLoadExample}
            disabled={isLoadingExample}
            className='px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50'>
            {isLoadingExample ? 'Loading...' : 'Load Example'}
          </button>
        </div>
        <div className='rounded-lg border border-border bg-background p-4'>
          <Timeline
            tracks={tracks}
            duration={duration}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            onTracksChange={setTracks}
            onDurationChange={setDuration}
          />
        </div>
      </div>
    </div>
  );
}
