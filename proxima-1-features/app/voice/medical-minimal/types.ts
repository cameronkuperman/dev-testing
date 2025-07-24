export interface VoiceState {
  mode: 'idle' | 'listening' | 'processing' | 'speaking' | 'emergency';
  amplitude: number;
  isEmergency: boolean;
  transcript: string;
  confidence: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface EKGCanvasProps {
  amplitude: number;
  mode: VoiceState['mode'];
  isEmergency: boolean;
}