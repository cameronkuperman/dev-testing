import { Particle, Petal } from './types';

export class ParticleEffects {
  private particles: Particle[] = [];
  private readonly MAX_PARTICLES = 30;
  private readonly GRAVITY = 0.02;
  private readonly WIND_STRENGTH = 0.01;
  private windAngle = 0;
  private windPhase = 0;

  emitPollen(petal: Petal, amplitude: number): Particle | null {
    // Emission probability based on amplitude and petal movement
    const emissionProbability = amplitude * 0.15;
    if (Math.random() > emissionProbability || this.particles.length >= this.MAX_PARTICLES) {
      return null;
    }

    // Calculate emission point at petal tip
    const tipX = petal.baseX + Math.cos(petal.angle) * petal.length;
    const tipY = petal.baseY + Math.sin(petal.angle) * petal.length;

    // Add some randomness to emission position
    const offsetAngle = petal.angle + (Math.random() - 0.5) * 0.5;
    const offsetDistance = Math.random() * 10;

    const particle: Particle = {
      x: tipX + Math.cos(offsetAngle) * offsetDistance,
      y: tipY + Math.sin(offsetAngle) * offsetDistance,
      vx: Math.cos(petal.angle) * (0.5 + Math.random()) * amplitude,
      vy: -Math.random() * 2 - 1, // Upward bias
      size: 1 + Math.random() * 2 + amplitude * 2,
      life: 1.0,
      color: this.generatePollenColor()
    };

    this.particles.push(particle);
    return particle;
  }

  updateParticles(deltaTime: number): Particle[] {
    // Update wind
    this.windPhase += deltaTime * 0.001;
    this.windAngle = Math.sin(this.windPhase) * Math.PI / 4;
    const windX = Math.cos(this.windAngle) * this.WIND_STRENGTH;
    const windY = Math.sin(this.windAngle) * this.WIND_STRENGTH * 0.5;

    // Update each particle
    this.particles = this.particles
      .map(particle => {
        // Apply physics
        particle.vx += windX + (Math.random() - 0.5) * 0.01;
        particle.vy += this.GRAVITY + windY;

        // Air resistance
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Fade out
        particle.life -= deltaTime * 0.0003;

        // Size reduction as particle fades
        particle.size *= 0.995;

        // Brownian motion for realism
        particle.x += (Math.random() - 0.5) * 0.2;
        particle.y += (Math.random() - 0.5) * 0.2;

        return particle;
      })
      .filter(particle => 
        particle.life > 0 && 
        particle.y < 500 && // Remove particles that fall off screen
        particle.size > 0.1
      );

    return this.particles;
  }

  private generatePollenColor(): string {
    // Subtle color variations for natural look
    const hue = 45 + Math.random() * 15; // Golden yellow range
    const saturation = 60 + Math.random() * 20;
    const lightness = 70 + Math.random() * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Burst effect for dramatic moments
  createPollenBurst(centerX: number, centerY: number, intensity: number) {
    const burstCount = Math.floor(intensity * 15);
    
    for (let i = 0; i < burstCount && this.particles.length < this.MAX_PARTICLES; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3 * intensity;
      
      this.particles.push({
        x: centerX + Math.random() * 10 - 5,
        y: centerY + Math.random() * 10 - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Upward bias
        size: 1 + Math.random() * 3,
        life: 1.0,
        color: this.generatePollenColor()
      });
    }
  }

  // Get particles for rendering
  getParticles(): Particle[] {
    return this.particles;
  }

  // Clear all particles
  clear() {
    this.particles = [];
  }
}