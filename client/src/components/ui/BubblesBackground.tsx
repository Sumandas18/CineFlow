"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BubblesBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Pre-defined random-looking values to avoid hydration mismatch
  const colors = [
    "from-blue-500/40 to-purple-500/40 shadow-blue-500/20",
    "from-pink-500/40 to-orange-500/40 shadow-pink-500/20",
    "from-cyan-500/40 to-blue-500/40 shadow-cyan-500/20",
    "from-purple-500/40 to-pink-500/40 shadow-purple-500/20",
    "from-yellow-500/40 to-red-500/40 shadow-yellow-500/20"
  ];

  const bubbleConfigs = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 25) + 8, // Small size (8px to 33px)
    left: Math.floor(Math.random() * 100) + "%",
    duration: Math.floor(Math.random() * 8) + 5, // Much faster floating (5s to 13s)
    delay: Math.random() * 5,
    xMovement: Math.floor(Math.random() * 150) - 75,
    colorClass: colors[Math.floor(Math.random() * colors.length)]
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbleConfigs.map((config) => (
        <motion.div
          key={config.id}
          className={`absolute rounded-full bg-gradient-to-tr ${config.colorClass} backdrop-blur-[1px] shadow-lg`}
          style={{
            width: config.size,
            height: config.size,
            left: config.left,
            top: "110%", // Start just below the viewport
          }}
          animate={{
            y: [0, -1500], // Move way up past the viewport
            x: [0, config.xMovement],
            rotate: [0, 360],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "linear",
            delay: config.delay,
          }}
        />
      ))}
    </div>
  );
}
