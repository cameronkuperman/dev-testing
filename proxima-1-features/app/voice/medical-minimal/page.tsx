"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useVoiceDetection } from '@/app/hooks/useVoiceDetection';
import VoiceControls from './VoiceControls';
import MedicalGrid from './MedicalGrid';

export default function MedicalMinimalVoice() {
  const [isActive, setIsActive] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  const {
    isListening,
    amplitude: detectedAmplitude,
    isUserSpeaking,
    error,
    startListening,
    stopListening,
    isSimulating,
    startSimulation,
    stopSimulation
  } = useVoiceDetection({
    onSpeechStart: () => {
      setIsActive(true);
    },
    onSpeechEnd: () => {
      setIsActive(isListening);
    },
    onAmplitudeChange: (amp) => {
      setAmplitude(amp);
    }
  });

  const handleOrbClick = async () => {
    if (isListening) {
      stopListening();
      stopSimulation();
      setIsActive(false);
    } else {
      try {
        await startListening();
        setIsActive(true);
      } catch (err) {
        startSimulation('speaking');
        setIsActive(true);
      }
    }
  };

  const handleEnd = () => {
    stopListening();
    stopSimulation();
    setIsActive(false);
    setAmplitude(0);
  };

  // Update amplitude
  useEffect(() => {
    setAmplitude(detectedAmplitude);
  }, [detectedAmplitude]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#fafbfb' }}>
      {/* Medical grid background */}
      <MedicalGrid />

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link
          href="/voice"
          className="inline-flex items-center gap-2 text-[#95a5a6] hover:text-[#5a6c7d] transition-colors text-sm font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </motion.div>
      
      {/* Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-8 right-8 text-sm text-[#95a5a6] font-light"
      >
        by Proxima
      </motion.div>

      {/* Center Container */}
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Elegant Voice Orb */}
          <div className="relative mb-24">
            {/* Outer ring */}
            <motion.div
              className="absolute -inset-6 rounded-full"
              style={{
                background: isListening 
                  ? 'radial-gradient(circle, rgba(127, 196, 201, 0.1) 0%, transparent 70%)'
                  : 'transparent',
              }}
              animate={isListening ? {
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.2, 0.5]
              } : {}}
              transition={{
                duration: 3,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            {/* Main orb */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={handleOrbClick}
              className="relative w-48 h-48 cursor-pointer rounded-full"
              style={{
                background: 'white',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Inner gradient */}
              <div 
                className="absolute inset-2 rounded-full"
                style={{
                  background: isListening
                    ? 'linear-gradient(135deg, #7fc4c9 0%, #5ab3b9 100%)'
                    : 'linear-gradient(135deg, #a8d5d8 0%, #7fc4c9 100%)',
                  transition: 'background 0.6s ease'
                }}
              />
              
              {/* Pulse effect - heartbeat rhythm */}
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }}
                animate={{
                  opacity: [0.3, 0.5, 0.3, 0.3],
                  scale: [1, 1.02, 1, 1]
                }}
                transition={{
                  duration: isListening ? 1 : 1.2, // 60-72 BPM
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.1, 0.2, 1] // Mimics heartbeat rhythm
                }}
              />
              
              {/* Voice amplitude visualization */}
              {isListening && amplitude > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
                    opacity: Math.min(amplitude * 2, 0.6)
                  }}
                />
              )}
            </motion.div>
          </div>
          {/* Status text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#5a6c7d] font-light mt-8"
          >
            {isListening ? 'Listening...' : 'Tap to speak'}
          </motion.p>
        </motion.div>
      </div>

      {/* Elegant Voice Controls */}
      <VoiceControls
        isListening={isListening}
        onToggleMic={handleOrbClick}
        onEnd={handleEnd}
      />
    </div>
  );
}