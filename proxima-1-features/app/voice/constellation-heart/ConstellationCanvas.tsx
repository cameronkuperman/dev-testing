"use client";

import { useEffect, useRef } from 'react';
import { Star } from './types';
import { HeartMath } from './HeartMath';

interface ConstellationCanvasProps {
  stars: Star[];
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'forming';
  sentiment: number;
}

export default function ConstellationCanvas({ stars, amplitude, mode, sentiment }: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 500;
    canvas.height = 500;

    const drawConnections = (stars: Star[]) => {
      stars.forEach((star, i) => {
        stars.slice(i + 1).forEach(otherStar => {
          const distance = HeartMath.getDistance(
            { x: star.currentX, y: star.currentY },
            { x: otherStar.currentX, y: otherStar.currentY }
          );
          
          const maxDistance = 80;
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3;
            
            // Create gradient for connection
            const gradient = ctx.createLinearGradient(
              star.currentX, star.currentY, 
              otherStar.currentX, otherStar.currentY
            );
            
            // Color based on sentiment
            let color1, color2;
            if (sentiment < -0.5) {
              color1 = `rgba(255, 100, 100, ${opacity * star.brightness})`;
              color2 = `rgba(255, 100, 100, ${opacity * otherStar.brightness})`;
            } else if (sentiment > 0.5) {
              color1 = `rgba(255, 200, 255, ${opacity * star.brightness})`;
              color2 = `rgba(255, 200, 255, ${opacity * otherStar.brightness})`;
            } else {
              color1 = `rgba(168, 85, 247, ${opacity * star.brightness})`;
              color2 = `rgba(236, 72, 153, ${opacity * otherStar.brightness})`;
            }
            
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = opacity * 2;
            ctx.beginPath();
            ctx.moveTo(star.currentX, star.currentY);
            ctx.lineTo(otherStar.currentX, otherStar.currentY);
            ctx.stroke();
          }
        });
      });
    };

    const drawStars = (stars: Star[]) => {
      // Group stars by size for batch rendering
      const starsBySize: { [key: string]: Star[] } = {};
      
      stars.forEach(star => {
        const sizeKey = Math.round(star.size).toString();
        if (!starsBySize[sizeKey]) {
          starsBySize[sizeKey] = [];
        }
        starsBySize[sizeKey].push(star);
      });

      // Draw each size group
      Object.entries(starsBySize).forEach(([size, sameStars]) => {
        ctx.beginPath();
        
        sameStars.forEach(star => {
          // Add glow effect
          const glowSize = parseFloat(size) * 3;
          const gradient = ctx.createRadialGradient(
            star.currentX, star.currentY, 0,
            star.currentX, star.currentY, glowSize
          );
          
          // Adjust color based on star properties
          let centerColor, outerColor;
          if (star.isCore && mode === 'forming') {
            centerColor = `rgba(236, 72, 153, ${star.brightness})`;
            outerColor = `rgba(236, 72, 153, 0)`;
          } else {
            centerColor = `rgba(255, 255, 255, ${star.brightness})`;
            outerColor = `rgba(168, 85, 247, 0)`;
          }
          
          gradient.addColorStop(0, centerColor);
          gradient.addColorStop(1, outerColor);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            star.currentX - glowSize, 
            star.currentY - glowSize, 
            glowSize * 2, 
            glowSize * 2
          );
          
          // Draw the star itself
          ctx.beginPath();
          ctx.arc(star.currentX, star.currentY, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
          ctx.fill();
        });
      });
    };

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first (behind stars)
      drawConnections(stars);

      // Draw stars
      drawStars(stars);

      // Add subtle heart pulse overlay when forming
      if (mode === 'forming' && amplitude > 0.5) {
        ctx.fillStyle = `rgba(236, 72, 153, ${amplitude * 0.05})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stars, amplitude, mode, sentiment]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ maxWidth: '500px', maxHeight: '500px' }}
    />
  );
}