# Athena's Thread Voice UI Implementation Guide

## Route: `/voice/athenas-thread`

## Overview
A single flowing line that morphs between different shapes representing Athena's wisdom. The line forms medical symbols, Greek patterns, and DNA helixes while maintaining fluid, thread-like movement.

## Visual Design Specifications

### Layout Structure
```
[Full Screen Container - #0a0a0a background]
    [Canvas Container - 600px × 400px center]
        [Thread Path - Single continuous line]
        [Origin Point - Left side]
        [Terminal Point - Right side]
        [Pattern Zone - Center area]
    [Wisdom Text - Below canvas]
    [Pattern Indicator - Top right]
```

### Thread Characteristics
- **Width**: 3px base, up to 6px during emphasis
- **Color**: Gradient along length
- **Length**: Approximately 800px when straightened
- **Segments**: 200 calculation points for smooth curves

### Color Gradient System
```typescript
const THREAD_GRADIENTS = {
  idle: {
    start: '#9ca3af',    // gray-400
    end: '#6b7280'       // gray-500
  },
  listening: {
    start: '#a855f7',    // purple-500
    middle: '#ec4899',   // pink-500
    end: '#a855f7'       // purple-500
  },
  speaking: {
    start: '#10b981',    // emerald-500
    middle: '#3b82f6',   // blue-500
    end: '#8b5cf6'      // violet-500
  },
  thinking: {
    start: '#f59e0b',    // amber-500
    middle: '#ef4444',   // red-500
    end: '#f59e0b'      // amber-500
  }
};
```

## Thread Patterns

### 1. Sine Wave (Idle)
```
∿∿∿∿∿∿∿∿∿
Simple sine wave: y = A * sin(ωx + φ)
- Amplitude (A): 30px
- Frequency (ω): 0.01
- Phase (φ): Time-based for movement
```

### 2. Straight Line (Attention)
```
————————————
Transition to y = 0 with easing
- Duration: 800ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 3. Caduceus (Medical Symbol)
```
     ψ
   /   \
  (  S  )    Two sine waves wrapping around staff
  (  S  )    Plus wings at top
   \   /
     |
```

### 4. Greek Key Pattern
```
╔═╗ ╔═╗
║ ╚═╝ ║    Classic meander pattern
╚═════╝    Associated with Athena/Greek wisdom
```

### 5. DNA Helix
```
  ∞∞∞
 ∞∞∞∞∞    Double helix with crossing points
∞∞∞∞∞∞∞
```

### 6. Heartbeat (EKG)
```
    /\
───/  \───╱\───    P-QRS-T wave pattern
```

## Mathematical Implementation

### Thread Data Structure
```typescript
interface ThreadPoint {
  x: number;
  y: number;
  tension: number;      // For curve smoothness
  velocity: {x: number, y: number};
  targetX: number;
  targetY: number;
}

class Thread {
  points: ThreadPoint[] = [];
  pattern: Pattern = 'sine';
  morphProgress: number = 0;
  
