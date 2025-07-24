"use client";

import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVoiceDetection } from "../../hooks/useVoiceDetection";

type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

export default function VarysVoicePage() {
  const router = useRouter();
  const [voiceState, setVoiceState] = useState<VoiceState>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [simulatedLevel, setSimulatedLevel] = useState(0);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  
  // Animation controls
  const orbControls = useAnimationControls();
  const dataStreamControls = useAnimationControls();
  
  // Real voice detection
  const { isListening, amplitude: realAudioLevel, startListening, stopListening } = useVoiceDetection();
  
  // Use real audio level when listening, simulated when speaking
  const currentAudioLevel = voiceState === "listening" ? realAudioLevel : simulatedLevel;
  
  // Handle voice detection without infinite loops
  useEffect(() => {
    if (voiceState === "listening" && !isMuted) {
      startListening();
    } else {
      stopListening();
    }
    
    return () => stopListening();
  }, [voiceState, isMuted]);
  
  // Simulate speech audio levels with data-like patterns
  useEffect(() => {
    if (voiceState === "speaking") {
      const interval = setInterval(() => {
        const time = Date.now() * 0.001;
        // More technical, data-like pattern
        const dataPattern = 
          Math.sin(time * 4.2) * 0.2 + 
          Math.sin(time * 8.7) * 0.15 + 
          Math.sin(time * 1.3) * 0.25 +
          Math.random() * 0.1;
        const level = Math.max(0, Math.min(1, 0.3 + dataPattern));
        setSimulatedLevel(level);
        
        // Update data visualization
        setDataPoints(prev => [...prev.slice(-30), level]);
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setSimulatedLevel(0);
      if (voiceState !== "listening") {
        setDataPoints([]);
      }
    }
  }, [voiceState]);

  // Update data points when listening
  useEffect(() => {
    if (voiceState === "listening" && currentAudioLevel > 0) {
      setDataPoints(prev => [...prev.slice(-30), currentAudioLevel]);
    }
  }, [voiceState, currentAudioLevel]);

  // Connection sequence
  useEffect(() => {
    const connectSequence = async () => {
      // Technical boot sequence
      await orbControls.start({
        scale: [0, 1.1, 1],
        opacity: [0, 1],
        transition: { 
          duration: 1.5, 
          ease: [0.16, 1, 0.3, 1],
          times: [0, 0.8, 1]
        }
      });
      
      setTimeout(() => {
        setVoiceState("idle");
        setTimeout(() => setVoiceState("listening"), 500);
      }, 800);
    };
    
    connectSequence();

    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const simulateSpeech = useCallback(() => {
    const sequence = async () => {
      setVoiceState("listening");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVoiceState("thinking");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVoiceState("speaking");
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setVoiceState("idle");
      setTimeout(() => setVoiceState("listening"), 500);
    };
    
    if (voiceState === "idle" || voiceState === "listening") {
      sequence();
    }
  }, [voiceState]);

  // Technical Varys Orb
  const VarysOrb = () => {
    const getStateColor = () => {
      switch (voiceState) {
        case "listening":
          return { primary: "#3b82f6", secondary: "#0ea5e9", glow: "#1e40af" };
        case "thinking":
          return { primary: "#6366f1", secondary: "#8b5cf6", glow: "#4f46e5" };
        case "speaking":
          return { primary: "#06b6d4", secondary: "#0891b2", glow: "#0e7490" };
        default:
          return { primary: "#0ea5e9", secondary: "#0284c7", glow: "#0369a1" };
      }
    };

    const colors = getStateColor();
    const orbSize = 200;

    return (
      <div className="relative" style={{ width: orbSize, height: orbSize }}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: 1 + currentAudioLevel * 0.15,
            opacity: 0.3 + currentAudioLevel * 0.3,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div 
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle at center, ${colors.glow}50, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* Technical grid overlay */}
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Main orb container */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          animate={orbControls}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08)`,
            border: `1px solid ${colors.primary}20`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Data visualization layer */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Waveform path */}
            {dataPoints.length > 1 && (
              <motion.path
                d={`M ${dataPoints.map((point, i) => 
                  `${(i / (dataPoints.length - 1)) * 100},${50 - point * 40}`
                ).join(' L ')}`}
                fill="none"
                stroke={colors.primary}
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
                opacity={0.8}
              />
            )}
            
            {/* Data points */}
            {dataPoints.map((point, i) => (
              <motion.circle
                key={i}
                cx={(i / (dataPoints.length - 1)) * 100}
                cy={50 - point * 40}
                r="1"
                fill={colors.secondary}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </svg>

          {/* Central processing indicator */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: voiceState === "thinking" ? 360 : 0,
            }}
            transition={{
              duration: 2,
              repeat: voiceState === "thinking" ? Infinity : 0,
              ease: "linear",
            }}
          >
            {/* Hexagonal shape */}
            <svg className="w-16 h-16" viewBox="0 0 100 100">
              <polygon
                points="50,10 85,30 85,70 50,90 15,70 15,30"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                opacity={0.3}
              />
              {voiceState === "thinking" && (
                <polygon
                  points="50,10 85,30 85,70 50,90 15,70 15,30"
                  fill="none"
                  stroke={colors.secondary}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity={0.6}
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="-360 50 50"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </polygon>
              )}
            </svg>
          </motion.div>

          {/* Radial data streams */}
          <AnimatePresence>
            {voiceState === "speaking" && (
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-full h-0.5"
                    style={{
                      transformOrigin: "0 50%",
                      rotate: `${i * 60}deg`,
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                      scaleX: [0, 1, 0],
                      opacity: [0, 0.6, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "linear",
                    }}
                  >
                    <div 
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(to right, transparent, ${colors.primary}60, transparent)`,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Status ring */}
          <motion.div
            className="absolute inset-4 rounded-full border"
            style={{ borderColor: `${colors.primary}30` }}
            animate={{
              scale: voiceState === "idle" ? [1, 1.02, 1] : 1,
              opacity: voiceState === "idle" ? [0.3, 0.5, 0.3] : 0.5,
            }}
            transition={{
              duration: 3,
              repeat: voiceState === "idle" ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Activity indicators */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
              animate={{
                scaleY: voiceState !== "idle" && voiceState !== "connecting" 
                  ? [1, 2, 1] : 1,
                opacity: voiceState !== "idle" && voiceState !== "connecting" 
                  ? [0.3, 1, 0.3] : 0.2,
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(#0ea5e930 1px, transparent 1px), linear-gradient(90deg, #0ea5e930 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <motion.div 
            className="text-blue-400/50 text-sm font-mono uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {voiceState === "connecting" ? (
                <motion.span
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  INITIALIZING NEURAL INTERFACE...
                </motion.span>
              ) : (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>VARYS AI</span>
                  <span className="text-blue-400/30">|</span>
                  <span className="text-blue-400/30 font-normal">{formatDuration(duration)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Main orb */}
        <div className="flex-1 flex items-center justify-center">
          <VarysOrb />
        </div>

        {/* Status */}
        <div className="text-center pb-8">
          <AnimatePresence mode="wait">
            {voiceState !== "idle" && voiceState !== "connecting" && (
              <motion.p
                key={voiceState}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-blue-400/40 text-xs font-mono uppercase tracking-widest"
              >
                {voiceState === "listening" && "▶ RECEIVING INPUT"}
                {voiceState === "thinking" && "◆ PROCESSING DATA"}
                {voiceState === "speaking" && "◉ TRANSMITTING"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 pb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={simulateSpeech}
            className="p-3 rounded-lg bg-blue-500/5 backdrop-blur-xl border border-blue-500/10 hover:bg-blue-500/10 transition-all"
            disabled={voiceState === "thinking" || voiceState === "speaking"}
          >
            <Phone className="w-4 h-4 text-blue-400/60" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-lg backdrop-blur-xl transition-all ${
              isMuted 
                ? "bg-red-500/10 border border-red-500/20" 
                : "bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-red-400" />
            ) : (
              <Mic className="w-5 h-5 text-blue-400/60" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dr-mei")}
            className="p-3 rounded-lg bg-red-500/10 backdrop-blur-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <PhoneOff className="w-4 h-4 text-red-400" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}