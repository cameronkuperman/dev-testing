# Constellation Heart Voice UI Implementation Guide

## Route: `/voice/constellation-heart`

## Overview
A romantic and medical fusion where scattered dots form a subtle heart shape when active, connected by fading constellation lines. Points pulse with actual heartbeat rhythm and respond to voice amplitude.

## Visual Design Specifications

### Layout Structure
```
[Full Screen Container - #0a0a0a background]
    [Canvas Container - 500px × 500px center]
        [Particle System - Full canvas]
        [Connection Lines - Dynamic]
        [Heartbeat Overlay - Subtle pulse]
    [Status Display - Below canvas]
    [Pulse Indicator - Top right]
```

### Visual Elements

#### Constellation Points (Stars)
- **Count**: 24 primary stars, up to 48 with voice
- **Size**: 2-6px based on importance
- **Color**: Base white with purple/pink tints
- **Glow**: Soft blur effect, increases with activity
- **Movement**: Gentle drift within boundaries

#### Heart Formation
```
Idle State:        Active State:
  · · · ·           · ·♥· ·
 · · · · ·         ·♥·♥·♥·
· · · · · ·       ♥·♥·♥·♥·♥
 · · · · ·         ·♥·♥·♥·
  · · · ·           ·♥·♥·
   · · ·             ·♥·
```

#### Connection Lines
- **Opacity**: Distance-based (closer = brighter)
- **Max Distance**: 80px for connections
- **Style**: Gradient from star to star
- **Animation**: Fade in/out based on proximity

### Color Palette
- Stars: `#ffffff` base, `#a855f7` to `#ec4899` when active
- Lines: `rgba(255, 255, 255, 0.1-0.3)`
- Heart Pulse: `rgba(236, 72, 153, 0.2)` overlay
- Emergency: Red shift for urgent health states

## Particle System Implementation

### Star Object Structure
```typescript
interface Star {
  id: number;
  x: number;
  y: number;
  targetX: number;      // Heart formation position
  targetY: number;
  currentX: number;     // Animated position
  currentY: number;
  size: number;
  brightness: number;
  pulsePhase: number;   // Individual pulse timing
  isCore: boolean;      // Part of heart shape
  connections: number[]; // Connected star IDs
}
```

### Heart Shape Mathematics
```typescript
// Parametric heart equation
function getHeartPosition(t: number, scale: number): Point {
  const x = scale * 16 * Math.pow(Math.sin(t), 3);
  const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 
             2 * Math.cos(3*t) - Math.cos(4*t));
  return { x: x + centerX, y: y + centerY };
}

// Distribute stars along heart
function calculateHeartPositions(starCount: number): Point[] {
  const positions: Point[] = [];
  for (let i = 0; i < starCount; i++) {
    const t = (i / starCount) * Math.PI * 2;
    positions.push(getHeartPosition(t, 10));
  }
  return positions;
}
```

### Animation States

#### 1. Idle (Scattered)
```typescript
// Random distribution with constraints
function scatterStars(stars: Star[]) {
  stars.forEach(star => {
    star.targetX = centerX + (Math.random() - 0.5) * 400;
    star.targetY = centerY + (Math.random() - 0.5) * 400;
    star.brightness = 0.3 + Math.random() * 0.2;
  });
}
```

#### 2. Listening (Gathering)
```typescript
// Stars slowly drift toward center
function gatherStars(stars: Star[], progress: number) {
  stars.forEach(star => {
    const angle = Math.atan2(star.y - centerY, star.x - centerX);
    const distance = getDistance(star, center);
    star.targetX = star.x - Math.cos(angle) * distance * progress * 0.3;
    star.targetY = star.y - Math.sin(angle) * distance * progress * 0.3;
  });
}
```

#### 3. Speaking (Heart Formation)
```typescript
// Morph to heart shape based on amplitude
function formHeart(stars: Star[], amplitude: number) {
  const coreStars = stars.filter(s => s.isCore);
  coreStars.forEach((star, i) => {
    const heartPos = heartPositions[i];
    star.targetX = lerp(star.currentX, heartPos.x, amplitude);
    star.targetY = lerp(star.currentY, heartPos.y, amplitude);
    star.brightness = 0.5 + amplitude * 0.5;
  });
}
```

#### 4. Voice Response
```typescript
// New stars spawn with high amplitude
function spawnVoiceStars(amplitude: number) {
  if (amplitude > 0.6 && stars.length < MAX_STARS) {
    const newStar = createStar();
    newStar.size = 1 + amplitude * 3;
    newStar.brightness = amplitude;
    // Spawn near existing stars for clustering
    positionNearCluster(newStar);
    stars.push(newStar);
  }
}
```

## Heartbeat Integration

