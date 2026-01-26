// Simple interfaces that match the working example format
interface TimelineItem {
  id: string;
  name: string;
  start: number;
  end: number;
  duration: number;
  type: string;
  color: string;
  properties?: Record<string, unknown>;
}

interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'transcript' | 'markers' | 'assets';
  height: number;
  visible: boolean;
  items: TimelineItem[];
}

interface TimelineData {
  duration: number;
  metadata: {
    title: string;
    created: string;
    version: string;
    project: {
      resolution: string;
      frameRate: number;
      audioSampleRate: string;
    };
  };
  tracks: TimelineTrack[];
}

interface CreateTimelineOptions {
  complexity?: number;
  duration?: number;
  seed?: number;
}

export function createTimeline({
  complexity = 2,
  duration = 300,
  seed = Date.now()
}: CreateTimelineOptions = {}): TimelineData {
  // clamp complexity 0..5 (0 = tiny, 5 = very complex)
  complexity = Math.max(0, Math.min(5, Math.floor(complexity)));
  const rand = mulberry32(seed);

  const base = {
    duration,
    metadata: {
      title: `Generated Timeline (complexity ${complexity})`,
      created: new Date().toISOString(),
      version: "auto-1",
      project: {
        resolution: "3840x2160",
        frameRate: 30,
        audioSampleRate: "48kHz"
      },
    },
  };

  // template track types with weight influenced by complexity
  const trackPresets = [
    { id: "video" as const, name: "Video", weight: 3 },
    { id: "audio" as const, name: "Audio", weight: 2 },
    { id: "assets" as const, name: "Graphics", weight: 1 },
    { id: "transcript" as const, name: "Captions", weight: 1 },
    { id: "markers" as const, name: "Markers", weight: 0.5 },
  ];

  // how many distinct tracks: base 3 + complexity
  const trackCount = Math.max(1, 3 + complexity);
  const tracks: TimelineTrack[] = [];

  // helper to pick color palette
  const colors = ["#818cf8","#a5b4fc","#34d399","#6ee7b7","#fbbf24","#a78bfa","#c084fc","#f87171"];
  const pickColor = () => colors[Math.floor(rand()*colors.length)];
  const makeId = (prefix: string) => `${prefix}-${Math.floor(rand()*1e6).toString(36)}`;

  // content libraries for realistic names
  const videoNames = [
    "Opening Scene", "Interview Segment", "B-Roll Footage", "Product Demo", "Customer Testimonial",
    "Behind the Scenes", "Office Environment", "Team Meeting", "Presentation", "Closing Shot",
    "Transition Sequence", "Montage", "Screen Recording", "Conference Room", "Outdoor Shot"
  ];

  const audioNames = [
    "Background Music", "Dialogue Track", "Sound Effects", "Ambient Sound", "Narration",
    "Interview Audio", "Music Underscore", "Foley Effects", "Room Tone", "Voice Over",
    "Instrumental", "Podcast Audio", "Phone Call", "Live Recording", "Studio Session"
  ];

  const captionTexts = [
    "Welcome to our comprehensive overview", "Let's explore the key features together",
    "Our team is passionate about innovation", "Customer satisfaction is our top priority",
    "Join thousands of satisfied users worldwide", "Discover what makes us different",
    "Innovation meets excellence in every detail", "Transform your workflow with our solutions",
    "See the difference quality makes", "Experience the future of collaboration"
  ];

  // build tracks
  for (let t = 0; t < trackCount; t++) {
    const preset = trackPresets[t % trackPresets.length];
    const trackType = preset.id === "video" && t === 0 ? "video" : preset.id;
    // Set height based on track type for consistency
    const height = trackType === "video" ? 80 : trackType === "audio" ? 60 : 50;

    // items per track scaled by complexity and track type - make it much denser
    let baseItems = Math.max(2, Math.round((2 + complexity * 2) * (preset.weight || 1)));

    // For high complexity, really pack it with content
    if (complexity >= 4) {
      baseItems = Math.round(baseItems * 1.5);
    }

    const itemsCount = Math.max(2, baseItems + Math.floor(rand()*3));

    // generate items with variable durations and gaps - NO OVERLAPS
    const items: TimelineItem[] = [];
    let cursor = parseFloat((rand() * Math.min(2, duration*0.01)).toFixed(2)); // smaller lead-in

    for (let i = 0; i < itemsCount; i++) {
      // Calculate remaining time to distribute
      const remainingTime = duration - cursor;
      const remainingItems = itemsCount - i;

      if (remainingTime <= 0.5 || remainingItems <= 0) break;

      // duration scale: distribute remaining time across remaining items
      const avgTimePerItem = remainingTime / remainingItems;
      const jitter = (rand() - 0.5) * avgTimePerItem * 0.4;
      let itemDuration = Math.max(0.5, parseFloat((avgTimePerItem * 0.7 + jitter).toFixed(2)));

      // ensure we don't exceed total duration
      if (cursor + itemDuration > duration) {
        itemDuration = Math.max(0.5, parseFloat((duration - cursor).toFixed(2)));
      }

      const start = parseFloat(cursor.toFixed(2));
      const end = parseFloat((start + itemDuration).toFixed(2));

      // Pick realistic names based on track type
      let itemName: string;
      if (trackType === "video") {
        itemName = videoNames[Math.floor(rand() * videoNames.length)];
      } else if (trackType === "audio") {
        itemName = audioNames[Math.floor(rand() * audioNames.length)];
      } else {
        itemName = `${capitalize(trackType)} ${i+1}`;
      }

      const item: TimelineItem = {
        id: makeId(trackType),
        name: `${itemName} ${i > 0 ? (i+1) : ''}`.trim(),
        start,
        end,
        duration: parseFloat((end - start).toFixed(2)),
        type: trackType,
        color: pickColor(),
        properties: defaultPropertiesFor(trackType, complexity, rand, captionTexts),
      };
      items.push(item);

      // advance cursor: add small gap for higher complexity (more packed)
      const maxGap = Math.max(0.05, 0.5 - (complexity * 0.08));
      const gap = parseFloat((rand() * maxGap).toFixed(2));
      cursor = parseFloat((end + gap).toFixed(2));

      // If we're close to the end, break
      if (cursor >= duration - 0.5) break;
    }

    // Fill any remaining time with a final item if there's significant space left
    if (items.length > 0 && duration - items[items.length - 1].end > 2) {
      const lastEnd = items[items.length - 1].end;
      const finalStart = parseFloat((lastEnd + 0.1).toFixed(2));
      const finalEnd = parseFloat(duration.toFixed(2));

      if (finalEnd - finalStart >= 0.5) {
        const finalItemName = trackType === "video"
          ? videoNames[Math.floor(rand() * videoNames.length)]
          : trackType === "audio"
          ? audioNames[Math.floor(rand() * audioNames.length)]
          : `${capitalize(trackType)} Final`;

        items.push({
          id: makeId(trackType + "-final"),
          name: `${finalItemName}`,
          start: finalStart,
          end: finalEnd,
          duration: parseFloat((finalEnd - finalStart).toFixed(2)),
          type: trackType,
          color: pickColor(),
          properties: defaultPropertiesFor(trackType, complexity, rand, captionTexts),
        });
      }
    }

    // Sort items and validate no overlaps
    const sortedItems = items.sort((a, b) => a.start - b.start);

    // Validate no overlaps (development check)
    for (let i = 1; i < sortedItems.length; i++) {
      if (sortedItems[i].start < sortedItems[i-1].end) {
        console.warn(`Overlap detected in ${trackType} track: ${sortedItems[i-1].end} -> ${sortedItems[i].start}`);
      }
    }

    tracks.push({
      id: `${trackType}-track-${t}`,
      name: `${preset.name} ${t > 0 ? (t+1) : ''}`.trim(),
      type: trackType,
      height,
      visible: true,
      items: sortedItems,
    });
  }

  // Use the target duration - content should fill most of it
  return {
    ...base,
    duration: parseFloat(duration.toFixed(2)),
    tracks
  };
}

