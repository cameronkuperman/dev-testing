# Frequency Flower Voice UI Implementation Guide

## Route: `/voice/frequency-flower`

## Overview
A voice interface where frequency lines radiate from a central circle, forming abstract flower petals that bloom and respond to voice input. The petals change color based on health topics and wilt for concerning symptoms.

## Visual Design Specifications

### Layout Structure
```
[Full Screen Container - #0a0a0a background]
    [SVG Canvas - 450px × 450px center]
        [Center Circle - 80px diameter]
        [Frequency Petals - 12 radiating lines]
        [Petal Tips - Curved endpoints]
        [Amplitude Rings - Optional overlay]
    [Health Status Bar - Below flower]
    [Topic Indicator - Top center]
```

### Flower Geometry

#### Petal Structure
```
Each petal consists of:
- Stem: Straight line from center
- Curve: Bezier curve at tip
- Width: Variable based on frequency
- Length: 20px (closed) to 180px (full bloom)
```

#### Mathematical Layout
```typescript
// 12 petals evenly distributed
const PETAL_COUNT = 12;
const ANGLE_STEP = (Math.PI * 2) / PETAL_COUNT;

// Petal positioning
for (let i = 0; i < PETAL_COUNT; i++) {
  const angle = i * ANGLE_STEP;
  const petal = {
    angle: angle,
    baseX: centerX + Math.cos(angle) * 40, // Start from circle edge
    baseY: centerY + Math.sin(angle) * 40,
    length: 20, // Initial closed state
    curve: 0,   // Tip curvature
    width: 2,   // Line thickness
    color: baseColor
  };
}
```

### Color System

#### Health Topic Colors
```typescript
const TOPIC_COLORS = {
  general: { gradient: ['#a855f7', '#ec4899'] },      // Purple-Pink
  cardio: { gradient: ['#ef4444', '#f97316'] },       // Red-Orange
  respiratory: { gradient: ['#3b82f6', '#06b6d4'] },  // Blue-Cyan
  neural: { gradient: ['#8b5cf6', '#7c3aed'] },       // Violet
  digestive: { gradient: ['#10b981', '#34d399'] },    // Green
  mental: { gradient: ['#f59e0b', '#fbbf24'] },       // Amber
  emergency: { gradient: ['#dc2626', '#991b1b'] }     // Deep Red
};
```

#### Dynamic Color Mapping
```typescript
function detectHealthTopic(transcript: string): HealthTopic {
  // Keywords mapping to topics
  const keywords = {
    cardio: ['heart', 'chest', 'pressure', 'pulse'],
    respiratory: ['breath', 'lung', 'cough', 'wheeze'],
    neural: ['headache', 'dizzy', 'vision', 'numbness'],
    // ... etc
  };
  // Return matched topic or 'general'
}
```

## Animation States

### 1. Closed State (Idle)
```
    |
  \ | /    - Petals short (20px)
  -·●·-    - Tight around center
  / | \    - Minimal movement
    |      - Gentle rotation (0.5rpm)
```

### 2. Listening State
```
   \|/     - Petals extend to 60px
  \ | /    - Slight wavering
  --●--    - Tips begin to curve
  / | \    - Slow breathing animation
   /|\   
```

### 3. Speaking State (Blooming)
```
  \\ | //  - Full extension (100-180px)
  \\♦//    - Petals curve outward
  //|\\    - Width varies with frequency
           - Dynamic response to voice
```

### 4. Concern State (Wilting)
```
  \ | /    - Petals droop downward
   \|/     - Reduced length
   ·♦·     - Muted colors
   /|\     - Slower movement
  / | \  
```

## Technical Implementation

### SVG Petal Rendering
```typescript
function renderPetal(petal: Petal): string {
  const tipX = petal.baseX + Math.cos(petal.angle) * petal.length;
  const tipY = petal.baseY + Math.sin(petal.angle) * petal.length;
  
  // Control points for petal curve
  const cp1x = petal.baseX + Math.cos(petal.angle - 0.2) * petal.length * 0.7;
  const cp1y = petal.baseY + Math.sin(petal.angle - 0.2) * petal.length * 0.7;
  const cp2x = tipX + Math.cos(petal.angle + Math.PI/2) * petal.curve;
  const cp2y = tipY + Math.sin(petal.angle + Math.PI/2) * petal.curve;
  
  return `
    <path
      d="M ${petal.baseX} ${petal.baseY} 
         C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tipX} ${tipY}"
      stroke="${petal.color}"
      stroke-width="${petal.width}"
      fill="none"
      stroke-linecap="round"
    />
  `;
}
```

### Frequency Analysis Integration
```typescript
interface FrequencyData {
  bass: number;       // 20-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2000 Hz
  highMid: number;    // 2000-4000 Hz
  treble: number;     // 4000-20000 Hz
}

function mapFrequenciesToPetals(
  freqData: FrequencyData, 
  petals: Petal[]
) {
  // Map frequency bands to petal groups
  petals.forEach((petal, i) => {
    const band = Math.floor(i / 2.4); // 5 bands, ~2.4 petals each
    let amplitude = 0;
    
    switch(band) {
      case 0: amplitude = freqData.bass; break;
      case 1: amplitude = freqData.lowMid; break;
      case 2: amplitude = freqData.mid; break;
      case 3: amplitude = freqData.highMid; break;
      case 4: amplitude = freqData.treble; break;
    }
    
    // Smooth transition to target length
    petal.targetLength = 60 + amplitude * 120;
    petal.targetWidth = 2 + amplitude * 4;
    petal.targetCurve = amplitude * 30;
  });
}
```

