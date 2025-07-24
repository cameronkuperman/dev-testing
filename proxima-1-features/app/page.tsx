"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { 
  Heart, 
  Brain, 
  FileText, 
  Phone, 
  Sparkles,
  Shield,
  Search,
  ScanLine,
  Bell,
  MapPin,
  ChevronRight,
  Activity,
  Eye,
  Microscope
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

interface FeatureLinkProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  subLinks?: { title: string; href: string }[];
}

function FeatureLink({ href, title, description, icon, gradient, subLinks }: FeatureLinkProps) {
  const [showSubLinks, setShowSubLinks] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      <div
        className={`relative backdrop-blur-[20px] bg-white/[0.03] border border-white/[0.05] rounded-2xl p-8 hover:border-white/[0.1] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10`}
        onMouseEnter={() => setShowSubLinks(true)}
        onMouseLeave={() => setShowSubLinks(false)}
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-5 hover:opacity-10 transition-opacity`} />
        
        <Link href={href} className="relative z-10 block">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
              <div className="text-white">{icon}</div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                {title}
                <ChevronRight className="w-4 h-4 opacity-50" />
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        </Link>

        {subLinks && showSubLinks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/[0.05]"
          >
            <div className="flex gap-4">
              {subLinks.map((subLink) => (
                <Link
                  key={subLink.href}
                  href={subLink.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3" />
                  {subLink.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const features: FeatureLinkProps[] = [
    {
      href: "/voice",
      title: "Voice UI Gallery",
      description: "Experience 5 unique voice interface designs for Athena - from medical minimal to neural networks",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      href: "/consilium",
      title: "Consilium Insurance Helper",
      description: "AI-powered insurance navigation and claim assistance with advanced analysis modes",
      icon: <Shield className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      subLinks: [
        { title: "Mentat Mode", href: "/consilium/mentat" },
        { title: "Recon Mode", href: "/consilium/recon" }
      ]
    },
    {
      href: "/dr-mei",
      title: "Dr. Mei",
      description: "Your personal AI health assistant providing medical insights and guidance",
      icon: <Heart className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      href: "/radiology-reader",
      title: "Radiology & Labs Reader",
      description: "Advanced medical imaging and laboratory results interpretation",
      icon: <Microscope className="w-6 h-6" />,
      gradient: "from-emerald-500 to-green-500"
    },
    {
      href: "/facetime",
      title: "FaceTime Health",
      description: "Virtual health consultations with AI-enhanced video analysis",
      icon: <Phone className="w-6 h-6" />,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      href: "/mentat-mode",
      title: "Mentat Mode",
      description: "Enhanced cognitive analysis for complex health pattern recognition",
      icon: <Brain className="w-6 h-6" />,
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      href: "/aragorn",
      title: "Aragorn/Strider",
      description: "Emergency health guidance and wilderness medicine assistant",
      icon: <Activity className="w-6 h-6" />,
      gradient: "from-red-500 to-orange-500"
    },
    {
      href: "/document-scanner",
      title: "Medical Document Scanner",
      description: "Intelligent OCR and analysis of medical documents and prescriptions",
      icon: <ScanLine className="w-6 h-6" />,
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      href: "/medication-reminders",
      title: "Medication Reminders",
      description: "Smart medication tracking with interaction warnings and adherence monitoring",
      icon: <Bell className="w-6 h-6" />,
      gradient: "from-pink-500 to-purple-500"
    },
    {
      href: "/doctor-finder",
      title: "Doctor Finder",
      description: "Locate nearby healthcare providers with AI-matched specialties",
      icon: <MapPin className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl sm:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Proxima-1
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-Powered Health Intelligence Platform
          </p>
          <p className="text-lg text-gray-500 mt-2">Feature Testing Environment</p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <FeatureLink key={feature.href} {...feature} />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-20 text-center text-gray-500 text-sm"
        >
          <p>Your health, understood.</p>
        </motion.div>
      </div>
    </div>
  );
}