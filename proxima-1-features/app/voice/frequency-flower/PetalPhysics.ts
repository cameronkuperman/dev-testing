import { Petal, FrequencyData } from './types';

export class PetalPhysics {
  private readonly PETAL_COUNT = 12;
  private readonly CENTER_X = 225;
  private readonly CENTER_Y = 225;
  private readonly BASE_RADIUS = 40;
  
  // Spring physics constants for natural movement
  private readonly SPRING_STIFFNESS = 0.12;
  private readonly SPRING_DAMPING = 0.85;
  private readonly MASS = 1;
  
  // Noise generators for organic movement
  private noiseOffsets: Map<number, { x: number; y: number; time: number }> = new Map();

  createPetals(): Petal[] {
    const petals: Petal[] = [];
    const angleStep = (Math.PI * 2) / this.PETAL_COUNT;
    
    for (let i = 0; i < this.PETAL_COUNT; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const baseX = this.CENTER_X + Math.cos(angle) * this.BASE_RADIUS;
      const baseY = this.CENTER_Y + Math.sin(angle) * this.BASE_RADIUS;
      
      petals.push({
        angle,
        baseX,
        baseY,
        length: 20,
        targetLength: 20,
        curve: 0,
        targetCurve: 0,
        width: 2,
        targetWidth: 2,
        color: '#a855f7',
        opacity: 0.9
      });
      
      // Initialize noise offsets for organic movement
      this.noiseOffsets.set(i, {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        time: Math.random() * Math.PI * 2
      });
    }
    
    return petals;
  }

  mapFrequenciesToPetals(freqData: FrequencyData, petals: Petal[]) {
    // Map frequency bands to petal groups with overlap for smooth transitions
    const frequencyBands = [
      freqData.bass,
      freqData.bass * 0.7 + freqData.lowMid * 0.3,
      freqData.lowMid,
      freqData.lowMid * 0.5 + freqData.mid * 0.5,
      freqData.mid,
      freqData.mid * 0.7 + freqData.highMid * 0.3,
      freqData.highMid,
      freqData.highMid * 0.5 + freqData.treble * 0.5,
      freqData.treble,
      freqData.treble * 0.8 + freqData.highMid * 0.2,
      freqData.highMid * 0.3 + freqData.mid * 0.7,
      freqData.mid * 0.5 + freqData.bass * 0.5
    ];
    
    petals.forEach((petal, i) => {
      const amplitude = frequencyBands[i] || 0;
      
      // Apply smoothed amplitude with variation
      const variation = 0.8 + Math.sin(Date.now() * 0.001 + i * 0.5) * 0.2;
      const smoothedAmplitude = amplitude * variation;
      
      // Calculate target values with artistic scaling
      petal.targetLength = 60 + smoothedAmplitude * 120;
      petal.targetWidth = 2 + smoothedAmplitude * 6;
      petal.targetCurve = smoothedAmplitude * 40 * (i % 2 === 0 ? 1 : -1); // Alternate curve direction
    });
  }

  updatePetalBloom(amplitude: number, petals: Petal[], deltaTime: number) {
    const time = Date.now() * 0.001; // Convert to seconds
    
    petals.forEach((petal, i) => {
      const noise = this.noiseOffsets.get(i);
      if (!noise) return;
      
      // Organic noise movement
      const noiseX = this.simplexNoise(noise.x + time * 0.3) * 0.1;
      const noiseY = this.simplexNoise(noise.y + time * 0.3) * 0.1;
      
      // Base bloom factor with individual variation
      const phaseOffset = (i / this.PETAL_COUNT) * Math.PI * 2;
      const individualBloom = amplitude + Math.sin(time + phaseOffset) * 0.05 + noiseX;
      
      // Spring physics for smooth transitions
      const lengthDiff = (petal.targetLength * individualBloom - petal.length);
      const lengthAccel = lengthDiff * this.SPRING_STIFFNESS;
      petal.length += lengthAccel * deltaTime * 0.06;
      petal.length *= this.SPRING_DAMPING;
      
      const widthDiff = (petal.targetWidth - petal.width);
      const widthAccel = widthDiff * this.SPRING_STIFFNESS * 0.8;
      petal.width += widthAccel * deltaTime * 0.06;
      petal.width *= this.SPRING_DAMPING;
      
      const curveDiff = (petal.targetCurve - petal.curve);
      const curveAccel = curveDiff * this.SPRING_STIFFNESS * 1.2;
      petal.curve += curveAccel * deltaTime * 0.06;
      petal.curve *= this.SPRING_DAMPING;
      
      // Add subtle rotation based on amplitude
      petal.angle += noiseY * amplitude * 0.02;
      
      // Update opacity based on bloom state
      petal.opacity = 0.7 + individualBloom * 0.3;
    });
  }

  applyConcernWilting(severity: number, petals: Petal[]) {
    petals.forEach((petal, i) => {
      // Progressive wilting from outer petals inward
      const wiltDelay = i / this.PETAL_COUNT;
      const adjustedSeverity = Math.max(0, severity - wiltDelay * 0.3);
      
      // Droop calculation with natural curve
      const droopAngle = petal.angle + (Math.PI / 6) * adjustedSeverity;
      const droopFactor = 1 - adjustedSeverity * 0.4;
      
      // Reduce vitality
      petal.targetLength *= droopFactor;
      petal.targetCurve = Math.abs(petal.targetCurve) * adjustedSeverity * -1.5;
      
      // Desaturate through opacity
      petal.opacity = 0.9 - adjustedSeverity * 0.4;
      
      // Add slight tremor for concerning states
      if (severity > 0.5) {
        const tremor = Math.sin(Date.now() * 0.01 + i) * 0.02 * severity;
        petal.angle += tremor;
      }
    });
  }

  // Simplified 1D Perlin noise for organic movement
  private simplexNoise(x: number): number {
    const xi = Math.floor(x);
    const xf = x - xi;
    
    const a = this.pseudoRandom(xi);
    const b = this.pseudoRandom(xi + 1);
    
    // Smoothstep interpolation
    const t = xf * xf * (3 - 2 * xf);
    return a * (1 - t) + b * t;
  }

  private pseudoRandom(x: number): number {
    x = ((x * 34842.34273) % 1) * 29742.23423;
    return ((Math.sin(x) * 84721.27364) % 1);
  }
}