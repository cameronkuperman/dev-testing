"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Flower, Sparkles, Activity } from 'lucide-react';
import { useVoiceDetection } from '@/app/hooks/useVoiceDetection';
import FlowerRenderer from './FlowerRenderer';
import { PetalPhysics } from './PetalPhysics';
import { FrequencyAnalyzer } from './FrequencyAnalyzer';
import { HealthTopicDetector } from './HealthTopicDetector';
import { ParticleEffects } from './ParticleEffects';
import { FlowerState, FrequencyData } from './types';

// Professional status messages with medical context
const STATUS_MESSAGES = {
  closed: {
    text: "Touch to bloom",
    subtext: "Begin your health conversation"
  },
  listening: {
    text: "Petals opening to your voice",
    subtext: "Share your symptoms"
  },
  speaking: {
    text: "Resonating with your frequency",
    subtext: "Voice pattern recognized"
  },
  wilting: {
    text: "Detecting health concern",
    subtext: "Analyzing severity"
  }
};

export default function FrequencyFlowerVoice() {
  const [state, setState] = useState<FlowerState>({
    petals: [],
    amplitude: 0,
    mode: 'closed',
    topic: 'general',
    particles: [],
    rotationAngle: 0
  });

  const [centerGlow, setCenterGlow] = useState(0);
  const [transcript, setTranscript] = useState('');

  // System references
  const petalPhysicsRef = useRef<PetalPhysics>();
  const frequencyAnalyzerRef = useRef<FrequencyAnalyzer>();
  const topicDetectorRef = useRef<HealthTopicDetector>();
  const particleEffectsRef = useRef<ParticleEffects>();
  
  // Animation references
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const previousFreqDataRef = useRef<FrequencyData>({
    bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0
  });

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

  // Initialize all systems
  useEffect(() => {
    petalPhysicsRef.current = new PetalPhysics();
    frequencyAnalyzerRef.current = new FrequencyAnalyzer();
    topicDetectorRef.current = new HealthTopicDetector();
    particleEffectsRef.current = new ParticleEffects();

    // Create initial petals
    const initialPetals = petalPhysicsRef.current.createPetals();
    setState(prev => ({ ...prev, petals: initialPetals }));
  }, []);

  // Main animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setState(prev => {
        const newState = { ...prev };

        // Update rotation for idle beauty
        if (prev.mode === 'closed' || prev.mode === 'listening') {
          newState.rotationAngle = (prev.rotationAngle + deltaTime * 0.005) % 360;
        }

        // Update center glow based on activity
        setCenterGlow(prev => {
          const target = prev.amplitude > 0.3 ? prev.amplitude : 0.2;
          return prev + (target - prev) * 0.1;
        });

        // Simulate frequency data for now (would use real analyzer with audio context)
        const freqData: FrequencyData = {
          bass: prev.amplitude * (0.8 + Math.sin(now * 0.001) * 0.2),
          lowMid: prev.amplitude * (0.7 + Math.sin(now * 0.002) * 0.3),
          mid: prev.amplitude * (0.9 + Math.sin(now * 0.003) * 0.1),
          highMid: prev.amplitude * (0.6 + Math.sin(now * 0.004) * 0.4),
          treble: prev.amplitude * (0.5 + Math.sin(now * 0.005) * 0.5)
        };

        // Smooth frequency data
        if (frequencyAnalyzerRef.current) {
          const smoothedFreqData = frequencyAnalyzerRef.current.smoothFrequencyData(
            freqData,
            previousFreqDataRef.current,
            0.8
          );
          previousFreqDataRef.current = smoothedFreqData;

          // Map frequencies to petals
          if (petalPhysicsRef.current) {
            petalPhysicsRef.current.mapFrequenciesToPetals(smoothedFreqData, newState.petals);
          }
        }

        // Update petal physics
        if (petalPhysicsRef.current) {
          const bloomAmount = prev.mode === 'speaking' ? prev.amplitude : 
                             prev.mode === 'listening' ? 0.3 : 0;
          
          petalPhysicsRef.current.updatePetalBloom(bloomAmount, newState.petals, deltaTime);

          // Apply wilting if health concern detected
          if (prev.mode === 'wilting' && topicDetectorRef.current) {
            const severity = topicDetectorRef.current.getSeverityFromTopic(prev.topic);
            petalPhysicsRef.current.applyConcernWilting(severity, newState.petals);
          }
        }

        // Particle system updates
        if (particleEffectsRef.current) {
          // Emit pollen from petals when speaking
          if (prev.mode === 'speaking' && prev.amplitude > 0.3) {
            newState.petals.forEach(petal => {
              particleEffectsRef.current!.emitPollen(petal, prev.amplitude);
            });
          }

          // Update existing particles
          newState.particles = particleEffectsRef.current.updateParticles(deltaTime);
        }

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
      setState(prev => ({ ...prev, mode: 'closed', amplitude: 0 }));
      particleEffectsRef.current?.clear();
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

    // Detect health topic from transcript (mock for now)
    if (isUserSpeaking && topicDetectorRef.current) {
      const detectedTopic = topicDetectorRef.current.detectTopic(transcript);
      setState(prev => ({ ...prev, topic: detectedTopic }));

      // Check if we should wilt
      const severity = topicDetectorRef.current.getSeverityFromTopic(detectedTopic);
      if (severity > 0.5) {
        setState(prev => ({ ...prev, mode: 'wilting' }));
      }
    }
  }, [amplitude, isUserSpeaking, transcript]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Sophisticated ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-yellow-500/5 rounded-full blur-[100px]" />
          </motion.div>
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

      {/* Topic indicator */}
      <AnimatePresence>
        {state.topic !== 'general' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-400 capitalize">{state.topic} detected</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main flower container */}
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Flower SVG */}
          <motion.div
            onClick={handleInteraction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-[450px] h-[450px] cursor-pointer relative"
            style={{ transform: `rotate(${state.rotationAngle}deg)` }}
          >
            <FlowerRenderer
              petals={state.petals}
              particles={state.particles}
              amplitude={state.amplitude}
              mode={state.mode}
              topic={state.topic}
              centerGlow={centerGlow}
            />

            {/* Pulse effect overlay */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0, 0.1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: `radial-gradient(circle, ${
                    state.topic === 'emergency' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                  } 0%, transparent 70%)`
                }}
              />
            )}
          </motion.div>

          {/* Status display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <h3 className="text-lg text-white mb-1">
              {STATUS_MESSAGES[state.mode].text}
            </h3>
            <p className="text-sm text-gray-500">
              {STATUS_MESSAGES[state.mode].subtext}
            </p>

            {/* Simulation indicator */}
            {isSimulating && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-amber-500 mt-4 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Frequency simulation active
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Professional control dock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setState(prev => ({ ...prev, mode: 'wilting' }))}
            className="px-5 py-2.5 rounded-full backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all flex items-center gap-2"
          >
            <Flower className="w-4 h-4" />
            Test Wilting
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => particleEffectsRef.current?.createPollenBurst(225, 225, 0.8)}
            className="px-5 py-2.5 rounded-full backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all"
          >
            Pollen Burst
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInteraction}
            className={`px-6 py-2.5 rounded-full backdrop-blur-[20px] bg-white/[0.03] border ${
              isListening ? 'border-amber-500/50 text-amber-400' : 'border-white/[0.05] text-gray-400'
            } hover:border-white/[0.2] hover:text-white transition-all font-medium`}
          >
            {isListening ? 'Listening' : 'Begin'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}