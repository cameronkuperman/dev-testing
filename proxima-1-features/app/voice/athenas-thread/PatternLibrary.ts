import { Pattern, ThreadPoint } from './types';

export class PatternLibrary {
  private readonly POINT_COUNT = 200;
  private readonly CANVAS_WIDTH = 600;
  private readonly CANVAS_HEIGHT = 400;
  private readonly MARGIN = 50;

  // Easing functions for smooth transitions
  private easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  calculatePatternPoints(pattern: Pattern, pointCount: number = this.POINT_COUNT): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    
    switch (pattern) {
      case 'sine':
        return this.createSineWave(pointCount);
      case 'straight':
        return this.createStraightLine(pointCount);
      case 'caduceus':
        return this.createCaduceus(pointCount);
      case 'greekkey':
        return this.createGreekKey(pointCount);
      case 'dna':
        return this.createDNA(pointCount);
      case 'heartbeat':
        return this.createHeartbeat(pointCount);
      default:
        return this.createSineWave(pointCount);
    }
  }

  private createSineWave(pointCount: number): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    const amplitude = 40;
    const frequency = 0.02;
    const width = this.CANVAS_WIDTH - 2 * this.MARGIN;
    
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1);
      const x = this.MARGIN + t * width;
      const y = this.CANVAS_HEIGHT / 2 + Math.sin(x * frequency) * amplitude;
      
      points.push({
        x,
        y,
        tension: 0.5,
        velocity: { x: 0, y: 0 },
        targetX: x,
        targetY: y
      });
    }
    
    return points;
  }

  private createStraightLine(pointCount: number): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    const width = this.CANVAS_WIDTH - 2 * this.MARGIN;
    const y = this.CANVAS_HEIGHT / 2;
    
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1);
      const x = this.MARGIN + t * width;
      
      points.push({
        x,
        y,
        tension: 0.1,
        velocity: { x: 0, y: 0 },
        targetX: x,
        targetY: y
      });
    }
    
    return points;
  }

  private createCaduceus(pointCount: number): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    const centerX = this.CANVAS_WIDTH / 2;
    const startY = this.MARGIN;
    const endY = this.CANVAS_HEIGHT - this.MARGIN;
    const staffHeight = endY - startY;
    
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1);
      let x: number, y: number;
      
      if (t < 0.15) {
        // Wings at top - create smooth wing shapes
        const wingT = t / 0.15;
        const wingAngle = wingT * Math.PI;
        const wingRadius = 60;
        
        if (i % 2 === 0) {
          // Left wing
          x = centerX - wingRadius * (1 - Math.cos(wingAngle));
          y = startY + wingRadius * Math.sin(wingAngle) * 0.5;
        } else {
          // Right wing
          x = centerX + wingRadius * (1 - Math.cos(wingAngle));
          y = startY + wingRadius * Math.sin(wingAngle) * 0.5;
        }
      } else {
        // Intertwined snakes on staff
        const snakeT = (t - 0.15) / 0.85;
        y = startY + staffHeight * 0.15 + staffHeight * 0.85 * snakeT;
        
        // Create double helix effect
        const coils = 5;
        const coilPhase = snakeT * Math.PI * 2 * coils;
        const coilRadius = 25;
        
        // Alternate between two snakes
        if (Math.floor(i * coils / pointCount) % 2 === 0) {
          x = centerX + Math.sin(coilPhase) * coilRadius;
        } else {
          x = centerX + Math.sin(coilPhase + Math.PI) * coilRadius;
        }
        
        // Add slight variation for organic feel
        x += Math.sin(i * 0.1) * 2;
      }
      
      points.push({
        x,
        y,
        tension: 0.6,
        velocity: { x: 0, y: 0 },
        targetX: x,
        targetY: y
      });
    }
    
    return points;
  }

  private createGreekKey(pointCount: number): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    const unitSize = 40;
    const pattern = [
      // One complete meander unit
      { dx: 0, dy: 0 },
      { dx: 2, dy: 0 },
      { dx: 2, dy: 2 },
      { dx: 1, dy: 2 },
      { dx: 1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: 3 },
      { dx: 3, dy: 3 },
      { dx: 3, dy: 0 },
      { dx: 4, dy: 0 }
    ];
    
    const repeats = 3;
    const totalWidth = pattern[pattern.length - 1].dx * unitSize * repeats;
    const startX = (this.CANVAS_WIDTH - totalWidth) / 2;
    const centerY = this.CANVAS_HEIGHT / 2;
    
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1);
      const patternProgress = t * repeats;
      const repeatIndex = Math.floor(patternProgress);
      const localProgress = patternProgress - repeatIndex;
      
      // Interpolate between pattern points
      const patternIndex = Math.floor(localProgress * (pattern.length - 1));
      const patternT = localProgress * (pattern.length - 1) - patternIndex;
      
      const p1 = pattern[Math.min(patternIndex, pattern.length - 1)];
      const p2 = pattern[Math.min(patternIndex + 1, pattern.length - 1)];
      
      const x = startX + repeatIndex * pattern[pattern.length - 1].dx * unitSize +
                (p1.dx + (p2.dx - p1.dx) * patternT) * unitSize;
      const y = centerY - unitSize + (p1.dy + (p2.dy - p1.dy) * patternT) * unitSize;
      
      points.push({
        x,
        y,
        tension: 0.1, // Sharp corners
        velocity: { x: 0, y: 0 },
        targetX: x,
        targetY: y
      });
    }
    
    return points;
  }

  private createDNA(pointCount: number): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    const centerX = this.CANVAS_WIDTH / 2;
    const startY = this.MARGIN;
    const endY = this.CANVAS_HEIGHT - this.MARGIN;
    const helixHeight = endY - startY;
    const helixRadius = 40;
    const rotations = 3;
    
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1);
      const y = startY + t * helixHeight;
      const angle = t * Math.PI * 2 * rotations;
      
      // Create double helix with proper crossing
      const strand = i % 4 < 2 ? 0 : 1; // Alternate between strands
      const phase = strand * Math.PI;
      const x = centerX + Math.cos(angle + phase) * helixRadius;
      
      // Add base pair connections at regular intervals
      if (i % 10 === 0) {
        // Create slight bulge for base pair connection points
        points.push({
          x: centerX + Math.cos(angle + phase) * (helixRadius * 0.8),
          y,
          tension: 0.8,
          velocity: { x: 0, y: 0 },
          targetX: x,
          targetY: y
        });
      } else {
        points.push({
          x,
          y,
          tension: 0.7,
          velocity: { x: 0, y: 0 },
          targetX: x,
          targetY: y
        });
      }
    }
    
    return points;
  }

  private createHeartbeat(pointCount: number): ThreadPoint[] {
    const points: ThreadPoint[] = [];
    const width = this.CANVAS_WIDTH - 2 * this.MARGIN;
    const centerY = this.CANVAS_HEIGHT / 2;
    const beatWidth = width / 2.5; // Space for complete PQRST complex
    const startX = (this.CANVAS_WIDTH - beatWidth) / 2;
    
    // Medical-accurate ECG wave proportions
    const segments = [
      // Baseline before P wave
      { start: 0, end: 0.1, y: 0 },
      // P wave (atrial depolarization)
      { start: 0.1, end: 0.15, y: -10, curve: true },
      { start: 0.15, end: 0.2, y: 0, curve: true },
      // PR segment
      { start: 0.2, end: 0.25, y: 0 },
      // Q wave (small negative)
      { start: 0.25, end: 0.27, y: 5 },
      // R wave (large positive spike)
      { start: 0.27, end: 0.3, y: -60 },
      { start: 0.3, end: 0.33, y: 20 },
      // S wave return to baseline
      { start: 0.33, end: 0.35, y: 0 },
      // ST segment
      { start: 0.35, end: 0.45, y: 0 },
      // T wave (ventricular repolarization)
      { start: 0.45, end: 0.55, y: -15, curve: true },
      { start: 0.55, end: 0.65, y: 0, curve: true },
      // Baseline after T wave
      { start: 0.65, end: 1, y: 0 }
    ];
    
    for (let i = 0; i < pointCount; i++) {
      const t = i / (pointCount - 1);
      let x = startX + t * beatWidth;
      let y = centerY;
      
      // Find which segment we're in
      for (const segment of segments) {
        if (t >= segment.start && t <= segment.end) {
          const segmentT = (t - segment.start) / (segment.end - segment.start);
          
          if (segment.curve) {
            // Smooth curve for P and T waves
            y = centerY + segment.y * Math.sin(segmentT * Math.PI);
          } else {
            // Linear interpolation for sharp QRS complex
            const prevSegment = segments[segments.indexOf(segment) - 1];
            const prevY = prevSegment ? prevSegment.y : 0;
            y = centerY + prevY + (segment.y - prevY) * segmentT;
          }
          break;
        }
      }
      
      points.push({
        x,
        y,
        tension: 0.3,
        velocity: { x: 0, y: 0 },
        targetX: x,
        targetY: y
      });
    }
    
    return points;
  }

  // Smooth interpolation between patterns
  interpolatePatterns(
    fromPoints: ThreadPoint[], 
    toPoints: ThreadPoint[], 
    progress: number,
    easing: (t: number) => number = this.easeInOutCubic
  ): ThreadPoint[] {
    const easedProgress = easing(progress);
    const interpolated: ThreadPoint[] = [];
    
    for (let i = 0; i < fromPoints.length; i++) {
      const from = fromPoints[i];
      const to = toPoints[i];
      
      interpolated.push({
        x: from.x + (to.x - from.x) * easedProgress,
        y: from.y + (to.y - from.y) * easedProgress,
        tension: from.tension + (to.tension - from.tension) * easedProgress,
        velocity: { x: 0, y: 0 },
        targetX: to.targetX,
        targetY: to.targetY
      });
    }
    
    return interpolated;
  }
}