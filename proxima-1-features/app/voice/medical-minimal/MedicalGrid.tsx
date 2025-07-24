"use client";

import { motion } from 'framer-motion';

export default function MedicalGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Subtle dot grid pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(127, 196, 201, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />
      
      {/* Very subtle gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(250, 251, 251, 0.5) 100%)'
        }}
      />
    </motion.div>
  );
}