"use client";

import { useEffect, useRef } from 'react';
import { Thread, Pattern } from './types';

interface ThreadCanvasProps {
  thread: Thread;
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'thinking';
}

// Gradient configurations for each pattern
const PATTERN_GRADIENTS = {
  idle: {
    colors: ['#9ca3af', '#6b7280', '#9ca3af'],
    positions: [0, 0.5, 1]
  },
  listening: {
    colors: ['#a855f7', '#ec4899', '#a855f7'],
    positions: [0, 0.5, 1]
  },
  speaking: {
    colors: ['#10b981', '#3b82f6', '#8b5cf6'],
    positions: [0, 0.5, 1]
  },
  thinking: {
    colors: ['#f59e0b', '#ef4444', '#f59e0b'],
    positions: [0, 0.5, 1]
  }
};

export default function ThreadCanvas({ thread, amplitude, mode }: ThreadCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const glowIntensityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    const drawThread = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update glow intensity
      const targetGlow = amplitude > 0.5 ? amplitude : 0.3;
      glowIntensityRef.current += (targetGlow - glowIntensityRef.current) * 0.1;

      // Draw thread glow effect
      if (glowIntensityRef.current > 0.1) {
        drawThreadGlow(ctx, thread, glowIntensityRef.current);
      }

      // Draw main thread
      drawMainThread(ctx, thread, mode);

      // Draw pattern indicators
      drawPatternIndicators(ctx, thread.pattern, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(drawThread);
    };

    const drawThreadGlow = (
      ctx: CanvasRenderingContext2D, 
      thread: Thread, 
      intensity: number
    ) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = `blur(${20 * intensity}px)`;
      ctx.lineWidth = 10;
      ctx.strokeStyle = `rgba(168, 85, 247, ${intensity * 0.3})`;
      
      drawThreadPath(ctx, thread);
      
      ctx.restore();
    };

    const drawMainThread = (
      ctx: CanvasRenderingContext2D, 
      thread: Thread,
      mode: string
    ) => {
      const gradientConfig = PATTERN_GRADIENTS[mode as keyof typeof PATTERN_GRADIENTS] || PATTERN_GRADIENTS.idle;
      
      // Create gradient along thread path
      if (thread.points.length > 1) {
        const firstPoint = thread.points[0];
        const lastPoint = thread.points[thread.points.length - 1];
        
        const gradient = ctx.createLinearGradient(
          firstPoint.x, firstPoint.y,
          lastPoint.x, lastPoint.y
        );
        
        gradientConfig.colors.forEach((color, i) => {
          gradient.addColorStop(gradientConfig.positions[i], color);
        });
        
        // Main thread stroke
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 + amplitude * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        drawThreadPath(ctx, thread);
        
        // Highlight stroke for depth
        ctx.globalCompositeOperation = 'overlay';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        drawThreadPath(ctx, thread);
        ctx.globalCompositeOperation = 'source-over';
      }
    };

    const drawThreadPath = (ctx: CanvasRenderingContext2D, thread: Thread) => {
      if (thread.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(thread.points[0].x, thread.points[0].y);
      
      // Use quadratic curves for smooth line
      for (let i = 1; i < thread.points.length - 1; i++) {
        const xc = (thread.points[i].x + thread.points[i + 1].x) / 2;
        const yc = (thread.points[i].y + thread.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(thread.points[i].x, thread.points[i].y, xc, yc);
      }
      
      // Last point
      const last = thread.points[thread.points.length - 1];
      ctx.lineTo(last.x, last.y);
      
      ctx.stroke();
    };

    const drawPatternIndicators = (
      ctx: CanvasRenderingContext2D,
      pattern: Pattern,
      width: number,
      height: number
    ) => {
      // Subtle pattern name in corner
      ctx.save();
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.fillStyle = 'rgba(156, 163, 175, 0.3)';
      ctx.textAlign = 'right';
      
      const patternNames: Record<Pattern, string> = {
        sine: 'Idle Wave',
        straight: 'Attention',
        caduceus: 'Medical Symbol',
        greekkey: 'Greek Pattern',
        dna: 'DNA Helix',
        heartbeat: 'ECG Pattern'
      };
      
      ctx.fillText(patternNames[pattern] || pattern, width - 20, height - 20);
      ctx.restore();
    };

    drawThread();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [thread, amplitude, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ 
        maxWidth: '600px', 
        maxHeight: '400px',
        filter: mode === 'thinking' ? 'contrast(1.2)' : 'none'
      }}
    />
  );
}