  constructor(pointCount: number = 200) {
    // Initialize points along x-axis
    for (let i = 0; i < pointCount; i++) {
      this.points.push({
        x: (i / pointCount) * 600,
        y: 200,
        tension: 0.5,
        velocity: {x: 0, y: 0},
        targetX: 0,
        targetY: 0
      });
    }
  }
}
```

### Pattern Morphing Algorithm
```typescript
function morphToPattern(
  thread: Thread, 
  newPattern: Pattern, 
  duration: number = 1000
) {
  const startPoints = thread.points.map(p => ({...p}));
  const endPoints = calculatePatternPoints(newPattern, thread.points.length);
  const startTime = Date.now();
  
  function update() {
    const progress = Math.min((Date.now() - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);
    
    thread.points.forEach((point, i) => {
      point.x = lerp(startPoints[i].x, endPoints[i].x, eased);
      point.y = lerp(startPoints[i].y, endPoints[i].y, eased);
    });
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}
```

### Pattern Calculations

#### Caduceus Pattern
```typescript
function calculateCaduceus(pointCount: number): Point[] {
  const points: Point[] = [];
  const centerX = 300;
  
  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const y = t * 300 + 50;
    
    if (t < 0.15) {
      // Wings at top
      const wingSpread = Math.sin(t * Math.PI / 0.15) * 80;
      points.push({ 
        x: centerX + (i % 2 ? wingSpread : -wingSpread), 
        y 
      });
    } else {
      // Intertwined snakes
      const snake1X = Math.sin(t * Math.PI * 4) * 30;
      const snake2X = Math.sin(t * Math.PI * 4 + Math.PI) * 30;
      points.push({ 
        x: centerX + (i % 2 ? snake1X : snake2X), 
        y 
      });
    }
  }
  
  return points;
}
```

#### Greek Key Pattern
```typescript
function calculateGreekKey(pointCount: number): Point[] {
  const pattern = [
    {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1},
    {x: 0, y: 1}, {x: 0, y: 0.5}, {x: 0.5, y: 0.5},
    {x: 0.5, y: 0}, {x: 1, y: 0}
  ];
  
  // Repeat and scale pattern
  return interpolatePattern(pattern, pointCount, 100);
}
```

#### DNA Helix
```typescript
function calculateDNA(pointCount: number): Point[] {
  const points: Point[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    const t = (i / pointCount) * Math.PI * 6; // 3 full rotations
    const x = 300 + Math.cos(t) * 40;
    const y = 50 + (i / pointCount) * 300;
    const z = Math.sin(t); // For strand crossing
    
    // Alternate between strands
    if (z > 0 || i % 10 < 5) {
      points.push({ x, y });
    } else {
      points.push({ x: 600 - x, y }); // Mirror for second strand
    }
  }
  
  return points;
}
```

## Voice Response Integration

### Amplitude Mapping
```typescript
function applyVoiceDistortion(
  thread: Thread, 
  amplitude: number,
  frequencyData: Float32Array
) {
  thread.points.forEach((point, i) => {
    // Get frequency for this point
    const freqIndex = Math.floor(i / thread.points.length * frequencyData.length);
    const freq = frequencyData[freqIndex] / 255;
    
    // Apply distortion perpendicular to thread direction
    const angle = getThreadAngle(thread, i);
    const perpAngle = angle + Math.PI / 2;
    
    const distortion = amplitude * freq * 20;
    point.y += Math.sin(perpAngle) * distortion;
    point.x += Math.cos(perpAngle) * distortion;
  });
}
```

### Speech Pattern Recognition
```typescript
function detectSpeechPattern(
  amplitude: number, 
  duration: number
): Pattern {
  if (amplitude < 0.1) return 'sine';          // Idle
  if (amplitude > 0.7) return 'heartbeat';     // Excited
  if (duration > 5000) return 'dna';           // Long explanation
  if (isMedicalTopic()) return 'caduceus';    // Medical context
  return 'greekkey';                           // General wisdom
}
```

## Rendering Optimization

### Canvas Drawing
```typescript
function renderThread(ctx: CanvasRenderingContext2D, thread: Thread) {
  // Create gradient along thread
  const gradient = createThreadGradient(ctx, thread);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = calculateThreadWidth(thread);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Use single path for performance
  ctx.beginPath();
  
  // Smooth curve through points
  ctx.moveTo(thread.points[0].x, thread.points[0].y);
  
  for (let i = 1; i < thread.points.length - 1; i++) {
    const xc = (thread.points[i].x + thread.points[i + 1].x) / 2;
    const yc = (thread.points[i].y + thread.points[i + 1].y) / 2;
    ctx.quadraticCurveTo(thread.points[i].x, thread.points[i].y, xc, yc);
  }
  
  // Last point
  const last = thread.points[thread.points.length - 1];
  ctx.lineTo(last.x, last.y);
  
  ctx.stroke();
}
```

### Gradient Creation
```typescript
function createThreadGradient(
  ctx: CanvasRenderingContext2D, 
  thread: Thread
): CanvasGradient {
  const start = thread.points[0];
  const end = thread.points[thread.points.length - 1];
  
  const gradient = ctx.createLinearGradient(
    start.x, start.y, end.x, end.y
  );
  
  const colors = THREAD_GRADIENTS[thread.pattern];
  gradient.addColorStop(0, colors.start);
  if (colors.middle) {
    gradient.addColorStop(0.5, colors.middle);
  }
  gradient.addColorStop(1, colors.end);
  
  return gradient;
}
```

## Interactive Features

### Pattern Switching
```typescript
// Smooth transitions between patterns
const PATTERN_SEQUENCE = [
  'sine', 'straight', 'caduceus', 'greekkey', 'dna', 'heartbeat'
];

function cyclePattern(thread: Thread) {
  const currentIndex = PATTERN_SEQUENCE.indexOf(thread.pattern);
  const nextIndex = (currentIndex + 1) % PATTERN_SEQUENCE.length;
  morphToPattern(thread, PATTERN_SEQUENCE[nextIndex]);
}
```

### Thread Physics
```typescript
function applyPhysics(thread: Thread) {
  const DAMPING = 0.95;
  const SPRING = 0.1;
  
  thread.points.forEach(point => {
    // Spring force toward target
    const dx = point.targetX - point.x;
    const dy = point.targetY - point.y;
    
    point.velocity.x += dx * SPRING;
    point.velocity.y += dy * SPRING;
    
    // Apply damping
    point.velocity.x *= DAMPING;
    point.velocity.y *= DAMPING;
    
    // Update position
    point.x += point.velocity.x;
    point.y += point.velocity.y;
  });
}
```

## Wisdom Integration

### Athena Personality
```typescript
const ATHENA_RESPONSES = {
  greeting: "The thread of wisdom connects us",
  listening: "I perceive the patterns in your words",
  thinking: "The threads of knowledge interweave",
  medical: "The caduceus reveals health's mysteries",
  wisdom: "Ancient patterns hold modern truths"
};

function updateWisdomText(state: VoiceState) {
  const text = ATHENA_RESPONSES[state] || "";
  // Fade in character by character
  typewriterEffect(text, 50);
}
```

## File Structure
```
app/voice/athenas-thread/
├── page.tsx            # Main component
├── ThreadCanvas.tsx    # Canvas renderer
├── ThreadSystem.ts     # Thread physics and state
├── PatternLibrary.ts   # Pattern calculations
├── MorphEngine.ts      # Pattern morphing logic
├── WisdomDisplay.tsx   # Athena text display
└── types.ts           # TypeScript interfaces
```

## Performance Considerations
1. Use WebGL for complex patterns (optional upgrade)
2. Implement LOD - fewer points when moving fast
3. Cache pattern calculations
4. Use worker thread for physics calculations
5. Throttle voice updates to 30Hz

## Accessibility
- Announce pattern changes
- Describe thread movement
- Keyboard controls for pattern switching
- Sonification of thread shape
- High contrast mode with thicker line

## Implementation Checklist
- [ ] Basic thread rendering works
- [ ] All 6 patterns implemented
- [ ] Smooth morphing between patterns
- [ ] Voice amplitude affects thread
- [ ] Pattern auto-selection based on context
- [ ] Gradient system working
- [ ] Physics simulation smooth
- [ ] Wisdom text integration complete

## Key Implementation Notes
1. Bezier curves create smoother lines than line segments
2. Morph timing is crucial - too fast looks glitchy
3. Thread should never fully straighten (maintain slight wave)
4. Add subtle glow effect for mystical feel
5. Pattern recognition should feel intelligent
6. Consider thread "memory" - returns to previous shape