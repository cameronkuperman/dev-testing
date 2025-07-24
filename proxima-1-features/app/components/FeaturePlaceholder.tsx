"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
}

export default function FeaturePlaceholder({ title, description, gradient, icon }: FeaturePlaceholderProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-[120px]`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-[120px]`} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-10 mb-8`}>
            <div className="text-white">{icon}</div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {title}
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            {description}
          </p>

          <div className="backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] rounded-2xl p-12 max-w-2xl mx-auto">
            <p className="text-gray-500 text-lg">Feature coming soon...</p>
            <p className="text-gray-600 text-sm mt-4">This feature is currently under development</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}