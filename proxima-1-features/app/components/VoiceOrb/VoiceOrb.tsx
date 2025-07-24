'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './VoiceOrb.module.css';

interface VoiceOrbProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  voiceActivity: number;
  assistantType: 'mei' | 'varys';
  onMute?: () => void;
  onEndCall?: () => void;
  isMuted?: boolean;
  callDuration?: number;
}

export function VoiceOrb({
  status,
  voiceActivity,
  assistantType,
  onMute,
  onEndCall,
  isMuted = false,
  callDuration = 0,
}: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [formattedDuration, setFormattedDuration] = useState('00:00');

  // Format call duration
  useEffect(() => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    setFormattedDuration(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }, [callDuration]);

  // Canvas animation for complex orb effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with enough padding for ripples
    const baseSize = assistantType === 'varys' ? 200 : 180;
    const padding = 120; // More padding for ripple expansion
    const size = baseSize + padding;
    canvas.width = size * 2; // For retina
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(2, 2); // For retina

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Scale everything based on voice activity when speaking
      const scaleMultiplier = status === 'speaking' ? (1 + voiceActivity * 0.15) : 1; // Reduced from 0.2
      const orbRadius = (baseSize / 2 - 10) * scaleMultiplier;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        orbRadius
      );

      if (assistantType === 'mei') {
        // Teal gradient for Mei
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(200, 255, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(79, 179, 185, 0.9)');
        gradient.addColorStop(1, 'rgba(79, 179, 185, 1)');
      } else {
        // Purple gradient for Varys
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(220, 200, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.9)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 1)');
      }

      // Draw main orb
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer ring only for Mei
      if (status === 'speaking' && assistantType === 'mei') {
        // Ring is attached to orb edge with no gap
        ctx.strokeStyle = 'rgba(79, 179, 185, 0.3)';
        ctx.lineWidth = 16 * scaleMultiplier;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, orbRadius + (8 * scaleMultiplier), 0, Math.PI * 2); // Reduced gap from 10 to 8
        ctx.stroke();
      }

      if (status === 'thinking' && assistantType === 'varys') {
        // Neural network effect for Varys thinking
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const angle = (time / 1000 + i * Math.PI / 1.5) % (Math.PI * 2);
          const x = size / 2 + Math.cos(angle) * (size / 3);
          const y = size / 2 + Math.sin(angle) * (size / 3);
          
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      time += 16;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status, voiceActivity, assistantType]);

  const orbVariants = {
    idle: {
      scale: [1, 1.05, 1],
      transition: {
        duration: assistantType === 'varys' ? 6 : 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    listening: {
      scale: 1 + voiceActivity * 0.2,
      transition: {
        duration: 0.1,
      },
    },
    thinking: {
      scale: 0.95,
      rotate: assistantType === 'varys' ? 360 : 0,
      transition: {
        rotate: {
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    speaking: {
      scale: 1 + voiceActivity * 0.15,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <div className={styles.container}>
      {/* Call info */}
      <div className={styles.callInfo}>
        <h1 className={styles.assistantName}>
          {assistantType === 'mei' ? 'Mei' : 'Varys'} {formattedDuration}
        </h1>
        <span className={styles.brandName}>by proxima</span>
      </div>

      {/* Main orb */}
      <motion.div
        className={styles.orbContainer}
        initial="idle"
        animate={status}
        variants={orbVariants}
      >
        <canvas
          ref={canvasRef}
          className={styles.orbCanvas}
        />
        <div 
          className={`${styles.orbGlow} ${styles[assistantType]}`}
          style={{
            opacity: status === 'thinking' ? 0.8 : 0.5,
          }}
        />
      </motion.div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.controlButton} ${isMuted ? styles.muted : ''}`}
          onClick={onMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {isMuted ? (
              <path d="M12 2C11.2 2 10.5 2.6 10.5 3.3V20.7C10.5 21.4 11.2 22 12 22C12.3 22 12.6 21.9 12.8 21.7L19.4 16.3C20.2 15.7 20.2 14.3 19.4 13.7L12.8 8.3C12.6 8.1 12.3 8 12 8V2Z" 
                stroke="currentColor" strokeWidth="2"/>
            ) : (
              <path d="M12 2C11.2 2 10.5 2.6 10.5 3.3V20.7C10.5 21.4 11.2 22 12 22C12.3 22 12.6 21.9 12.8 21.7L19.4 16.3C20.2 15.7 20.2 14.3 19.4 13.7L12.8 8.3C12.6 8.1 12.3 8 12 8C7.6 8 4 11.6 4 16C4 11.6 7.6 8 12 8" 
                stroke="currentColor" strokeWidth="2"/>
            )}
          </svg>
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          className={`${styles.controlButton} ${styles.endCall}`}
          onClick={onEndCall}
          aria-label="End call"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 18L6 6M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>End call</span>
        </button>
      </div>

      {/* Voice activity indicator */}
      <div className={styles.voiceIndicator}>
        <motion.div
          className={styles.voiceBar}
          style={{
            scaleX: voiceActivity,
            backgroundColor: assistantType === 'mei' ? '#4FB3B9' : '#6B46C1',
          }}
        />
      </div>
    </div>
  );
}