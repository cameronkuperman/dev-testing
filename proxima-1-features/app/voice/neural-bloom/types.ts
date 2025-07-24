export interface Branch {
  id: string;
  level: number;
  angle: number;
  length: number;
  parent?: string;
  children: string[];
  opacity: number;
  growthProgress: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  controlPoint1X?: number;
  controlPoint1Y?: number;
  controlPoint2X?: number;
  controlPoint2Y?: number;
}

export interface SynapticPulse {
  id: string;
  pathId: string;
  progress: number;
  opacity: number;
}

export interface NeuralBloomState {
  branches: Map<string, Branch>;
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'thinking';
  synapticPulses: SynapticPulse[];
  rotationAngle: number;
}

export interface Point {
  x: number;
  y: number;
}