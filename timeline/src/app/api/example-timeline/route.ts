import { NextResponse } from 'next/server';
import { createTimeline } from '@/lib/createTimeline';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters with defaults
    const complexity = parseInt(searchParams.get('complexity') || '5'); // Maximum complexity
    const duration = parseInt(searchParams.get('duration') || '120'); // 2 minutes
    const seed = parseInt(searchParams.get('seed') || Date.now().toString());

    // Generate a very complex, fully-filled timeline
    const timeline = createTimeline({
      complexity: Math.max(0, Math.min(5, complexity)), // Clamp 0-5
      duration: Math.max(30, Math.min(100, duration)), // Clamp 30s-10min
      seed
    });

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error generating timeline:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}