/* ---------------- helpers ---------------- */

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function defaultPropertiesFor(type: string, complexity: number, rand: () => number, captionTexts: string[]): Record<string, unknown> {
  if (type === "video") {
    return {
      volume: parseFloat((0.8 + rand()*0.2).toFixed(2)),
      fade: {
        in: parseFloat((rand() * (0.2 + complexity*0.1)).toFixed(2)),
        out: parseFloat((rand() * (0.3 + complexity*0.2)).toFixed(2))
      },
      resolution: complexity > 3 ? "4K" : complexity > 1 ? "1080p" : "720p",
      fps: complexity > 3 ? (rand() > 0.5 ? 60 : 30) : 30,
      codec: complexity > 2 ? "H.264" : "H.265",
      quality: complexity > 3 ? "High" : "Medium",
    };
  }
  if (type === "audio") {
    const genres = ["Corporate", "Ambient", "Electronic", "Cinematic", "Jazz", "Classical"];
    const moods = ["Uplifting", "Contemplative", "Energetic", "Peaceful", "Dynamic", "Inspiring"];

    return {
      volume: parseFloat((0.1 + rand()*0.8).toFixed(2)),
      fade: {
        in: parseFloat((rand()*1.5).toFixed(2)),
        out: parseFloat((rand()*2.0).toFixed(2))
      },
      sampleRate: complexity > 2 ? "48kHz" : "44.1kHz",
      bitDepth: complexity > 2 ? "24-bit" : "16-bit",
      channels: rand() > 0.3 ? "Stereo" : "Mono",
      genre: genres[Math.floor(rand() * genres.length)],
      mood: moods[Math.floor(rand() * moods.length)],
      bpm: Math.floor(60 + rand() * 120),
    };
  }
  if (type === "assets" || type === "graphics") {
    const graphicTypes = ["lower-third", "animated-infographic", "title-card", "transition", "logo"];
    const styles = ["modern", "classic", "minimal", "bold", "elegant"];

    return {
      type: graphicTypes[Math.floor(rand() * graphicTypes.length)],
      style: styles[Math.floor(rand() * styles.length)],
      resolution: "1920x1080",
      transparency: true,
      animation: complexity > 2 ? "fade-slide" : "fade",
    };
  }
  if (type === "transcript") {
    return {
      text: captionTexts[Math.floor(rand() * captionTexts.length)],
      fontSize: 20 + Math.floor(rand() * 8),
      position: rand() > 0.8 ? "top" : "bottom",
      speaker: rand() > 0.5 ? "Narrator" : "Speaker",
      confidence: parseFloat((0.85 + rand()*0.15).toFixed(2)),
      language: "en-US",
    };
  }
  if (type === "markers") {
    const markerTypes = ["chapter", "bookmark", "annotation", "highlight"];
    const descriptions = [
      "Key moment in presentation",
      "Important transition point",
      "Customer testimonial begins",
      "Product demo section",
      "Team introduction",
      "Call to action"
    ];

    return {
      label: `Marker ${Math.floor(rand()*100)}`,
      color: "#f87171",
      type: markerTypes[Math.floor(rand() * markerTypes.length)],
      description: descriptions[Math.floor(rand() * descriptions.length)],
    };
  }
  return {};
}

function capitalize(s: string): string {
  return typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}