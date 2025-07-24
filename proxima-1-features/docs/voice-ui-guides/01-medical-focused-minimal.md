# Medical-Focused Minimal Voice UI Implementation Guide

## Route: `/voice/medical-minimal`

## Overview
A minimalist medical voice interface featuring a central circle with an EKG heartbeat line running through it. The line animates with voice amplitude, creating a direct medical context connection.

## Visual Design Specifications

### Layout Structure
```
[Full Screen Container - #0a0a0a background]
    [Center Container - Flexbox centered]
        [Voice Circle - 240px diameter]
            [EKG Line - Horizontal through center]
        [Status Text - Below circle]
    [Emergency Button - Fixed top-right]
    [Control Bar - Fixed bottom]
```

### Color Palette
- Background: `#0a0a0a` (Proxima-1 dark)
- Circle Border: `rgba(255, 255, 255, 0.1)` idle, `rgba(147, 51, 234, 0.5)` active
- EKG Line: `#10b981` (emerald-500) normal, `#ef4444` (red-500) emergency
- Text: `#9ca3af` (gray-400)
- Emergency Button: `#dc2626` (red-600)

### Component Details

#### 1. Voice Circle
- **Size**: 240px × 240px
- **Border**: 2px solid with glass morphism
- **Background**: `rgba(255, 255, 255, 0.02)` with backdrop blur
- **Hover Effect**: Border opacity increases to 0.2
- **Active State**: Purple glow shadow

#### 2. EKG Line Animation
- **Canvas Element**: 240px × 80px (positioned center of circle)
- **Line Width**: 2px
- **Animation States**:
  - **Idle**: Slow sine wave (0.5Hz)
  - **Listening**: Flat line with occasional small bumps
  - **Speaking**: Dynamic wave based on amplitude
  - **Emergency**: Rapid, erratic pattern

#### 3. Status Messages
- **Font**: System font stack, 16px, gray-400
- **States**:
  - "Click to start listening"
  - "Listening to your symptoms..."
  - "Processing your response..."
  - "Speaking..."
  - "Emergency mode activated"

#### 4. Emergency Button
- **Position**: Fixed, top: 24px, right: 24px
- **Size**: 48px × 48px
- **Icon**: Alert triangle
- **Behavior**: Long press (1s) to activate

## Technical Implementation

### State Management
```typescript
interface VoiceState {
  mode: 'idle' | 'listening' | 'processing' | 'speaking' | 'emergency';
  amplitude: number;
  isEmergency: boolean;
  transcript: string;
  confidence: number;
}
```

### Canvas EKG Implementation
```typescript
// Key animation functions
drawIdleWave(ctx, time, width, height)
drawListeningLine(ctx, amplitude, width, height)
drawSpeakingWave(ctx, amplitude, history, width, height)
drawEmergencyPattern(ctx, time, width, height)
```

### Voice Detection Integration
- Use `useVoiceDetection` hook
- Map amplitude (0-1) to wave height (0-40px)
- Smooth amplitude changes with rolling average
- Store last 50 amplitude values for wave history

### Animation Details

#### Idle Animation
```
y = centerY + Math.sin(time * 0.5) * 10
```

#### Speaking Animation
```
// Create realistic EKG pattern
1. Base sine wave from amplitude
2. Add QRS complex spikes at intervals
3. Smooth with bezier curves
4. Add slight noise for realism
```

#### Emergency Pattern
```
// Erratic but recognizable as problematic
1. Increased frequency (3x normal)
2. Irregular amplitudes
3. Occasional flatline sections
4. Red color shift
```

## Interaction Flows

### Starting Voice Session
1. User clicks circle
2. Mic permission requested
3. Circle border glows purple
4. EKG line transitions from idle to listening
5. Status updates to "Listening..."

### During Conversation
1. EKG responds to voice in real-time
2. Transcript appears below (optional)
3. Visual feedback for AI processing
4. Smooth transitions between states

### Emergency Activation
1. Long press emergency button OR say "emergency"
2. UI shifts to red theme
3. EKG shows concerning pattern
4. Auto-connects to emergency services prompt

## Accessibility Features
- Keyboard navigation (Space to start/stop)
- Screen reader announcements for state changes
- High contrast mode option
- Reduced motion mode (simplifies animations)

## Performance Optimizations
- Use `requestAnimationFrame` for smooth 60fps
- Canvas off-screen rendering for complex paths
- Debounce amplitude updates (60Hz max)
- Dispose audio context when unmounted

## Error Handling
- Graceful mic permission denial
- Fallback to simulation mode
- Network error recovery
- Browser compatibility warnings

## File Structure
```
app/voice/medical-minimal/
├── page.tsx           # Main component
├── EKGCanvas.tsx      # Canvas animation component
├── VoiceControls.tsx  # Control buttons
├── EmergencyButton.tsx # Emergency component
└── types.ts           # TypeScript interfaces
```

## Key Implementation Notes
1. Canvas must be antialiased for smooth lines
2. Use CSS transforms for circle animations (GPU accelerated)
3. Emergency mode persists until manually cleared
4. Save amplitude history in circular buffer
5. Implement gradual color transitions (no jarring changes)

## Testing Checklist
- [ ] Mic permission flow works
- [ ] EKG animates smoothly at 60fps
- [ ] Emergency mode activates correctly
- [ ] All status messages display
- [ ] Keyboard navigation works
- [ ] Mobile responsive (scales down)
- [ ] Error states handled gracefully
- [ ] Memory leaks prevented (cleanup)