"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function MeshGradientBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
      {/* Deep Blue / Navy base */}
      <div className="absolute inset-0 bg-[#020818]" />
      
      {/* Grid Overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a08_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Animated Black and White World Map */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(100%) invert(100%) brightness(200%)"
        }}
      />

      {/* Top Left - Indigo */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 80, -30, 0],
          y: [0, 40, 20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-blue-700/25 rounded-full blur-[120px]"
      />
      
      {/* Bottom Right - Cyan */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -90, 40, 0],
          y: [0, -60, -20, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-cyan-600/20 rounded-full blur-[140px]"
      />

      {/* Center - Deep Navy Pulse */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -50, 50, 0],
          y: [0, 80, -80, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-indigo-600/15 rounded-full blur-[100px]"
      />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-[#01081a]/40 backdrop-blur-[60px]" />
    </div>
  );
}
