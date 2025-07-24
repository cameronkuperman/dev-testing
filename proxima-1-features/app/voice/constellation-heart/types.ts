export interface Star {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  size: number;
  baseSize: number;
  brightness: number;
  baseBrightness: number;
  pulsePhase: number;
  isCore: boolean;
  connections: number[];
  velocity: { x: number; y: number };
}

export interface Point {
  x: number;
  y: number;
}

export interface ConstellationState {
  stars: Star[];
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'forming';
  heartbeatPhase: number;
  bpm: number;
  sentiment: number;
}

export interface HealthState {
  normal: { bpm: number; color: string };
  elevated: { bpm: number; color: string };
  concerning: { bpm: number; color: string };
  critical: { bpm: number; color: string };
}