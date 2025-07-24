import { Thread, Pattern, ThreadPoint } from './types';
import { PatternLibrary } from './PatternLibrary';

export class MorphEngine {
  private patternLibrary: PatternLibrary;
  private morphQueue: Pattern[] = [];
  private isMorphing: boolean = false;
  private morphStartTime: number = 0;
  private morphDuration: number = 1200; // ms
  private currentPattern: Pattern = 'sine';
  private targetPattern: Pattern = 'sine';
  private sourcePoints: ThreadPoint[] = [];
  private targetPoints: ThreadPoint[] = [];

  constructor() {
    this.patternLibrary = new PatternLibrary();
  }

  morphToPattern(
    thread: Thread, 
    newPattern: Pattern, 
    duration: number = this.morphDuration
  ) {
    // Queue pattern if already morphing
    if (this.isMorphing && newPattern !== this.targetPattern) {
      this.morphQueue = [newPattern]; // Replace queue with latest request
      return;
    }

    this.currentPattern = thread.pattern;
    this.targetPattern = newPattern;
    this.morphDuration = duration;
    this.morphStartTime = Date.now();
    this.isMorphing = true;

    // Capture current state as source
    this.sourcePoints = thread.points.map(p => ({ ...p }));
    
    // Calculate target pattern
    this.targetPoints = this.patternLibrary.calculatePatternPoints(newPattern);
  }

  update(thread: Thread): boolean {
    if (!this.isMorphing) {
      // Check if there's a queued pattern
      if (this.morphQueue.length > 0) {
        const nextPattern = this.morphQueue.shift()!;
        this.morphToPattern(thread, nextPattern);
      }
      return false;
    }

    const elapsed = Date.now() - this.morphStartTime;
    const progress = Math.min(elapsed / this.morphDuration, 1);

    // Use different easing based on pattern type
    const easing = this.getEasingForTransition(this.currentPattern, this.targetPattern);
    const easedProgress = easing(progress);

    // Interpolate points
    thread.points = this.patternLibrary.interpolatePatterns(
      this.sourcePoints,
      this.targetPoints,
      easedProgress
    );

    // Update morph progress
    thread.morphProgress = progress;

    // Check if morph is complete
    if (progress >= 1) {
      thread.pattern = this.targetPattern;
      thread.morphProgress = 0;
      this.isMorphing = false;
      this.currentPattern = this.targetPattern;
      return true; // Morph completed
    }

    return false; // Still morphing
  }

  private getEasingForTransition(from: Pattern, to: Pattern): (t: number) => number {
    // Custom easing for specific transitions
    if (from === 'sine' && to === 'straight') {
      // Quick snap to attention
      return (t: number) => this.easeOutExpo(t);
    } else if (from === 'straight' && (to === 'caduceus' || to === 'dna')) {
      // Smooth organic growth
      return (t: number) => this.easeInOutQuart(t);
    } else if (to === 'heartbeat') {
      // Sudden urgency
      return (t: number) => this.easeOutBack(t);
    } else {
      // Default smooth transition
      return (t: number) => this.easeInOutCubic(t);
    }
  }

  // Easing functions
  private easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  private easeInOutQuart(t: number): number {
    return t < 0.5 
      ? 8 * t * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // Get appropriate pattern based on voice context
  detectPatternFromContext(
    amplitude: number, 
    duration: number,
    transcript: string = ''
  ): Pattern {
    const keywords = transcript.toLowerCase();

    // Direct pattern triggers
    if (keywords.includes('emergency') || keywords.includes('urgent')) {
      return 'heartbeat';
    }
    if (keywords.includes('medical') || keywords.includes('doctor')) {
      return 'caduceus';
    }
    if (keywords.includes('genetic') || keywords.includes('hereditary')) {
      return 'dna';
    }

    // Amplitude and duration based selection
    if (amplitude < 0.1) {
      return 'sine'; // Idle
    } else if (amplitude > 0.7 && duration < 2000) {
      return 'heartbeat'; // Excited, quick
    } else if (duration > 5000) {
      return 'dna'; // Long explanation
    } else if (amplitude > 0.5) {
      return 'caduceus'; // Active medical discussion
    } else {
      return 'greekkey'; // General wisdom pattern
    }
  }

  getCurrentPattern(): Pattern {
    return this.currentPattern;
  }

  getTargetPattern(): Pattern {
    return this.targetPattern;
  }

  isMorphingActive(): boolean {
    return this.isMorphing;
  }

  getMorphProgress(): number {
    if (!this.isMorphing) return 0;
    const elapsed = Date.now() - this.morphStartTime;
    return Math.min(elapsed / this.morphDuration, 1);
  }
}