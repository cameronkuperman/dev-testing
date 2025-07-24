"use client";

import { useEffect, useRef, useMemo } from 'react';
import { Petal, HealthTopic, Particle } from './types';

interface FlowerRendererProps {
  petals: Petal[];
  particles: Particle[];
  amplitude: number;
  mode: 'closed' | 'listening' | 'speaking' | 'wilting';
  topic: HealthTopic;
  centerGlow: number;
}

// Professional color palettes with multiple gradient stops
const TOPIC_PALETTES = {
  general: {
    gradient: ['#a855f7', '#ec4899', '#f472b6'],
    glow: 'rgba(168, 85, 247, 0.4)',
    particle: ['#e9d5ff', '#fce7f3', '#fdf2f8']
  },
  cardio: {
    gradient: ['#ef4444', '#f87171', '#fca5a5'],
    glow: 'rgba(239, 68, 68, 0.4)',
    particle: ['#fee2e2', '#fecaca', '#fef3c7']
  },
  respiratory: {
    gradient: ['#3b82f6', '#60a5fa', '#93c5fd'],
    glow: 'rgba(59, 130, 246, 0.4)',
    particle: ['#dbeafe', '#e0f2fe', '#f0f9ff']
  },
  neural: {
    gradient: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    glow: 'rgba(139, 92, 246, 0.4)',
    particle: ['#ede9fe', '#f3e8ff', '#faf5ff']
  },
  digestive: {
    gradient: ['#10b981', '#34d399', '#6ee7b7'],
    glow: 'rgba(16, 185, 129, 0.4)',
    particle: ['#d1fae5', '#ecfdf5', '#f0fdf4']
  },
  mental: {
    gradient: ['#f59e0b', '#fbbf24', '#fcd34d'],
    glow: 'rgba(245, 158, 11, 0.4)',
    particle: ['#fef3c7', '#fffbeb', '#fefce8']
  },
  emergency: {
    gradient: ['#dc2626', '#ef4444', '#f87171'],
    glow: 'rgba(220, 38, 38, 0.6)',
    particle: ['#fee2e2', '#fecaca', '#fbbf24']
  }
};

