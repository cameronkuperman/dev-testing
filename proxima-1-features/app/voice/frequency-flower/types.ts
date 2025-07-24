export interface Petal {
  angle: number;
  baseX: number;
  baseY: number;
  length: number;
  targetLength: number;
  curve: number;
  targetCurve: number;
  width: number;
  targetWidth: number;
  color: string;
  opacity: number;
}

export interface FrequencyData {
  bass: number;       // 20-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2000 Hz
  highMid: number;    // 2000-4000 Hz
  treble: number;     // 4000-20000 Hz
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
}

export type HealthTopic = 
  | 'general' 
  | 'cardio' 
  | 'respiratory' 
  | 'neural' 
  | 'digestive' 
  | 'mental' 
  | 'emergency';

export interface TopicColors {
  gradient: string[];
}

export interface FlowerState {
  petals: Petal[];
  amplitude: number;
  mode: 'closed' | 'listening' | 'speaking' | 'wilting';
  topic: HealthTopic;
  particles: Particle[];
  rotationAngle: number;
}