### Pulse Rhythm
```typescript
// Realistic heartbeat timing
const HEARTBEAT_PATTERN = {
  rest: 60,      // BPM at rest
  active: 80,    // BPM when speaking
  stressed: 100  // BPM for urgent topics
};

function calculatePulse(state: VoiceState): number {
  // P wave -> QRS complex -> T wave timing
  const cycleTime = 60000 / getCurrentBPM(state);
  const phase = (Date.now() % cycleTime) / cycleTime;
  
  if (phase < 0.1) return 1.2;      // P wave
  if (phase < 0.15) return 1.8;     // QRS spike
  if (phase < 0.3) return 1.1;      // T wave
  return 1.0;                       // Baseline
}
```

### Star Pulsing
```typescript
// Individual star pulse with phase offset
function updateStarPulse(star: Star, globalPulse: number) {
  const phasedPulse = globalPulse + star.pulsePhase * 0.2;
  star.size = star.baseSize * phasedPulse;
  star.brightness = star.baseBrightness * (0.8 + phasedPulse * 0.2);
}
```

## Connection System

### Dynamic Line Drawing
```typescript
function drawConnections(ctx: CanvasContext, stars: Star[]) {
  stars.forEach((star, i) => {
    stars.slice(i + 1).forEach(otherStar => {
      const distance = getDistance(star, otherStar);
      
      if (distance < MAX_CONNECTION_DISTANCE) {
        const opacity = 1 - (distance / MAX_CONNECTION_DISTANCE);
        const gradient = ctx.createLinearGradient(
          star.x, star.y, otherStar.x, otherStar.y
        );
        
        gradient.addColorStop(0, `rgba(168, 85, 247, ${opacity * star.brightness})`);
        gradient.addColorStop(1, `rgba(236, 72, 153, ${opacity * otherStar.brightness})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = opacity * 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(otherStar.x, otherStar.y);
        ctx.stroke();
      }
    });
  });
}
```

## Health Context Features

### Emotion Detection
```typescript
// Color shifts based on conversation tone
function updateEmotionalState(sentiment: number) {
  if (sentiment < -0.5) {
    // Concerning - shift toward red
    starTint = { r: 255, g: 100, b: 100 };
  } else if (sentiment > 0.5) {
    // Positive - brighter, warmer
    starTint = { r: 255, g: 200, b: 255 };
  }
}
```

### Health Indicators
```typescript
// Visual feedback for health states
const HEALTH_STATES = {
  normal: { bpm: 60, color: 'white' },
  elevated: { bpm: 80, color: 'yellow' },
  concerning: { bpm: 100, color: 'orange' },
  critical: { bpm: 120, color: 'red' }
};
```

## Performance Optimization

### Canvas Rendering
```typescript
// Efficient star rendering
function renderStars(ctx: CanvasContext, stars: Star[]) {
  // Clear only changed regions
  ctx.fillStyle = '#0a0a0a';
  dirtyRegions.forEach(region => {
    ctx.fillRect(region.x, region.y, region.width, region.height);
  });
  
  // Batch similar stars
  const starsBySize = groupBy(stars, 'size');
  Object.entries(starsBySize).forEach(([size, sameStars]) => {
    ctx.beginPath();
    sameStars.forEach(star => {
      ctx.moveTo(star.x + size, star.y);
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
    });
    ctx.fill();
  });
}
```

### Animation Optimization
- Use `requestAnimationFrame` for 60fps
- Implement star pooling (reuse objects)
- Cull off-screen stars
- LOD system for distant stars
- Debounce connection calculations

## File Structure
```
app/voice/constellation-heart/
├── page.tsx                # Main component
├── ConstellationCanvas.tsx # Canvas renderer
├── StarSystem.ts          # Particle management
├── HeartMath.ts           # Heart shape calculations
├── PulseManager.ts        # Heartbeat timing
├── ConnectionRenderer.ts   # Line drawing logic
└── types.ts               # TypeScript interfaces
```

## Interaction Details

### Click/Touch Behaviors
- Tap star: Show health info tooltip
- Drag: Move constellation viewpoint
- Pinch: Zoom in/out
- Long press: Reset to idle

### Voice Commands
- "Show my heart" - Form heart immediately
- "Relax" - Slow pulse, scatter stars
- "Emergency" - Red alert state

## Implementation Checklist
- [ ] Star particle system working
- [ ] Heart formation smooth
- [ ] Pulse rhythm accurate
- [ ] Connection lines perform well
- [ ] Voice amplitude mapping correct
- [ ] Mobile touch gestures work
- [ ] Memory management solid
- [ ] All visual states implemented

## Key Implementation Notes
1. Use object pooling for stars to prevent GC
2. Implement spatial indexing for connection efficiency
3. Heart shape should "breathe" even when formed
4. Add subtle parallax for depth
5. Ensure colorblind-friendly modes
6. Save star positions for smooth transitions