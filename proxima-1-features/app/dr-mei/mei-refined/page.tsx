"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export default function MeiRefinedPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Connection sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Duration timer
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Refined Voice Orb - Subtle like Sesame/ChatGPT
  const VoiceOrb = () => {
    const orbSize = 160;
    
    // Get subtle animation based on state
    const getAnimation = () => {
      switch (voiceState) {
        case "idle":
          // Very subtle breathing
          return {
            scale: [1, 1.02, 1],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          };
        case "listening":
        case "speaking":
          // Subtle pulse - like a heartbeat
          return {
            scale: [1, 1.03, 1.01, 1],
            transition: {
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          };
        case "thinking":
          // Just color shift, no scale
          return {
            scale: 1,
          };
        default:
          return { scale: 1 };
      }
    };
    
    const getOrbStyle = () => {
      const baseGradient = "radial-gradient(circle at center, ";
      
      switch (voiceState) {
        case "listening":
          return {
            background: baseGradient + "#a855f7 0%, #ec4899 100%)",
            boxShadow: "0 0 40px rgba(168, 85, 247, 0.2)",
          };
        case "thinking":
          // Animated gradient shift
          return {
            background: baseGradient + "#3b82f6 0%, #8b5cf6 100%)",
            boxShadow: "0 0 40px rgba(59, 130, 246, 0.2)",
          };
        case "speaking":
          return {
            background: baseGradient + "#ec4899 0%, #f97316 100%)",
            boxShadow: "0 0 40px rgba(236, 72, 153, 0.2)",
          };
        default: // idle
          return {
            background: baseGradient + "#a78bfa 0%, #c4b5fd 100%)",
            boxShadow: "0 0 30px rgba(167, 139, 250, 0.15)",
          };
      }
    };
    
    return (
      <motion.div
        style={{ width: orbSize, height: orbSize }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main orb - single element, no complex layers */}
        <motion.div
          className="w-full h-full rounded-full"
          style={{
            ...getOrbStyle(),
            transition: "all 0.5s ease",
          }}
          animate={getAnimation()}
        />
        
        {/* Thinking state color animation */}
        {voiceState === "thinking" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at center, #8b5cf6 0%, #3b82f6 100%)",
              mixBlendMode: "overlay",
            }}
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    );
  };
  
  return (
    <>
      {/* Connecting overlay */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-light text-white/80 mb-2">
                Connecting to Dr. Mei
              </h1>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white/40"
              >
                •••
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main interface */}
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isConnected ? 1 : 0 }}
            className="flex items-center gap-3 text-white/60 text-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>Dr. Mei</span>
            <span className="text-white/30">•</span>
            <span>{formatDuration(duration)}</span>
          </motion.div>
        </div>
        
        {/* Orb container */}
        <div className="flex-1 flex items-center justify-center">
          {isConnected && <VoiceOrb />}
        </div>
        
        {/* Status */}
        <div className="text-center pb-6">
          <AnimatePresence mode="wait">
            {isConnected && voiceState !== "idle" && (
              <motion.p
                key={voiceState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/40 text-xs uppercase tracking-wider"
              >
                {voiceState}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Controls */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isConnected ? 1 : 0 }}
            className="flex justify-center gap-4 mb-6"
          >
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all ${
                isMuted 
                  ? "bg-red-500/10 text-red-400" 
                  : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              onClick={() => router.push('/dr-mei')}
              className="p-4 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <PhoneOff size={20} />
            </button>
          </motion.div>
          
          {/* Test controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isConnected ? 1 : 0 }}
            className="flex justify-center gap-2"
          >
            {(['idle', 'listening', 'thinking', 'speaking'] as const).map((state) => (
              <button
                key={state}
                onClick={() => setVoiceState(state)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                  voiceState === state 
                    ? "bg-white/10 text-white" 
                    : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06]"
                }`}
              >
                {state}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}