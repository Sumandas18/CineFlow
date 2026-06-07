"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BubblesBackground() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  // Pre-defined random-looking values to avoid hydration mismatch
  const colors = [
    "from-blue-500/30 to-purple-500/30",
    "from-pink-500/30 to-orange-500/30",
    "from-cyan-500/30 to-blue-500/30",
    "from-purple-500/30 to-pink-500/30",
    "from-yellow-500/30 to-red-500/30"
  ];

  const bubbleCount = isMobile ? 15 : 35; // Drastically reduce on mobile for performance

  const bubbleConfigs = Array.from({ length: bubbleCount }).map((_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 25) + 8, // Small size (8px to 33px)
    left: Math.floor(Math.random() * 100) + "%",
    duration: Math.floor(Math.random() * 12) + 8, // Slower floating is better for FPS (8s to 20s)
    delay: Math.random() * 5,
    xMovement: Math.floor(Math.random() * 100) - 50,
    colorClass: colors[Math.floor(Math.random() * colors.length)]
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbleConfigs.map((config) => (
        <motion.div
          key={config.id}
          className={`absolute rounded-full bg-gradient-to-tr ${config.colorClass} shadow-sm`}
          style={{
            willChange: "transform",
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
