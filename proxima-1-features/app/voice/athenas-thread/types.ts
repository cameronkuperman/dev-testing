export interface ThreadPoint {
  x: number;
  y: number;
  tension: number;
  velocity: { x: number; y: number };
  targetX: number;
  targetY: number;
}

export interface Thread {
  points: ThreadPoint[];
  pattern: Pattern;
  morphProgress: number;
  color: ThreadColor;
}

export type Pattern = 
  | 'sine' 
  | 'straight' 
  | 'caduceus' 
  | 'greekkey' 
  | 'dna' 
  | 'heartbeat';

export interface ThreadColor {
  start: string;
  middle?: string;
  end: string;
}

export interface PatternDefinition {
  name: Pattern;
  points: (progress: number) => { x: number; y: number }[];
  duration: number;
  easing: (t: number) => number;
}

export interface ThreadState {
  thread: Thread;
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'thinking';
  currentPattern: Pattern;
  targetPattern: Pattern;
  morphStartTime: number;
  wisdomText: string;
}