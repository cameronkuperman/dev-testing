"use client";

import { useEffect, useRef } from 'react';
import { EKGCanvasProps, Point } from './types';

// Medically accurate EKG wave segments with proper timing
const EKG_SEGMENTS = {
  baseline: { duration: 0.1, amplitude: 0 },
  pWave: { duration: 0.08, amplitude: 0.15 }, // Atrial depolarization
  prInterval: { duration: 0.12, amplitude: 0 },
  qWave: { duration: 0.03, amplitude: -0.1 }, // Small negative deflection
  rWave: { duration: 0.04, amplitude: 1.0 }, // Main spike
  sWave: { duration: 0.03, amplitude: -0.2 }, // Return below baseline
  stSegment: { duration: 0.08, amplitude: 0 },
  tWave: { duration: 0.16, amplitude: 0.3 }, // Ventricular repolarization
  tpSegment: { duration: 0.2, amplitude: 0 } // Rest period
};

export default function EKGCanvas({ amplitude, mode, isEmergency }: EKGCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const beatPhaseRef = useRef<number>(0);
  const gridOffsetRef = useRef<number>(0);
  
  // Amplitude history for continuous wave
  const waveHistoryRef = useRef<number[]>([]);
  const historyLength = 300;

  // Calculate current Y position based on EKG phase
  const getEKGValue = (phase: number): number => {
    const centerY = 40;
    const scale = 30; // Base scale for wave height
    
    let y = 0;
    let currentPhase = 0;
    
    // P Wave - smooth bump
    currentPhase += EKG_SEGMENTS.baseline.duration;
    if (phase < currentPhase) {
      y = 0;
    } else if (phase < currentPhase + EKG_SEGMENTS.pWave.duration) {
      const t = (phase - currentPhase) / EKG_SEGMENTS.pWave.duration;
      y = EKG_SEGMENTS.pWave.amplitude * Math.sin(t * Math.PI);
    }
    
    // PR Interval - flat
    currentPhase += EKG_SEGMENTS.pWave.duration;
    if (phase >= currentPhase && phase < currentPhase + EKG_SEGMENTS.prInterval.duration) {
      y = 0;
    }
    
    // QRS Complex - sharp transitions
    currentPhase += EKG_SEGMENTS.prInterval.duration;
    
    // Q wave
    if (phase >= currentPhase && phase < currentPhase + EKG_SEGMENTS.qWave.duration) {
      const t = (phase - currentPhase) / EKG_SEGMENTS.qWave.duration;
      y = EKG_SEGMENTS.qWave.amplitude * t;
    }
    
    // R wave - sharp spike up
    currentPhase += EKG_SEGMENTS.qWave.duration;
    if (phase >= currentPhase && phase < currentPhase + EKG_SEGMENTS.rWave.duration) {
      const t = (phase - currentPhase) / EKG_SEGMENTS.rWave.duration;
      if (t < 0.5) {
        // Sharp rise
        y = EKG_SEGMENTS.qWave.amplitude + (EKG_SEGMENTS.rWave.amplitude - EKG_SEGMENTS.qWave.amplitude) * (t * 2);
      } else {
        // Sharp fall to S
        y = EKG_SEGMENTS.rWave.amplitude + (EKG_SEGMENTS.sWave.amplitude - EKG_SEGMENTS.rWave.amplitude) * ((t - 0.5) * 2);
      }
    }
    
    // S wave
    currentPhase += EKG_SEGMENTS.rWave.duration;
    if (phase >= currentPhase && phase < currentPhase + EKG_SEGMENTS.sWave.duration) {
      const t = (phase - currentPhase) / EKG_SEGMENTS.sWave.duration;
      y = EKG_SEGMENTS.sWave.amplitude * (1 - t);
    }
    
    // ST segment
    currentPhase += EKG_SEGMENTS.sWave.duration;
    if (phase >= currentPhase && phase < currentPhase + EKG_SEGMENTS.stSegment.duration) {
      y = 0;
    }
    
    // T wave - smooth bump
    currentPhase += EKG_SEGMENTS.stSegment.duration;
    if (phase >= currentPhase && phase < currentPhase + EKG_SEGMENTS.tWave.duration) {
      const t = (phase - currentPhase) / EKG_SEGMENTS.tWave.duration;
      y = EKG_SEGMENTS.tWave.amplitude * Math.sin(t * Math.PI);
    }
    
    // TP segment - return to baseline
    currentPhase += EKG_SEGMENTS.tWave.duration;
    if (phase >= currentPhase) {
      y = 0;
    }
    
    return centerY - (y * scale);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.lineWidth = 0.5;
    
    const gridSize = 10;
    const offset = gridOffsetRef.current % gridSize;
    
    // Vertical lines
    for (let x = -offset; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Major grid lines every 5 squares
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.lineWidth = 1;
    
    for (let x = -offset; x < width; x += gridSize * 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize * 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    drawGrid(ctx, canvas.width, canvas.height);

    // Update beat phase based on heart rate
    const bpm = isEmergency ? 120 : 70;
    const beatDuration = 60000 / bpm; // ms per beat
    const beatProgress = (Date.now() % beatDuration) / beatDuration;
    beatPhaseRef.current = beatProgress;

    // Calculate current wave value
    let currentY = 40;
    
    if (mode === 'idle' || mode === 'listening' || mode === 'speaking') {
      currentY = getEKGValue(beatProgress);
      
      // Add voice modulation when speaking
      if (mode === 'speaking' && amplitude > 0) {
        const voiceInfluence = amplitude * 5 * Math.sin(Date.now() * 0.01);
        currentY += voiceInfluence;
      }
    } else if (mode === 'emergency') {
      // Erratic pattern for emergency
      currentY = getEKGValue(beatProgress);
      currentY += Math.random() * 10 - 5;
      if (Math.random() < 0.1) {
        currentY += (Math.random() - 0.5) * 20; // Occasional spikes
      }
    }

    // Update wave history
    waveHistoryRef.current.push(currentY);
    if (waveHistoryRef.current.length > historyLength) {
      waveHistoryRef.current.shift();
    }

    // Draw the main EKG line
    ctx.strokeStyle = isEmergency ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Create glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = isEmergency ? '#ef4444' : '#10b981';
    
    ctx.beginPath();
    for (let i = 0; i < waveHistoryRef.current.length; i++) {
      const x = (i / historyLength) * canvas.width;
      const y = waveHistoryRef.current[i];
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Smooth curve between points
        const prevX = ((i - 1) / historyLength) * canvas.width;
        const prevY = waveHistoryRef.current[i - 1];
        const cpx = (prevX + x) / 2;
        const cpy = (prevY + y) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
      }
    }
    ctx.stroke();
    
    // Draw a brighter line on top for extra glow
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isEmergency ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw current position indicator
    if (waveHistoryRef.current.length > 0) {
      const currentX = ((waveHistoryRef.current.length - 1) / historyLength) * canvas.width;
      const currentY = waveHistoryRef.current[waveHistoryRef.current.length - 1];
      
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update grid offset for scrolling effect
    gridOffsetRef.current += 0.5;

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 240;
    canvas.height = 80;

    // Initialize wave history
    for (let i = 0; i < historyLength; i++) {
      waveHistoryRef.current.push(40);
    }

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, isEmergency]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg"
      style={{ 
        width: '240px', 
        height: '80px',
        filter: 'contrast(1.1) brightness(1.1)'
      }}
    />
  );
}