### Voice Amplitude Response
```typescript
function updatePetalBloom(amplitude: number, petals: Petal[]) {
  const bloomFactor = smoothAmplitude(amplitude);
  
  petals.forEach((petal, i) => {
    // Add variation to each petal
    const variation = Math.sin(Date.now() * 0.001 + i) * 0.1;
    const petalBloom = bloomFactor + variation;
    
    // Spring physics for natural movement
    petal.length += (petal.targetLength * petalBloom - petal.length) * 0.1;
    petal.width += (petal.targetWidth - petal.width) * 0.08;
    petal.curve += (petal.targetCurve - petal.curve) * 0.12;
  });
}
```

### Health Concern Wilting
```typescript
function applyConcernWilting(severity: number, petals: Petal[]) {
  petals.forEach((petal, i) => {
    // Droop calculation
    const droopAngle = petal.angle + (Math.PI / 4) * severity;
    
    // Reduce vitality
    petal.targetLength *= (1 - severity * 0.4);
    petal.targetCurve = -Math.abs(petal.targetCurve) * severity;
    
    // Desaturate colors
    petal.opacity = 1 - severity * 0.3;
  });
}
```

## Special Effects

### Pollen Particles
```typescript
// Small particles that emit from flower when speaking
function emitPollen(petal: Petal, amplitude: number) {
  if (amplitude > 0.7 && Math.random() < 0.1) {
    particles.push({
      x: petal.tipX,
      y: petal.tipY,
      vx: Math.random() * 2 - 1,
      vy: -Math.random() * 2,
      size: Math.random() * 3 + 1,
      life: 1.0,
      color: petal.color
    });
  }
}
```

### Center Glow
```typescript
// Dynamic center radial gradient
function updateCenterGlow(amplitude: number, topic: HealthTopic) {
  const glowRadius = 40 + amplitude * 20;
  const glowOpacity = 0.3 + amplitude * 0.4;
  const [color1, color2] = TOPIC_COLORS[topic].gradient;
  
  // Update SVG radial gradient
  centerGradient.setAttribute('r', glowRadius);
  centerGradient.children[0].setAttribute('stop-color', color1);
  centerGradient.children[1].setAttribute('stop-color', color2);
}
```

## Interaction Patterns

### Touch/Mouse Interactions
- **Hover over petal**: Highlight and show frequency band
- **Click center**: Start/stop listening
- **Drag**: Rotate flower manually
- **Pinch**: Scale flower size

### Responsive Behaviors
```typescript
// Petal hover effect
function onPetalHover(petalIndex: number) {
  const petal = petals[petalIndex];
  petal.targetWidth *= 1.5;
  petal.glowIntensity = 1;
  
  // Show frequency tooltip
  showTooltip(`${getFrequencyBand(petalIndex)} Hz`);
}
```

## Performance Considerations

### Optimization Strategies
1. **Batch SVG Updates**: Collect all changes, update once per frame
2. **GPU Acceleration**: Use CSS transforms for rotation
3. **Throttle Frequency Analysis**: Max 30Hz update rate
4. **Reuse Path Elements**: Don't recreate, just update attributes
5. **Limit Particles**: Max 20 pollen particles

### Frame Rate Management
```typescript
let lastUpdate = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

function animate(timestamp: number) {
  if (timestamp - lastUpdate >= FRAME_TIME) {
    updateFlower();
    renderFlower();
    lastUpdate = timestamp;
  }
  requestAnimationFrame(animate);
}
```

## Accessibility Features
- **Sonification**: Audio feedback for petal states
- **Keyboard Control**: Arrow keys to "play" petals
- **Screen Reader**: Announce bloom percentage
- **High Contrast**: Bold mode with thicker petals
- **Reduced Motion**: Simple fade instead of bloom

## File Structure
```
app/voice/frequency-flower/
├── page.tsx              # Main component
├── FlowerSVG.tsx         # SVG flower renderer
├── PetalSystem.ts        # Petal state management
├── FrequencyAnalyzer.ts  # Audio frequency analysis
├── HealthTopicDetector.ts # Topic classification
├── ParticleEffects.tsx   # Pollen particles
└── types.ts              # TypeScript interfaces
```

## Implementation Checklist
- [ ] Basic flower geometry renders
- [ ] Petals respond to amplitude
- [ ] Frequency band mapping works
- [ ] Health topic colors change
- [ ] Wilting animation smooth
- [ ] Pollen particles emit
- [ ] Touch interactions responsive
- [ ] Performance stays at 60fps

## Key Implementation Notes
1. Use SVG filters for petal glow effects
2. Implement ease-out curves for natural motion
3. Cache trigonometric calculations
4. Add subtle noise to prevent mechanical feel
5. Petals should overlap slightly for depth
6. Consider wind effect for idle animation