export default function FlowerRenderer({
  petals,
  particles,
  amplitude,
  mode,
  topic,
  centerGlow
}: FlowerRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const glowFilterIdRef = useRef(`glow-${Date.now()}`);
  
  const palette = TOPIC_PALETTES[topic];

  // Create sophisticated petal paths with multiple control points
  const createPetalPath = (petal: Petal): string => {
    const tipX = petal.baseX + Math.cos(petal.angle) * petal.length;
    const tipY = petal.baseY + Math.sin(petal.angle) * petal.length;
    
    // Multiple control points for organic curves
    const innerCP1x = petal.baseX + Math.cos(petal.angle - 0.15) * petal.length * 0.25;
    const innerCP1y = petal.baseY + Math.sin(petal.angle - 0.15) * petal.length * 0.25;
    
    const outerCP1x = petal.baseX + Math.cos(petal.angle - 0.1) * petal.length * 0.5;
    const outerCP1y = petal.baseY + Math.sin(petal.angle - 0.1) * petal.length * 0.5;
    
    const outerCP2x = petal.baseX + Math.cos(petal.angle + 0.1) * petal.length * 0.75;
    const outerCP2y = petal.baseY + Math.sin(petal.angle + 0.1) * petal.length * 0.75;
    
    const tipCP1x = tipX + Math.cos(petal.angle + Math.PI/2) * petal.curve * 0.5;
    const tipCP1y = tipY + Math.sin(petal.angle + Math.PI/2) * petal.curve * 0.5;
    
    const tipCP2x = tipX + Math.cos(petal.angle - Math.PI/2) * petal.curve;
    const tipCP2y = tipY + Math.sin(petal.angle - Math.PI/2) * petal.curve;
    
    // Create a complex path that forms a petal shape
    return `
      M ${petal.baseX} ${petal.baseY}
      C ${innerCP1x} ${innerCP1y}, ${outerCP1x} ${outerCP1y}, ${outerCP2x} ${outerCP2y}
      Q ${tipCP1x} ${tipCP1y}, ${tipX} ${tipY}
      Q ${tipCP2x} ${tipCP2y}, ${outerCP2x} ${outerCP2y}
      C ${outerCP1x} ${outerCP1y}, ${innerCP1x} ${innerCP1y}, ${petal.baseX} ${petal.baseY}
      Z
    `;
  };

  // Create gradient definitions for each petal
  const gradientDefs = useMemo(() => (
    <defs>
      {/* Main radial gradient for center glow */}
      <radialGradient id="centerGradient">
        <stop offset="0%" stopColor={palette.gradient[0]} stopOpacity={0.8} />
        <stop offset="50%" stopColor={palette.gradient[1]} stopOpacity={0.4} />
        <stop offset="100%" stopColor={palette.gradient[2]} stopOpacity={0} />
      </radialGradient>

      {/* Individual petal gradients for depth */}
      {petals.map((petal, i) => (
        <linearGradient
          key={`gradient-${i}`}
          id={`petalGradient-${i}`}
          x1="0%"
          y1="0%"
          x2={`${50 + Math.cos(petal.angle) * 50}%`}
          y2={`${50 + Math.sin(petal.angle) * 50}%`}
        >
          <stop offset="0%" stopColor={palette.gradient[0]} stopOpacity={0.9} />
          <stop offset="50%" stopColor={palette.gradient[1]} stopOpacity={0.7} />
          <stop offset="100%" stopColor={palette.gradient[2]} stopOpacity={0.3} />
        </linearGradient>
      ))}

      {/* Sophisticated glow filter */}
      <filter id={glowFilterIdRef.current} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feOffset dx="0" dy="0" in="coloredBlur" result="offsetBlur"/>
        <feFlood floodColor={palette.glow} floodOpacity="0.5" result="glowColor"/>
        <feComposite in="glowColor" in2="offsetBlur" operator="in" result="softGlow"/>
        <feMerge>
          <feMergeNode in="softGlow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      {/* Particle glow for pollen effects */}
      <filter id="particleGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      {/* Mask for center circle */}
      <mask id="centerMask">
        <rect x="0" y="0" width="450" height="450" fill="white"/>
        <circle cx="225" cy="225" r="40" fill="black"/>
      </mask>
    </defs>
  ), [petals, palette, topic]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 450 450"
      className="w-full h-full"
      style={{ 
        filter: mode === 'wilting' ? 'saturate(0.7)' : 'saturate(1.2)',
        transform: `scale(${1 + amplitude * 0.05})`
      }}
    >
      {gradientDefs}

      {/* Ambient background glow */}
      <circle
        cx="225"
        cy="225"
        r={180 + centerGlow * 40}
        fill="url(#centerGradient)"
        opacity={0.2 + centerGlow * 0.3}
        style={{
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />

      {/* Petal group with mask */}
      <g mask="url(#centerMask)" filter={`url(#${glowFilterIdRef.current})`}>
        {petals.map((petal, i) => (
          <g key={`petal-${i}`}>
            {/* Petal shadow for depth */}
            <path
              d={createPetalPath({
                ...petal,
                length: petal.length * 0.95,
                curve: petal.curve * 0.9
              })}
              fill="black"
              opacity={0.2}
              transform={`translate(2, 2)`}
              style={{
                filter: 'blur(3px)'
              }}
            />

            {/* Main petal */}
            <path
              d={createPetalPath(petal)}
              fill={`url(#petalGradient-${i})`}
              stroke={palette.gradient[0]}
              strokeWidth={0.5}
              opacity={petal.opacity}
              style={{
                transformOrigin: `${petal.baseX}px ${petal.baseY}px`,
                transform: mode === 'wilting' 
                  ? `rotate(${15 * (1 - petal.length / 180)}deg)`
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />

            {/* Petal highlight for glossy effect */}
            <path
              d={createPetalPath({
                ...petal,
                length: petal.length * 0.7,
                curve: petal.curve * 0.7
              })}
              fill="white"
              opacity={0.1 + amplitude * 0.1}
              style={{
                mixBlendMode: 'overlay'
              }}
            />
          </g>
        ))}
      </g>

      {/* Center circle with sophisticated design */}
      <g>
        {/* Outer ring */}
        <circle
          cx="225"
          cy="225"
          r="42"
          fill="none"
          stroke={palette.gradient[0]}
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Inner gradient circle */}
        <circle
          cx="225"
          cy="225"
          r="40"
          fill="#0a0a0a"
          stroke="none"
        />

        {/* Center glow */}
        <circle
          cx="225"
          cy="225"
          r="35"
          fill="url(#centerGradient)"
          opacity={0.8}
        />

        {/* Center pulse rings */}
        {[0, 1, 2].map(i => (
          <circle
            key={`pulse-${i}`}
            cx="225"
            cy="225"
            r={20 + i * 5}
            fill="none"
            stroke={palette.gradient[1]}
            strokeWidth="0.5"
            opacity={0.3 - i * 0.1}
            style={{
              transformOrigin: 'center',
              animation: `pulse ${3 + i}s ease-out infinite`
            }}
          />
        ))}

        {/* Center dot */}
        <circle
          cx="225"
          cy="225"
          r="8"
          fill={palette.gradient[0]}
          opacity="0.9"
        />
      </g>

      {/* Particle system for pollen effects */}
      <g filter="url(#particleGlow)">
        {particles.map((particle, i) => (
          <circle
            key={`particle-${i}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={palette.particle[i % palette.particle.length]}
            opacity={particle.life * 0.8}
          />
        ))}
      </g>

      {/* Animated style definitions */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.1;
            }
            100% {
              transform: scale(1);
              opacity: 0.3;
            }
          }
        `}
      </style>
    </svg>
  );
}