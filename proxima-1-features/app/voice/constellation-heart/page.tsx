"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useVoiceDetection } from '@/app/hooks/useVoiceDetection';
import ConstellationCanvas from './ConstellationCanvas';
import { StarSystem } from './StarSystem';
import { PulseManager } from './PulseManager';
import { ConstellationState } from './types';

export default function ConstellationHeartVoice() {
  const [state, setState] = useState<ConstellationState>({
    stars: [],
    amplitude: 0,
    mode: 'idle',
    heartbeatPhase: 0,
    bpm: 60,
    sentiment: 0
  });

  const starSystemRef = useRef<StarSystem>();
  const pulseManagerRef = useRef<PulseManager>();
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  const {
    isListening,
    amplitude,
    isUserSpeaking,
    error,
    startListening,
    stopListening,
    isSimulating,
    startSimulation,
    stopSimulation
  } = useVoiceDetection({
    onSpeechStart: () => {
      setState(prev => ({ ...prev, mode: 'speaking' }));
    },
    onSpeechEnd: () => {
      setState(prev => ({ ...prev, mode: 'listening' }));
    },
    onAmplitudeChange: (amp) => {
      setState(prev => ({ ...prev, amplitude: amp }));
    }
  });

  // Initialize systems
  useEffect(() => {
    starSystemRef.current = new StarSystem(250, 250);
    pulseManagerRef.current = new PulseManager();
    
    // Create initial stars
    const initialStars = starSystemRef.current.createStars(24);
    setState(prev => ({ ...prev, stars: initialStars }));
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setState(prev => {
        if (!starSystemRef.current || !pulseManagerRef.current) return prev;

        const newState = { ...prev };

        // Update pulse manager
        pulseManagerRef.current.updateState(prev.amplitude, false);
        const pulseValue = pulseManagerRef.current.getPulseValue();
        newState.bpm = pulseManagerRef.current.getBPM();

        // Update star positions
        starSystemRef.current.updateStarPositions(newState.stars, deltaTime);

        // Apply pulse to stars
        starSystemRef.current.updateStarPulse(newState.stars, pulseValue);

        // Handle different modes
        switch (prev.mode) {
          case 'idle':
            starSystemRef.current.scatterStars(newState.stars);
            break;
          case 'listening':
            starSystemRef.current.gatherStars(newState.stars, 0.3);
            break;
          case 'speaking':
          case 'forming':
            starSystemRef.current.formHeart(newState.stars, prev.amplitude);
            // Spawn new stars with high amplitude
            newState.stars = starSystemRef.current.spawnVoiceStars(newState.stars, prev.amplitude);
            break;
        }

        // Update connections
        starSystemRef.current.findConnections(newState.stars);

        return newState;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleInteraction = async () => {
    if (isListening) {
      stopListening();
      stopSimulation();
      setState(prev => ({ ...prev, mode: 'idle', amplitude: 0 }));
    } else {
      try {
        await startListening();
        setState(prev => ({ ...prev, mode: 'listening' }));
      } catch (err) {
        // Fall back to simulation
        startSimulation('speaking');
        setState(prev => ({ ...prev, mode: 'listening' }));
      }
    }
  };

  const handleFormHeart = () => {
    setState(prev => ({ ...prev, mode: 'forming', amplitude: 0.8 }));
  };

  // Update amplitude from voice detection
  useEffect(() => {
    setState(prev => ({ ...prev, amplitude }));
    
    // Auto-form heart when speaking
    if (amplitude > 0.3 && state.mode === 'speaking') {
      setState(prev => ({ ...prev, mode: 'forming' }));
    }
  }, [amplitude]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
        </div>
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          href="/voice"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
      </motion.div>

      {/* Pulse indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 right-6 flex items-center gap-2"
      >
        <Heart className="w-5 h-5 text-pink-500" />
        <span className="text-sm text-gray-400">{state.bpm} BPM</span>
      </motion.div>

      {/* Canvas Container */}
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleInteraction}
          className="cursor-pointer"
        >
          <ConstellationCanvas
            stars={state.stars}
            amplitude={state.amplitude}
            mode={state.mode}
            sentiment={state.sentiment}
          />

          {/* Status Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400">
              {state.mode === 'idle' && "Click to awaken the constellation"}
              {state.mode === 'listening' && "Stars gathering..."}
              {state.mode === 'speaking' && "Voice resonating through stars"}
              {state.mode === 'forming' && "Heart constellation forming"}
            </p>

            {/* Simulation indicator */}
            {isSimulating && (
              <p className="text-sm text-cyan-500 mt-2">
                Constellation simulation active
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleFormHeart}
            className="px-4 py-2 rounded-lg backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all"
          >
            Form Heart
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, mode: 'idle' }))}
            className="px-4 py-2 rounded-lg backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all"
          >
            Scatter
          </button>
          <button
            onClick={handleInteraction}
            className={`px-4 py-2 rounded-lg backdrop-blur-[20px] bg-white/[0.03] border ${
              isListening ? 'border-cyan-500/50' : 'border-white/[0.05]'
            } hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all`}
          >
            {isListening ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}