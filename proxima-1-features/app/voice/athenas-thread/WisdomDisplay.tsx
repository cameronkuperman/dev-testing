"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WisdomDisplayProps {
  text: string;
  pattern: string;
}

const WISDOM_QUOTES = {
  greeting: "The thread of wisdom connects us all",
  listening: "I perceive the patterns in your words",
  thinking: "The threads of knowledge interweave",
  medical: "The caduceus reveals health's mysteries", 
  dna: "Your genetic tapestry tells a story",
  wisdom: "Ancient patterns hold modern truths",
  heartbeat: "Each pulse carries vital information",
  general: "Speak, and the thread shall respond"
};

export default function WisdomDisplay({ text, pattern }: WisdomDisplayProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Get appropriate wisdom based on pattern
    const wisdom = WISDOM_QUOTES[pattern as keyof typeof WISDOM_QUOTES] || text || WISDOM_QUOTES.general;
    
    // Typewriter effect
    setIsTyping(true);
    setDisplayText('');
    
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < wisdom.length) {
        setDisplayText(prev => prev + wisdom[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [text, pattern]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pattern}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mt-8"
      >
        <p className="text-lg text-gray-300 font-light italic relative inline-block">
          {displayText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-gray-400 ml-1 align-middle"
            />
          )}
        </p>
        
        {/* Athena attribution */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-gray-600 mt-2"
        >
          — Athena
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}