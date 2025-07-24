import { Point } from './types';

export class HeartMath {
  static getHeartPosition(t: number, scale: number, centerX: number, centerY: number): Point {
    // Parametric heart equation
    const x = scale * 16 * Math.pow(Math.sin(t), 3);
    const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 
               2 * Math.cos(3 * t) - Math.cos(4 * t));
    
    return { 
      x: x + centerX, 
      y: y + centerY - scale * 5 // Adjust vertical position
    };
  }

  static calculateHeartPositions(starCount: number, scale: number, centerX: number, centerY: number): Point[] {
    const positions: Point[] = [];
    
    for (let i = 0; i < starCount; i++) {
      const t = (i / starCount) * Math.PI * 2;
      positions.push(this.getHeartPosition(t, scale, centerX, centerY));
    }
    
    return positions;
  }

  static getDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  static calculateHeartbeatPulse(phase: number): number {
    // Simulate realistic heartbeat pattern
    // P wave -> QRS complex -> T wave
    
    if (phase < 0.1) {
      // P wave
      return 1 + Math.sin(phase * Math.PI / 0.1) * 0.2;
    } else if (phase < 0.15) {
      // QRS spike
      const qrsPhase = (phase - 0.1) / 0.05;
      return 1.2 + Math.sin(qrsPhase * Math.PI) * 0.6;
    } else if (phase < 0.3) {
      // T wave
      const tPhase = (phase - 0.15) / 0.15;
      return 1 + Math.sin(tPhase * Math.PI) * 0.1;
    }
    
    // Baseline
    return 1;
  }

  static getCurrentBPM(state: 'rest' | 'active' | 'stressed'): number {
    const HEARTBEAT_PATTERN = {
      rest: 60,
      active: 80,
      stressed: 100
    };
    
    return HEARTBEAT_PATTERN[state];
  }
}