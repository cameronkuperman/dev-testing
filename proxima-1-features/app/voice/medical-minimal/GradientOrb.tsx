"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GradientOrbProps {
  amplitude: number;
  isActive: boolean;
}

export default function GradientOrb({ amplitude, isActive }: GradientOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height = 400;
    
    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient
      const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
      
      if (isActive) {
        // Animated gradient when active
        const hue = 200 + Math.sin(time * 0.001) * 20;
        const lightness = 50 + amplitude * 20;
        gradient.addColorStop(0, `hsl(${hue}, 80%, ${lightness}%)`);
        gradient.addColorStop(0.5, `hsl(${hue + 20}, 70%, ${lightness - 10}%)`);
        gradient.addColorStop(1, `hsl(${hue + 40}, 60%, ${lightness - 20}%)`);
      } else {
        // Static gradient when idle
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#2563eb');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(200, 200, 190, 0, Math.PI * 2);
      ctx.fill();
      
      // Add subtle inner glow
      const glowGradient = ctx.createRadialGradient(150, 150, 0, 200, 200, 200);
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      glowGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(200, 200, 190, 0, Math.PI * 2);
      ctx.fill();
      
      time += 16;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [amplitude, isActive]);
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ 
        width: '100%', 
        height: '100%',
      }}
    />
  );
}