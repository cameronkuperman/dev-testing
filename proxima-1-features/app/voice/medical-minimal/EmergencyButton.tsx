"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface EmergencyButtonProps {
  onEmergency: () => void;
}

export default function EmergencyButton({ onEmergency }: EmergencyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const handleMouseDown = () => {
    setIsPressed(true);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(elapsed / 1000, 1);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        onEmergency();
        clearInterval(timerRef.current);
      }
    };

    timerRef.current = setInterval(updateProgress, 16);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className="fixed top-6 right-6 p-3 rounded-full bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 hover:border-red-600/50 transition-all relative overflow-hidden"
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        style={{ opacity: isPressed ? 1 : 0 }}
      >
        <circle
          cx="50%"
          cy="50%"
          r="48%"
          fill="none"
          stroke="rgba(220, 38, 38, 0.5)"
          strokeWidth="2"
          strokeDasharray={`${progress * 301.6} 301.6`}
          className="transition-all duration-100"
        />
      </svg>

      <AlertTriangle className="w-6 h-6 text-red-500 relative z-10" />
      
      {isPressed && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500"
        />
      )}
    </motion.button>
  );
}