"use client";

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  onToggleMic: () => void;
  onEnd: () => void;
}

export default function VoiceControls({ isListening, onToggleMic, onEnd }: VoiceControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6"
    >
      {/* Mute button - Sesame style */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={onToggleMic}
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#ecf0f1] hover:bg-[#e8eced] transition-colors duration-200"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#5a6c7d]"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <span className="text-[#5a6c7d] font-light">
          {isListening ? 'Mute' : 'Unmute'}
        </span>
      </motion.button>

      {/* End call button - Medical red */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={onEnd}
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#e74c3c] hover:bg-[#d62c1a] text-white transition-colors duration-200"
      >
        <div className="w-4 h-4 bg-white rounded-sm" />
        <span className="font-light">End call</span>
      </motion.button>
    </motion.div>
  );
}