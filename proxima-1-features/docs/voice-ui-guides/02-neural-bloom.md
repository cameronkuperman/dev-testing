# Neural Bloom Voice UI Implementation Guide

## Route: `/voice/neural-bloom`

## Overview
An elegant voice interface featuring a minimalist circle that "blooms" into a neural network pattern when speaking. SVG paths grow and shrink to create a flower-like synaptic visualization.

## Visual Design Specifications

### Layout Structure
```
[Full Screen Container - #0a0a0a background]
    [Center Stage - 600px × 600px viewport]
        [SVG Container - 400px × 400px]
            [Base Circle - 120px diameter center]
            [Neural Branches - Dynamic SVG paths]
            [Connection Points - Small circles at path ends]
        [Status Text - Below SVG]
    [Control Dock - Bottom center]
```

### Color Scheme
- Background: `#0a0a0a`
- Base Circle: `rgba(255, 255, 255, 0.1)` stroke
- Neural Paths: `rgba(255, 255, 255, 0.6)` to `rgba(255, 255, 255, 0.1)` gradient
- Connection Points: `#a855f7` (purple-500) to `#ec4899` (pink-500)
- Active Glow: `rgba(168, 85, 247, 0.3)` blur effect

### Neural Network Structure

#### Branch Levels
1. **Level 0 (Center)**: Main circle, always visible
2. **Level 1 (Primary)**: 6 main branches, 120° apart
3. **Level 2 (Secondary)**: 2 sub-branches per primary (12 total)
4. **Level 3 (Tertiary)**: Random spawning based on amplitude

#### Path Mathematics
```typescript
// Primary branch angles
angles = [0, 60, 120, 180, 240, 300]

// Branch growth function
length = baseLengt * (1 + amplitude * growthFactor)

// Curve control points for organic feel
controlPoint1 = {
  x: start.x + cos(angle - 15°) * length * 0.3,
  y: start.y + sin(angle - 15°) * length * 0.3
}
controlPoint2 = {
  x: end.x - cos(angle + 15°) * length * 0.3,
  y: end.y - sin(angle + 15°) * length * 0.3
}
```

## Animation States

### 1. Idle State
```
- Center circle: Gentle breathing (scale 0.95-1.05)
- No branches visible
- Soft white glow
- Breathing rate: 4 seconds per cycle
```

### 2. Listening State
```
- Branches slowly extend inward (reverse bloom)
- Primary branches appear first
- Opacity fade in over 0.8s
- Slight rotation (1rpm clockwise)
```

### 3. Speaking State
```
- Branches pulse outward with amplitude
- New branches spawn at high amplitude
- Connection points brighten
- Synaptic firing effect along paths
```

### 4. Thinking State
```
- Rapid branch multiplication
- Lightning-like connections between nodes
- Then simplification back to primary
- Purple/pink gradient shifts
```

## Technical Implementation

### SVG Structure
```svg
<svg viewBox="0 0 400 400">
  <defs>
    <radialGradient id="neuralGlow">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  
  <g id="neuralNetwork">
    <!-- Dynamic paths inserted here -->
  </g>
  
  <circle id="centerNode" cx="200" cy="200" r="60"/>
</svg>
```

### Branch Generation Algorithm
```typescript
interface Branch {
  id: string;
  level: number;
  angle: number;
  length: number;
  parent?: string;
  children: string[];
  opacity: number;
  growthProgress: number;
}

// Generate branches based on amplitude
function generateBranches(amplitude: number, currentBranches: Branch[]) {
  // Level 1: Always show if amplitude > 0.1
  // Level 2: Show if amplitude > 0.3
  // Level 3: Spawn randomly if amplitude > 0.6
}
```

### Animation Timing
```typescript
// Spring physics for natural movement
const springConfig = {
  stiffness: 120,
  damping: 14,
  mass: 1
};

// Growth animation
const growthDuration = 800; // ms
const shrinkDuration = 600; // ms
const pulseFrequency = amplitude * 2; // Hz
```

### Path Drawing
```typescript
function drawBranch(branch: Branch): string {
  const start = getNodePosition(branch.parent);
  const end = calculateEndpoint(start, branch.angle, branch.length);
  const [cp1, cp2] = calculateControlPoints(start, end, branch.angle);
  
  return `M ${start.x},${start.y} 
          C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
}
```

## Interaction Patterns

### Voice Amplitude Mapping
```typescript
// Amplitude ranges and effects
0.0 - 0.1: Idle, no branches
0.1 - 0.3: Primary branches appear
0.3 - 0.5: Secondary branches grow
0.5 - 0.7: Tertiary branches spawn
0.7 - 1.0: Synaptic firing effects
```

### Special Effects

#### Synaptic Firing
```typescript
// Particle traveling along path
function createSynapticPulse(pathId: string) {
  // Create small circle
  // Animate along path using animateMotion
  // Fade out at endpoints
  // Random delay between pulses
}
```

#### Connection Point Glow
```typescript
// Brightness based on activity
function updateNodeBrightness(node: ConnectionPoint, activity: number) {
  node.opacity = 0.3 + (activity * 0.7);
  node.scale = 1 + (activity * 0.2);
  node.glowRadius = 5 + (activity * 10);
}
```

## Performance Optimization

### SVG Optimization
1. Use CSS transforms instead of attribute changes
2. Batch DOM updates with requestAnimationFrame
3. Limit maximum branches to 50
4. Use CSS animations for simple transitions
5. Cache path calculations

### Memory Management
```typescript
// Cleanup old branches
if (branches.length > MAX_BRANCHES) {
  // Remove oldest tertiary branches first
  // Fade out before removal
  // Clean up event listeners
}
```

## Responsive Design
- Mobile: Scale down to 300px × 300px
- Tablet: 350px × 350px
- Desktop: Full 400px × 400px
- Touch: Larger tap targets for controls

## Accessibility
- Announce branch growth levels
- Keyboard controls for start/stop
- Reduced motion: Simple fade instead of growth
- High contrast: Increase line thickness

## State Management
```typescript
interface NeuralBloomState {
  branches: Map<string, Branch>;
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'thinking';
  synapticPulses: SynapticPulse[];
  rotationAngle: number;
}
```

## File Structure
```
app/voice/neural-bloom/
├── page.tsx              # Main component
├── NeuralNetworkSVG.tsx  # SVG rendering logic
├── BranchGenerator.ts    # Branch generation algorithm
├── SynapticEffects.tsx  # Particle effects
├── animations.ts         # Animation configs
└── types.ts             # TypeScript interfaces
```

## Implementation Checklist
- [ ] SVG branch generation working
- [ ] Smooth amplitude-based growth
- [ ] Synaptic firing effects
- [ ] Natural branch curves
- [ ] Performance stays above 60fps
- [ ] Touch interactions work
- [ ] Cleanup prevents memory leaks
- [ ] All animation states implemented

## Key Implementation Notes
1. Use `react-spring` for physics-based animations
2. SVG paths must have unique IDs for animateMotion
3. Implement branch pooling for performance
4. Add subtle noise to prevent mechanical feel
5. Connection points should "breathe" independently
6. Gradient shifts should be time-based, not frame-based