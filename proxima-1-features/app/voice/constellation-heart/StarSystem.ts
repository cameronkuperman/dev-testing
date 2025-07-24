import { Star, Point } from './types';
import { HeartMath } from './HeartMath';

export class StarSystem {
  private centerX: number;
  private centerY: number;
  private maxStars: number;
  private heartPositions: Point[];

  constructor(centerX: number, centerY: number, maxStars: number = 48) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.maxStars = maxStars;
    this.heartPositions = HeartMath.calculateHeartPositions(24, 10, centerX, centerY);
  }

  createStars(count: number): Star[] {
    const stars: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      const isCore = i < 24; // First 24 stars form the heart
      const star = this.createStar(i, isCore);
      stars.push(star);
    }
    
    return stars;
  }

  private createStar(id: number, isCore: boolean): Star {
    const x = this.centerX + (Math.random() - 0.5) * 400;
    const y = this.centerY + (Math.random() - 0.5) * 400;
    const size = isCore ? 3 + Math.random() * 3 : 2 + Math.random() * 2;
    
    return {
      id,
      x,
      y,
      targetX: x,
      targetY: y,
      currentX: x,
      currentY: y,
      size,
      baseSize: size,
      brightness: 0.3 + Math.random() * 0.2,
      baseBrightness: 0.3 + Math.random() * 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
      isCore,
      connections: [],
      velocity: { x: 0, y: 0 }
    };
  }

  scatterStars(stars: Star[]) {
    stars.forEach(star => {
      star.targetX = this.centerX + (Math.random() - 0.5) * 400;
      star.targetY = this.centerY + (Math.random() - 0.5) * 400;
      star.brightness = star.baseBrightness;
    });
  }

  gatherStars(stars: Star[], progress: number) {
    stars.forEach(star => {
      const angle = Math.atan2(star.y - this.centerY, star.x - this.centerX);
      const distance = HeartMath.getDistance(
        { x: star.x, y: star.y }, 
        { x: this.centerX, y: this.centerY }
      );
      
      star.targetX = star.x - Math.cos(angle) * distance * progress * 0.3;
      star.targetY = star.y - Math.sin(angle) * distance * progress * 0.3;
    });
  }

  formHeart(stars: Star[], amplitude: number) {
    const coreStars = stars.filter(s => s.isCore);
    
    coreStars.forEach((star, i) => {
      if (i < this.heartPositions.length) {
        const heartPos = this.heartPositions[i];
        star.targetX = HeartMath.lerp(star.currentX, heartPos.x, amplitude);
        star.targetY = HeartMath.lerp(star.currentY, heartPos.y, amplitude);
        star.brightness = star.baseBrightness + amplitude * 0.5;
      }
    });
    
    // Additional stars float around
    const extraStars = stars.filter(s => !s.isCore);
    extraStars.forEach(star => {
      const drift = Math.sin(Date.now() * 0.001 + star.pulsePhase) * 20;
      star.targetX = star.x + drift;
      star.targetY = star.y + Math.cos(Date.now() * 0.001 + star.pulsePhase) * 10;
    });
  }

  updateStarPositions(stars: Star[], deltaTime: number) {
    const DAMPING = 0.92;
    const SPRING = 0.08;
    
    stars.forEach(star => {
      // Spring force toward target
      const dx = star.targetX - star.currentX;
      const dy = star.targetY - star.currentY;
      
      star.velocity.x += dx * SPRING;
      star.velocity.y += dy * SPRING;
      
      // Apply damping
      star.velocity.x *= DAMPING;
      star.velocity.y *= DAMPING;
      
      // Update position
      star.currentX += star.velocity.x;
      star.currentY += star.velocity.y;
      
      // Slight random drift
      if (Math.random() < 0.01) {
        star.velocity.x += (Math.random() - 0.5) * 0.5;
        star.velocity.y += (Math.random() - 0.5) * 0.5;
      }
    });
  }

  updateStarPulse(stars: Star[], globalPulse: number) {
    stars.forEach(star => {
      const phasedPulse = globalPulse + Math.sin(star.pulsePhase) * 0.2;
      star.size = star.baseSize * phasedPulse;
      star.brightness = star.baseBrightness * (0.8 + phasedPulse * 0.2);
    });
  }

  spawnVoiceStars(stars: Star[], amplitude: number): Star[] {
    if (amplitude > 0.6 && stars.length < this.maxStars && Math.random() < 0.1) {
      const newStar = this.createStar(stars.length, false);
      newStar.size = 1 + amplitude * 3;
      newStar.brightness = amplitude;
      
      // Spawn near existing stars for clustering
      if (stars.length > 0) {
        const nearStar = stars[Math.floor(Math.random() * stars.length)];
        newStar.x = nearStar.currentX + (Math.random() - 0.5) * 50;
        newStar.y = nearStar.currentY + (Math.random() - 0.5) * 50;
        newStar.currentX = newStar.x;
        newStar.currentY = newStar.y;
      }
      
      return [...stars, newStar];
    }
    
    return stars;
  }

  findConnections(stars: Star[], maxDistance: number = 80) {
    stars.forEach((star, i) => {
      star.connections = [];
      
      stars.slice(i + 1).forEach((otherStar, j) => {
        const distance = HeartMath.getDistance(
          { x: star.currentX, y: star.currentY },
          { x: otherStar.currentX, y: otherStar.currentY }
        );
        
        if (distance < maxDistance) {
          star.connections.push(i + j + 1);
        }
      });
    });
  }
}