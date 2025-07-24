"use client";

import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export default function MeiSimplePage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [duration, setDuration] = useState(0);
  
  // Connection sequence - 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Duration timer - starts after connection
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);
  
  // No Framer Motion animation controls needed - using CSS animations
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Simple Voice Orb - NO BLINKING
  const VoiceOrb = ({ isVisible }: { isVisible: boolean }) => {
    const orbSize = 160;
    const [ripples, setRipples] = useState<number[]>([]);
    
    // Ripples when speaking - every 2 seconds
    useEffect(() => {
      if (voiceState === "speaking" && isVisible) {
        const addRipple = () => {
          setRipples(prev => [...prev, Date.now()]);
          // Clean up old ripples
          setTimeout(() => {
            setRipples(prev => prev.slice(1));
          }, 3000);
        };
        
        // Add first ripple immediately
        addRipple();
        
        // Fire every 4-6 seconds randomly
        const scheduleNextRipple = () => {
          const timeout = setTimeout(() => {
            addRipple();
            scheduleNextRipple();
          }, Math.random() * 2000 + 4000); // 4-6 seconds
          return timeout;
        };
        
        const timeoutId = scheduleNextRipple();
        
        return () => {
          clearTimeout(timeoutId);
          setRipples([]);
        };
      } else {
        setRipples([]);
      }
    }, [voiceState, isVisible]);
    
    // Get gradient colors based on state - beautiful mixed gradients
    const getGradient = () => {
      switch (voiceState) {
        case "listening":
          return "radial-gradient(circle at 30% 30%, #ec4899 0%, #8b5cf6 35%, #1f2937 100%)";
        case "thinking":
          // Will be animated with keyframes
          return "radial-gradient(circle at center, #8b5cf6 0%, #ec4899 50%, #1e293b 100%)";
        case "speaking":
          return "radial-gradient(circle at 70% 70%, #f472b6 0%, #a855f7 40%, #581c87 100%)";
        default:
          return "radial-gradient(circle at 40% 40%, #a855f7 0%, #6366f1 50%, #312e81 100%)";
      }
    };
    
    // Get animation based on state
    const getAnimation = () => {
      if (!isVisible) return "none";
      
      switch (voiceState) {
        case "idle":
          return "breathe 4s ease-in-out infinite";
        case "thinking":
          return "thinkingGradient 8s linear infinite";
        case "speaking":
          return "speaking 4s ease-in-out infinite";
        case "listening":
          return "listening 1.5s ease-in-out infinite";
        default:
          return "none";
      }
    };
    
    return (
      <div 
        className="relative transition-all duration-700 ease-out"
        style={{ 
          width: orbSize, 
          height: orbSize,
          opacity: isVisible ? 1 : 0,
          transform: `scale(${!isVisible ? 0.8 : 1})`
        }}
      >
        {/* Main orb - using CSS animations */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: getGradient(),
            boxShadow: `0 0 40px rgba(168, 85, 247, 0.3)`,
            animation: getAnimation(),
          }}
        />
        
        {/* Simple glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: getGradient(),
            opacity: 0.3,
            animation: voiceState === "speaking" ? "speakingGlow 0.8s ease-in-out infinite" : "none",
          }}
        />
        
        {/* Speaking ripples - actual rings */}
        <div className="absolute inset-0 pointer-events-none">
          {ripples.map(key => (
            <div
              key={key}
              className="absolute rounded-full"
              style={{
                width: orbSize,
                height: orbSize,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid #f472b6',
                animation: "ringExpand 3s ease-out forwards",
              }}
            />
          ))}
        </div>
        
        {/* CSS Keyframes */}
        <style jsx>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes speaking {
            0% { transform: scale(1) translateX(0) translateY(0); }
            5% { transform: scale(1.03) translateX(-1px) translateY(0); }
            10% { transform: scale(1.06) translateX(2px) translateY(-1px); }
            15% { transform: scale(1.04) translateX(-3px) translateY(1px); }
            20% { transform: scale(1.08) translateX(1px) translateY(2px); }
            25% { transform: scale(1.10) translateX(-2px) translateY(-2px); }
            30% { transform: scale(1.05) translateX(3px) translateY(0); }
            35% { transform: scale(1.07) translateX(0) translateY(-3px); }
            40% { transform: scale(1.09) translateX(-1px) translateY(1px); }
            45% { transform: scale(1.04) translateX(2px) translateY(2px); }
            50% { transform: scale(1.11) translateX(-3px) translateY(-1px); }
            55% { transform: scale(1.06) translateX(1px) translateY(0); }
            60% { transform: scale(1.08) translateX(-2px) translateY(3px); }
            65% { transform: scale(1.03) translateX(0) translateY(-2px); }
            70% { transform: scale(1.07) translateX(3px) translateY(1px); }
            75% { transform: scale(1.05) translateX(-1px) translateY(-1px); }
            80% { transform: scale(1.09) translateX(2px) translateY(0); }
            85% { transform: scale(1.04) translateX(0) translateY(2px); }
            90% { transform: scale(1.06) translateX(-2px) translateY(-3px); }
            95% { transform: scale(1.02) translateX(1px) translateY(1px); }
            100% { transform: scale(1) translateX(0) translateY(0); }
          }
          
          @keyframes speakingGlow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
          
          @keyframes listening {
            0% { transform: scale(1); }
            10% { transform: scale(1.05); }
            20% { transform: scale(1.02); }
            30% { transform: scale(1.08); }
            40% { transform: scale(1.03); }
            50% { transform: scale(1.10); }
            60% { transform: scale(1.04); }
            70% { transform: scale(1.07); }
            80% { transform: scale(1.02); }
            90% { transform: scale(1.06); }
            100% { transform: scale(1); }
          }
          
          @keyframes thinkingGradient {
            0% { 
              background: radial-gradient(circle at 50% 50%, #8b5cf6 0%, #ec4899 35%, #1e293b 100%);
              filter: hue-rotate(0deg);
            }
            100% { 
              background: radial-gradient(circle at 50% 50%, #8b5cf6 0%, #ec4899 35%, #1e293b 100%);
              filter: hue-rotate(360deg);
            }
          }
          
          @keyframes ringExpand {
            0% { 
              width: 160px;
              height: 160px;
              opacity: 0.8;
              border-width: 2px;
            }
            100% { 
              width: 600px;
              height: 600px;
              opacity: 0;
              border-width: 1px;
            }
          }
        `}</style>
      </div>
    );
  };
  
  return (
    <>
      {/* Full-screen connecting overlay */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl font-light text-white mb-8">
                Connecting to Dr. Mei
              </h1>
              <motion.div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main interface */}
      <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5" />
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6">
            <motion.div 
              className="text-white/50 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: isConnected ? 1 : 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span>Dr. Mei</span>
                <span className="text-white/30">•</span>
                <span className="text-white/30">{formatDuration(duration)}</span>
              </div>
            </motion.div>
          </div>
          
          {/* Orb container - always render VoiceOrb, control visibility with prop */}
          <div className="flex-1 flex items-center justify-center">
            <VoiceOrb isVisible={isConnected} />
          </div>
          
          {/* Status text */}
          <div className="text-center pb-8">
            <AnimatePresence mode="wait">
              {isConnected && voiceState !== "idle" && (
                <motion.p
                  key={voiceState}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-white/30 text-xs font-light tracking-wider uppercase"
                >
                  {voiceState}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Manual control buttons */}
          <motion.div 
            className="flex justify-center items-center gap-4 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isConnected ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => setVoiceState("idle")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                voiceState === "idle" 
                  ? "bg-white/10 text-white" 
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              Idle
            </button>
            <button
              onClick={() => setVoiceState("listening")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                voiceState === "listening" 
                  ? "bg-purple-500/20 text-purple-300" 
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              Listen
            </button>
            <button
              onClick={() => setVoiceState("thinking")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                voiceState === "thinking" 
                  ? "bg-blue-500/20 text-blue-300" 
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              Think
            </button>
            <button
              onClick={() => setVoiceState("speaking")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                voiceState === "speaking" 
                  ? "bg-pink-500/20 text-pink-300" 
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              Speak
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}