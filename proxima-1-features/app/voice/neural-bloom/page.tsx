"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useVoiceDetection } from '@/app/hooks/useVoiceDetection';
import NeuralNetworkSVG from './NeuralNetworkSVG';
import { BranchGenerator } from './BranchGenerator';
import { NeuralBloomState, Branch, SynapticPulse } from './types';

export default function NeuralBloomVoice() {
  const [state, setState] = useState<NeuralBloomState>({
    branches: new Map<string, Branch>(),
    amplitude: 0,
    mode: 'idle',
    synapticPulses: [],
    rotationAngle: 0
  });

  const branchGeneratorRef = useRef<BranchGenerator>();
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

  // Initialize branch generator
  useEffect(() => {
    branchGeneratorRef.current = new BranchGenerator(200, 200, 60);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setState(prev => {
        const newState = { ...prev };

        // Update rotation based on mode
        if (prev.mode === 'idle' || prev.mode === 'listening') {
          newState.rotationAngle = (prev.rotationAngle + deltaTime * 0.01) % 360;
        }

        // Generate branches based on amplitude
        if (branchGeneratorRef.current) {
          const targetAmplitude = prev.mode === 'thinking' ? 0.8 : prev.amplitude;
          newState.branches = branchGeneratorRef.current.generateBranches(
            targetAmplitude,
            prev.branches
          );

          // Apply growth animation
          branchGeneratorRef.current.applyGrowthAnimation(
            newState.branches,
            targetAmplitude > 0.1 ? 1 : 0,
            deltaTime
          );
        }

        // Generate synaptic pulses
        if (prev.amplitude > 0.5 && Math.random() < 0.05) {
          const branchArray = Array.from(newState.branches.values());
          if (branchArray.length > 0) {
            const randomBranch = branchArray[Math.floor(Math.random() * branchArray.length)];
            newState.synapticPulses.push({
              id: `pulse-${Date.now()}-${Math.random()}`,
              pathId: randomBranch.id,
              progress: 0,
              opacity: 1
            });
          }
        }

        // Update synaptic pulses
        newState.synapticPulses = newState.synapticPulses
          .map(pulse => ({
            ...pulse,
            progress: pulse.progress + deltaTime * 0.002,
            opacity: 1 - pulse.progress
          }))
          .filter(pulse => pulse.progress < 1);

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

  // Update amplitude from voice detection
  useEffect(() => {
    setState(prev => ({ ...prev, amplitude }));
  }, [amplitude]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[100px] animate-pulse" />
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

      {/* Center Stage */}
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* SVG Container */}
          <motion.div
            onClick={handleInteraction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-[400px] h-[400px] cursor-pointer"
          >
            <NeuralNetworkSVG
              branches={state.branches}
              amplitude={state.amplitude}
              mode={state.mode}
              synapticPulses={state.synapticPulses}
              rotationAngle={state.rotationAngle}
            />
          </motion.div>

          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400">
              {state.mode === 'idle' && "Click to activate neural interface"}
              {state.mode === 'listening' && "Neural pathways opening..."}
              {state.mode === 'speaking' && "Synaptic activity detected"}
              {state.mode === 'thinking' && "Processing neural patterns..."}
            </p>

            {/* Simulation indicator */}
            {isSimulating && (
              <p className="text-sm text-purple-500 mt-2">
                Neural simulation active
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Control Dock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setState(prev => ({ ...prev, mode: 'thinking' }))}
            className="px-4 py-2 rounded-lg backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all"
          >
            Thinking Mode
          </button>
          <button
            onClick={handleInteraction}
            className={`px-4 py-2 rounded-lg backdrop-blur-[20px] bg-white/[0.03] border ${
              isListening ? 'border-purple-500/50' : 'border-white/[0.05]'
            } hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all`}
          >
            {isListening ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}