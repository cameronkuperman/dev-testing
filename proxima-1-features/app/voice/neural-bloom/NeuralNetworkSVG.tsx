"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Branch, SynapticPulse } from './types';
import SynapticEffects from './SynapticEffects';

interface NeuralNetworkSVGProps {
  branches: Map<string, Branch>;
  amplitude: number;
  mode: 'idle' | 'listening' | 'speaking' | 'thinking';
  synapticPulses: SynapticPulse[];
  rotationAngle: number;
}

export default function NeuralNetworkSVG({ 
  branches, 
  amplitude, 
  mode, 
  synapticPulses,
  rotationAngle 
}: NeuralNetworkSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const renderBranch = (branch: Branch) => {
    if (branch.startX === undefined || branch.startY === undefined ||
        branch.endX === undefined || branch.endY === undefined ||
        branch.controlPoint1X === undefined || branch.controlPoint1Y === undefined ||
        branch.controlPoint2X === undefined || branch.controlPoint2Y === undefined) {
      return null;
    }

    // Interpolate based on growth progress
    const currentEndX = branch.startX + (branch.endX - branch.startX) * branch.growthProgress;
    const currentEndY = branch.startY + (branch.endY - branch.startY) * branch.growthProgress;
    const currentCP1X = branch.startX + (branch.controlPoint1X - branch.startX) * branch.growthProgress;
    const currentCP1Y = branch.startY + (branch.controlPoint1Y - branch.startY) * branch.growthProgress;
    const currentCP2X = branch.startX + (branch.controlPoint2X - branch.startX) * branch.growthProgress;
    const currentCP2Y = branch.startY + (branch.controlPoint2Y - branch.startY) * branch.growthProgress;

    const pathData = `M ${branch.startX},${branch.startY} C ${currentCP1X},${currentCP1Y} ${currentCP2X},${currentCP2Y} ${currentEndX},${currentEndY}`;

    return (
      <g key={branch.id}>
        {/* Main branch path */}
        <motion.path
          d={pathData}
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={3 - branch.level * 0.5}
          fill="none"
          strokeLinecap="round"
          opacity={branch.opacity * branch.growthProgress}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: branch.growthProgress }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Connection point at end */}
        {branch.growthProgress > 0.8 && (
          <motion.circle
            cx={currentEndX}
            cy={currentEndY}
            r={4 - branch.level}
            fill="url(#nodeGradient)"
            opacity={branch.opacity}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [branch.opacity * 0.8, branch.opacity, branch.opacity * 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: branch.level * 0.2
            }}
          />
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      className="w-full h-full"
      style={{ transform: `rotate(${rotationAngle}deg)` }}
    >
      <defs>
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
        
        <radialGradient id="nodeGradient">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </radialGradient>

        <linearGradient id="synapticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <circle 
        cx="200" 
        cy="200" 
        r={80 + amplitude * 40}
        fill="url(#centerGlow)"
        opacity={0.3 + amplitude * 0.3}
      />

      {/* Neural network branches */}
      <g filter="url(#glow)">
        {Array.from(branches.values()).map(renderBranch)}
      </g>

      {/* Center circle */}
      <motion.circle
        cx="200"
        cy="200"
        r="60"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
        animate={{
          scale: mode === 'idle' ? [0.95, 1.05, 0.95] : 1,
          opacity: mode === 'thinking' ? [0.3, 1, 0.3] : 0.5
        }}
        transition={{
          scale: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: {
            duration: 0.5,
            repeat: mode === 'thinking' ? Infinity : 0
          }
        }}
      />

      {/* Center dot */}
      <circle
        cx="200"
        cy="200"
        r="4"
        fill="#ffffff"
        opacity="0.8"
      />

      {/* Synaptic firing effects */}
      <SynapticEffects pulses={synapticPulses} branches={branches} />
    </svg>
  );
}