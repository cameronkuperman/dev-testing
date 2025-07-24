"use client";

import { motion } from 'framer-motion';
import { SynapticPulse, Branch } from './types';

interface SynapticEffectsProps {
  pulses: SynapticPulse[];
  branches: Map<string, Branch>;
}

export default function SynapticEffects({ pulses, branches }: SynapticEffectsProps) {
  return (
    <>
      {pulses.map((pulse) => {
        const branch = branches.get(pulse.pathId);
        if (!branch || branch.startX === undefined || branch.startY === undefined ||
            branch.endX === undefined || branch.endY === undefined) return null;

        const x = branch.startX + (branch.endX - branch.startX) * pulse.progress;
        const y = branch.startY + (branch.endY - branch.startY) * pulse.progress;

        return (
          <motion.circle
            key={pulse.id}
            cx={x}
            cy={y}
            r="3"
            fill="url(#synapticGradient)"
            opacity={pulse.opacity}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ duration: 0.5 }}
          />
        );
      })}
    </>
  );
}