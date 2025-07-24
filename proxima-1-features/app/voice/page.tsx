"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Heart, 
  Brain, 
  Star,
  Flower,
  Sparkles,
  ArrowLeft
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface VoiceUIOption {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  preview: string;
}

function VoiceUICard({ href, title, description, icon, gradient, preview }: VoiceUIOption) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={href}>
        <div className="relative backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] rounded-2xl p-8 hover:border-white/[0.1] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 h-full">
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-5 hover:opacity-10 transition-opacity`} />
          
          <div className="relative z-10">
            <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 mb-4`}>
              <div className="text-white">{icon}</div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {title}
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {description}
            </p>
            
            <div className="font-mono text-xs text-gray-500 p-3 bg-white/[0.02] rounded-lg">
              {preview}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function VoiceUIShowcase() {
  const voiceUIs: VoiceUIOption[] = [
    {
      href: "/voice/medical-minimal",
      title: "Medical-Focused Minimal",
      description: "Minimalist interface with EKG heartbeat line that animates with voice amplitude",
      icon: <Heart className="w-6 h-6" />,
      gradient: "from-emerald-500 to-green-500",
      preview: "───♥───╱╲───"
    },
    {
      href: "/voice/neural-bloom",
      title: "Neural Bloom",
      description: "Circle that blooms into neural network patterns when speaking",
      icon: <Brain className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
      preview: "·─●─· → ✦─●─✦"
    },
    {
      href: "/voice/constellation-heart",
      title: "Constellation Heart",
      description: "Scattered stars form a heart shape, pulsing with heartbeat rhythm",
      icon: <Star className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      preview: "· · · → ·♥·"
    },
    {
      href: "/voice/frequency-flower",
      title: "Frequency Flower",
      description: "Radiating frequency lines form flower petals that bloom with voice",
      icon: <Flower className="w-6 h-6" />,
      gradient: "from-amber-500 to-yellow-500",
      preview: "\\|/ → \\\\♦//"
    },
    {
      href: "/voice/athenas-thread",
      title: "Athena's Thread",
      description: "Single flowing line morphs between medical symbols and Greek patterns",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-indigo-500 to-purple-500",
      preview: "∿∿∿ → ╔═╝"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Voice UI Gallery
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your voice interface experience. Each design offers a unique way to interact with Athena.
          </p>
        </motion.div>

        {/* Voice UI Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {voiceUIs.map((ui) => (
            <VoiceUICard key={ui.href} {...ui} />
          ))}
        </motion.div>

        {/* Info section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">About Voice Interfaces</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Each interface uses real-time voice detection to create unique visual experiences. 
              Grant microphone permissions to see the full effect, or use the simulation mode to preview.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}