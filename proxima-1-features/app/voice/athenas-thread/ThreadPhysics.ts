import { Thread, ThreadPoint } from './types';

export class ThreadPhysics {
  private readonly DAMPING = 0.92;
  private readonly SPRING_STRENGTH = 0.15;
  private readonly NOISE_STRENGTH = 0.002;
  private readonly VOICE_INFLUENCE = 20;
  
  private noiseOffset = 0;
  private time = 0;

  applyPhysics(thread: Thread, deltaTime: number) {
    this.time += deltaTime * 0.001; // Convert to seconds
    
    thread.points.forEach((point, i) => {
      // Spring force toward target position
      const dx = point.targetX - point.x;
      const dy = point.targetY - point.y;
      
      point.velocity.x += dx * this.SPRING_STRENGTH;
      point.velocity.y += dy * this.SPRING_STRENGTH;
      
      // Apply damping for smooth motion
      point.velocity.x *= this.DAMPING;
      point.velocity.y *= this.DAMPING;
      
      // Add subtle noise for organic movement
      const noise = this.getNoiseValue(i + this.noiseOffset);
      point.velocity.x += noise.x * this.NOISE_STRENGTH;
      point.velocity.y += noise.y * this.NOISE_STRENGTH;
      
      // Update position
      point.x += point.velocity.x * deltaTime * 0.06;
      point.y += point.velocity.y * deltaTime * 0.06;
    });
    
    this.noiseOffset += 0.01;
  }

  applyVoiceDistortion(
    thread: Thread, 
    amplitude: number, 
    frequencyData?: Float32Array
  ) {
    const points = thread.points;
    const pointCount = points.length;
    
    points.forEach((point, i) => {
      // Get the local thread direction
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(pointCount - 1, i + 1)];
      
      const tangentX = next.x - prev.x;
      const tangentY = next.y - prev.y;
      const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
      
      if (tangentLength > 0) {
        // Normalize tangent
        const normalX = -tangentY / tangentLength;
        const normalY = tangentX / tangentLength;
        
        // Apply voice-based distortion perpendicular to thread
        let distortion = amplitude * this.VOICE_INFLUENCE;
        
        // If we have frequency data, modulate by frequency
        if (frequencyData && frequencyData.length > 0) {
          const freqIndex = Math.floor((i / pointCount) * frequencyData.length);
          const freqAmplitude = frequencyData[freqIndex] / 255;
          distortion *= (0.5 + freqAmplitude * 0.5);
        }
        
        // Add wave propagation effect
        const wavePhase = this.time * 5 + i * 0.1;
        const waveInfluence = Math.sin(wavePhase) * 0.3;
        distortion *= (1 + waveInfluence);
        
        // Apply the distortion
        point.targetX = point.x + normalX * distortion;
        point.targetY = point.y + normalY * distortion;
      }
    });
  }

  // Add tension-based smoothing for more natural curves
  applySmoothingPass(thread: Thread) {
    const points = thread.points;
    const smoothedPoints: ThreadPoint[] = [];
    
    for (let i = 0; i < points.length; i++) {
      if (i === 0 || i === points.length - 1) {
        // Keep endpoints fixed
        smoothedPoints.push({ ...points[i] });
      } else {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        const tension = curr.tension;
        
        // Catmull-Rom spline smoothing
        smoothedPoints.push({
          ...curr,
          x: curr.x * (1 - tension) + (prev.x + next.x) * 0.5 * tension,
          y: curr.y * (1 - tension) + (prev.y + next.y) * 0.5 * tension
        });
      }
    }
    
    thread.points = smoothedPoints;
  }

  // Create ripple effect at specific point
  createRipple(thread: Thread, epicenterIndex: number, strength: number) {
    const points = thread.points;
    const rippleRadius = 30; // Number of points affected
    
    points.forEach((point, i) => {
      const distance = Math.abs(i - epicenterIndex);
      if (distance < rippleRadius) {
        const influence = 1 - (distance / rippleRadius);
        const rippleStrength = strength * influence * Math.sin(this.time * 10);
        
        // Apply ripple perpendicular to thread
        const angle = Math.PI / 2;
        point.velocity.y += Math.sin(angle) * rippleStrength;
      }
    });
  }

  // Simple 2D Perlin-like noise
  private getNoiseValue(x: number): { x: number; y: number } {
    const xi = Math.floor(x);
    const xf = x - xi;
    
    // Pseudo-random gradients
    const g1x = this.pseudoRandom(xi) * 2 - 1;
    const g1y = this.pseudoRandom(xi + 1000) * 2 - 1;
    const g2x = this.pseudoRandom(xi + 1) * 2 - 1;
    const g2y = this.pseudoRandom(xi + 1001) * 2 - 1;
    
    // Smoothstep
    const t = xf * xf * (3 - 2 * xf);
    
    return {
      x: g1x * (1 - t) + g2x * t,
      y: g1y * (1 - t) + g2y * t
    };
  }

  private pseudoRandom(x: number): number {
    x = ((x * 34842.34273) % 1) * 29742.23423;
    return ((Math.sin(x) * 84721.27364) % 1);
  }

  // Apply constraints to keep thread on screen
  applyConstraints(thread: Thread, width: number, height: number) {
    const margin = 20;
    
    thread.points.forEach(point => {
      // Soft constraints with spring back
      if (point.x < margin) {
        point.velocity.x += (margin - point.x) * 0.1;
      } else if (point.x > width - margin) {
        point.velocity.x += (width - margin - point.x) * 0.1;
      }
      
      if (point.y < margin) {
        point.velocity.y += (margin - point.y) * 0.1;
      } else if (point.y > height - margin) {
        point.velocity.y += (height - margin - point.y) * 0.1;
      }
    });
  }
}