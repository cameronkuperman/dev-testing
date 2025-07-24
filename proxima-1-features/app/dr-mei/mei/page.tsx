"use client";

import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProductionVoiceDetection } from "../../hooks/useProductionVoiceDetection";

type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";
type ConnectionState = "connecting" | "connected";

export default function MeiVoicePage() {
  const router = useRouter();
  const [voiceState, setVoiceState] = useState<VoiceState>("connecting");
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [simulatedLevel, setSimulatedLevel] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout>();

  // Component lifecycle
  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);
  
  // Animation controls
  const orbControls = useAnimationControls();
  const breathingControls = useAnimationControls();
  
  // Production-grade voice detection (like xAI/ChatGPT/Sesame)
  const { 
    voiceActivity, 
    isSpeaking, 
    signalQuality,
    error: voiceError, 
    startListening, 
    stopListening 
  } = useProductionVoiceDetection({
    onSpeechStart: () => {
      setIsUserSpeaking(true);
      setVoiceState("listening");
    },
    onSpeechEnd: () => {
      setIsUserSpeaking(false);
      if (voiceState === "listening") {
        setVoiceState("idle");
      }
    },
    onVoiceActivityChange: (activity) => {
      // Don't log every change - too noisy
    },
    // Production settings
    vadSensitivity: 0.7,
    noiseSuppressionLevel: 'high',
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
  });
  
  // Production VAD handles all speech detection automatically
  
  // Use real voice activity when listening, simulated when speaking
  const currentAudioLevel = voiceState === "listening" ? voiceActivity : simulatedLevel;
  
  // Handle voice detection
  useEffect(() => {
    if (connectionState === "connected" && !isMuted) {
      startListening();
    } else {
      stopListening();
    }
    
    return () => {
      stopListening();
    };
  }, [connectionState, isMuted]); // Functions don't need to be dependencies
  
  // Handle voice error
  useEffect(() => {
    if (voiceError) {
      console.warn("Microphone access:", voiceError);
    }
  }, [voiceError]);
  
  // Simulate speech audio levels
  useEffect(() => {
    if (voiceState === "speaking") {
      const interval = setInterval(() => {
        // Natural speech pattern with pauses
        const time = Date.now() * 0.001;
        const speechPattern = 
          Math.sin(time * 2) * 0.3 + 
          Math.sin(time * 3.7) * 0.2 + 
          Math.sin(time * 0.5) * 0.1;
        const pause = Math.sin(time * 0.3) > 0.7 ? 0.2 : 1;
        setSimulatedLevel(Math.max(0, Math.min(1, 0.4 + speechPattern * pause)));
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setSimulatedLevel(0);
    }
  }, [voiceState]);

  // Breathing animation - extremely subtle like Sesame
  useEffect(() => {
    if (voiceState === "idle" && connectionState === "connected") {
      breathingControls.start({
        scale: [1, 1.01, 1], // Just 1% scale change for idle
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else if (voiceState === "listening" || voiceState === "speaking") {
      // Very subtle pulse for active states
      breathingControls.start({
        scale: [1, 1.02, 1], // 2% max scale
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else if (voiceState === "thinking") {
      // No scale change for thinking - just color
      breathingControls.stop();
      breathingControls.set({ scale: 1 });
    } else {
      breathingControls.stop();
      breathingControls.set({ scale: 1 });
    }
  }, [voiceState, connectionState, breathingControls]);

  // Connection sequence - run only once
  useEffect(() => {
    let isMounted = true;
    
    const connectSequence = async () => {
      // Start with connecting state
      setConnectionState("connecting");
      setVoiceState("connecting");
      
      // Show connected after animation completes
      if (isMounted) {
        setTimeout(() => {
          if (isMounted) {
            setConnectionState("connected");
            setVoiceState("idle");
          }
        }, 3000); // 3 seconds total for connection
      }
    };
    
    connectSequence();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once

  // Duration timer - only count when connected
  useEffect(() => {
    if (connectionState === "connected") {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const simulateSpeech = useCallback(() => {
    const sequence = async () => {
      // Mei listens first
      setVoiceState("listening");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then thinks
      setVoiceState("thinking");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Then responds
      setVoiceState("speaking");
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // Return to idle
      setVoiceState("idle");
    };
    
    if (connectionState === "connected" && (voiceState === "idle" || voiceState === "listening")) {
      sequence();
    }
  }, [voiceState, connectionState]);

  // Minimal Voice Orb - Sesame style
  const VoiceOrb = () => {
    const orbSize = 160;
    const [rippleKey, setRippleKey] = useState(0);
    
    // Trigger ripples for speaking
    useEffect(() => {
      if (voiceState === "speaking") {
        const interval = setInterval(() => {
          setRippleKey(prev => prev + 1);
        }, 2000); // Ripple every 2 seconds
        return () => clearInterval(interval);
      }
    }, [voiceState]);
    
    const getOrbColor = () => {
      switch (voiceState) {
        case "listening":
          return "#a855f7";
        case "thinking":
          return "#3b82f6";
        case "speaking":
          return "#ec4899";
        default:
          return "#9ca3af"; // Gray for idle
      }
    };

    return (
      <motion.div 
        className="relative" 
        style={{ width: orbSize, height: orbSize }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Single solid orb - no complex gradients */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: getOrbColor(),
            transition: "background-color 0.3s ease",
          }}
          animate={breathingControls}
        />
        
        {/* Minimal glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            backgroundColor: getOrbColor(),
            opacity: 0.3,
            transition: "background-color 0.3s ease",
          }}
          animate={{
            scale: voiceState === "idle" ? 1 : 1.1,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Speaking ripples - subtle */}
        <AnimatePresence>
          {voiceState === "speaking" && (
            <motion.div
              key={rippleKey}
              className="absolute inset-0 rounded-full border"
              style={{ 
                borderColor: getOrbColor(),
                opacity: 0.4,
              }}
              initial={{ scale: 1 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Minimal header */}
        <div className="flex justify-between items-center p-6">
          <motion.div 
            className="text-white/50 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {connectionState === "connecting" ? (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span>Connecting to Dr. Mei</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    •••
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span>Dr. Mei</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/30">{formatDuration(duration)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Main orb */}
        <div className="flex-1 flex items-center justify-center">
          <VoiceOrb />
        </div>

        {/* Elegant status text */}
        <div className="text-center pb-8">
          <AnimatePresence mode="wait">
            {connectionState === "connected" && (
              <motion.div
                key={voiceState}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center gap-1"
              >
                {voiceState !== "idle" && (
                  <p className="text-white/30 text-xs font-light tracking-wider">
                    {voiceState === "listening" && (isUserSpeaking ? "I'm listening..." : "Listening...")}
                    {voiceState === "thinking" && "Thinking..."}
                    {voiceState === "speaking" && "Speaking..."}
                  </p>
                )}
                {voiceState === "listening" && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {['poor', 'fair', 'good', 'excellent'].map((quality, i) => (
                        <div
                          key={quality}
                          className={`w-1 h-3 rounded-full transition-all ${
                            ['poor', 'fair', 'good', 'excellent'].indexOf(signalQuality) >= i
                              ? 'bg-green-400' 
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white/20 text-[10px] uppercase tracking-wider">
                      {signalQuality}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refined controls */}
        <div className="flex justify-center items-center gap-4 pb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={simulateSpeech}
            className="p-3 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.06] transition-all"
            disabled={connectionState !== "connected" || voiceState === "thinking" || voiceState === "speaking"}
          >
            <Phone className="w-4 h-4 text-white/50" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className={`p-4 rounded-full backdrop-blur-xl transition-all ${
              isMuted 
                ? "bg-red-500/10 border border-red-500/20" 
                : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06]"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-red-400" />
            ) : (
              <Mic className="w-5 h-5 text-white/60" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dr-mei")}
            className="p-3 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <PhoneOff className="w-4 h-4 text-red-400" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}