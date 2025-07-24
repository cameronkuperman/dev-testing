"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Zap, Wind } from 'lucide-react';
import { useVoiceDetection } from '@/app/hooks/useVoiceDetection';
import ThreadCanvas from './ThreadCanvas';
import WisdomDisplay from './WisdomDisplay';
import { PatternLibrary } from './PatternLibrary';
import { MorphEngine } from './MorphEngine';
import { ThreadPhysics } from './ThreadPhysics';
import { ThreadState, Pattern } from './types';

// Pattern sequence for demonstration
const PATTERN_SEQUENCE: Pattern[] = [
  'sine', 'straight', 'caduceus', 'greekkey', 'dna', 'heartbeat'
];

export default function AthenasThreadVoice() {
  const [state, setState] = useState<ThreadState>({
    thread: {
      points: [],
      pattern: 'sine',
      morphProgress: 0,
      color: { start: '#9ca3af', end: '#6b7280' }
    },
    amplitude: 0,
    mode: 'idle',
    currentPattern: 'sine',
    targetPattern: 'sine',
    morphStartTime: 0,
    wisdomText: ''
  });

  const [speechDuration, setSpeechDuration] = useState(0);
  const speechStartRef = useRef<number>(0);

  // System references
  const patternLibraryRef = useRef<PatternLibrary>();
  const morphEngineRef = useRef<MorphEngine>();
  const threadPhysicsRef = useRef<ThreadPhysics>();
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
      speechStartRef.current = Date.now();
    },
    onSpeechEnd: () => {
      setState(prev => ({ ...prev, mode: 'listening' }));
      const duration = Date.now() - speechStartRef.current;
      setSpeechDuration(duration);
      
      // Auto-detect pattern based on speech
      if (morphEngineRef.current) {
        const detectedPattern = morphEngineRef.current.detectPatternFromContext(
          prev.amplitude,
          duration
        );
        handlePatternChange(detectedPattern);
      }
    },
    onAmplitudeChange: (amp) => {
      setState(prev => ({ ...prev, amplitude: amp }));
    }
  });

  // Initialize all systems
  useEffect(() => {
    patternLibraryRef.current = new PatternLibrary();
    morphEngineRef.current = new MorphEngine();
    threadPhysicsRef.current = new ThreadPhysics();

    // Create initial thread
    const initialPoints = patternLibraryRef.current.calculatePatternPoints('sine');
    setState(prev => ({
      ...prev,
      thread: {
        ...prev.thread,
        points: initialPoints
      }
    }));
  }, []);

  // Main animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setState(prev => {
        const newState = { ...prev };

        // Update morph engine
        if (morphEngineRef.current) {
          morphEngineRef.current.update(newState.thread);
        }

        // Apply physics
        if (threadPhysicsRef.current) {
          threadPhysicsRef.current.applyPhysics(newState.thread, deltaTime);
          
          // Apply voice distortion when speaking
          if (prev.mode === 'speaking' && prev.amplitude > 0) {
            threadPhysicsRef.current.applyVoiceDistortion(
              newState.thread,
              prev.amplitude
            );
          }
          
          // Apply smoothing for organic movement
          threadPhysicsRef.current.applySmoothingPass(newState.thread);
          
          // Keep thread on screen
          threadPhysicsRef.current.applyConstraints(newState.thread, 600, 400);
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

  const handlePatternChange = (pattern: Pattern) => {
    if (morphEngineRef.current && pattern !== state.thread.pattern) {
      morphEngineRef.current.morphToPattern(state.thread, pattern);
      setState(prev => ({ ...prev, targetPattern: pattern }));
    }
  };

  const cyclePattern = () => {
    const currentIndex = PATTERN_SEQUENCE.indexOf(state.thread.pattern);
    const nextIndex = (currentIndex + 1) % PATTERN_SEQUENCE.length;
    handlePatternChange(PATTERN_SEQUENCE[nextIndex]);
  };

  // Update amplitude from voice detection
  useEffect(() => {
    setState(prev => ({ ...prev, amplitude }));
  }, [amplitude]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Sophisticated ambient background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0"
        />
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

      {/* Pattern indicator */}
      <AnimatePresence>
        {state.thread.pattern !== 'sine' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-400 capitalize">
              {state.thread.pattern} pattern active
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Canvas container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleInteraction}
          className="cursor-pointer relative group"
        >
          <div className="relative">
            <ThreadCanvas
              thread={state.thread}
              amplitude={state.amplitude}
              mode={state.mode}
            />
            
            {/* Interaction hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-gray-600 text-sm"
              >
                {!isListening && "Click to begin"}
              </motion.div>
            </motion.div>
          </div>

          {/* Active indicator */}
          {isListening && (
            <motion.div
              className="absolute -inset-4 rounded-xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.2)',
                  '0 0 40px rgba(168, 85, 247, 0.4)',
                  '0 0 20px rgba(168, 85, 247, 0.2)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Wisdom display */}
        <WisdomDisplay 
          text={state.wisdomText} 
          pattern={state.thread.pattern}
        />

        {/* Simulation indicator */}
        {isSimulating && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-purple-500 mt-8 flex items-center gap-1"
          >
            <Wind className="w-3 h-3" />
            Thread simulation active
          </motion.p>
        )}
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
            onClick={cyclePattern}
            className="px-5 py-2.5 rounded-full backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Cycle Pattern
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setState(prev => ({ ...prev, mode: 'thinking' }))}
            className="px-5 py-2.5 rounded-full backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] text-sm text-gray-400 hover:text-white transition-all"
          >
            Think Mode
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInteraction}
            className={`px-6 py-2.5 rounded-full backdrop-blur-[20px] bg-white/[0.03] border ${
              isListening ? 'border-purple-500/50 text-purple-400' : 'border-white/[0.05] text-gray-400'
            } hover:border-white/[0.2] hover:text-white transition-all font-medium`}
          >
            {isListening ? 'Connected' : 'Connect'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}