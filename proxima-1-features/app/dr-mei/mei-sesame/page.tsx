"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGeminiVoice } from "../../hooks/useGeminiVoiceRealtime";

export default function MeiSesamePage() {
  const router = useRouter();
  const [showConnecting, setShowConnecting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const {
    isConnected,
    isMuted,
    status,
    voiceActivity,
    connect,
    disconnect,
    toggleMute,
  } = useGeminiVoice({
    onConnectionChange: (connected) => {
      console.log('Connection changed:', connected);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      setShowConnecting(false);
    },
  });
  
  // Duration timer - starts when connection is established and shown
  useEffect(() => {
    if (!showConnecting && isConnected) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showConnecting, isConnected]);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle orb click to start conversation
  const handleOrbClick = () => {
    if (!hasStarted && !showConnecting) {
      setHasStarted(true);
      setShowConnecting(true);
      connect();
      
      // Hide connecting screen after connection or timeout
      setTimeout(() => {
        setShowConnecting(false);
      }, 3000);
    }
  };
  
  // Handle end call
  const handleEndCall = () => {
    disconnect();
    router.push('/dr-mei');
  };
  
  // Minimal Voice Orb - Sesame style
  const VoiceOrb = () => {
    const getOrbColor = () => {
      if (!hasStarted) return "#9ca3af"; // Gray when not started
      
      switch (status) {
        case "listening":
          return "#a855f7"; // Purple
        case "thinking":
          return "#3b82f6"; // Blue
        case "speaking":
          return "#ec4899"; // Pink
        default:
          return "#9ca3af"; // Gray for idle
      }
    };
    
    const getScale = () => {
      if (!hasStarted) return [1, 1.01, 1]; // Subtle breathing when not started
      
      // Use voice activity for dynamic scaling when listening
      if (status === "listening" && voiceActivity > 0) {
        return [1, 1 + voiceActivity * 0.05, 1]; // Scale based on voice activity
      }
      
      switch (status) {
        case "speaking":
          return [1, 1.03, 1]; // Slightly larger pulse when speaking
        case "thinking":
          return 1; // No scale change
        default:
          return [1, 1.01, 1]; // Barely visible breathing
      }
    };
    
    return (
      <motion.div
        className="relative w-48 h-48 cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={handleOrbClick}
        whileHover={!hasStarted ? { scale: 1.05 } : {}}
      >
        {/* Single solid orb - no complex layers */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: getOrbColor(),
            transition: "background-color 0.3s ease",
          }}
          animate={{
            scale: getScale(),
          }}
          transition={{
            scale: {
              duration: status === "idle" ? 3 : 1,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
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
            scale: status === "idle" ? 1 : 1.1,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };
  
  return (
    <>
      {/* Simple connecting screen */}
      <AnimatePresence>
        {showConnecting && (
          <motion.div
            className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-2xl text-gray-700 mb-4">Connecting to Mei</div>
              <div className="text-gray-500">by proxima</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main interface - Sesame style */}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: !showConnecting ? 1 : 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-normal text-gray-700">
              Mei {formatDuration(duration)}
            </h1>
            <p className="text-sm text-gray-500">by proxima</p>
          </motion.div>
          
          {!showConnecting && (
            <div className="absolute top-6 right-6">
              <div className="text-sm text-gray-500">
                {hasStarted ? (
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                ) : null}
                Cameron C.
              </div>
            </div>
          )}
        </div>
        
        {/* Orb container */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!showConnecting && (
            <>
              <VoiceOrb />
              {!hasStarted && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-gray-500 text-sm"
                >
                  Click to start conversation
                </motion.p>
              )}
            </>
          )}
        </div>
        
        {/* Bottom controls */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: !showConnecting && hasStarted ? 1 : 0 }}
            className="flex justify-center gap-6"
          >
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isMuted 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{isMuted ? '🔇' : '🎙️'}</span>
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            
            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              <span className="text-lg">📞</span>
              <span>End call</span>
            </button>
          </motion.div>
          
          {/* Connection status for debugging */}
          {process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: !showConnecting ? 0.5 : 0 }}
              className="flex justify-center gap-2 mt-4 text-xs text-gray-500"
            >
              <span>Status: {status}</span>
              <span>•</span>
              <span>Connected: {isConnected ? 'Yes' : 'No'}</span>
              <span>•</span>
              <span>Activity: {(voiceActivity * 100).toFixed(0)}%</span>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}