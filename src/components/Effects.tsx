import React from 'react';
import { motion } from 'framer-motion';

export const Particles = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -10, x: Math.random() * window.innerWidth, opacity: 1 }}
          animate={{ y: window.innerHeight, opacity: 0 }}
          transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "linear" }}
          className="absolute w-0.5 h-4 bg-green-500/30"
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}
    </div>
  );
};

export const GlitchOverlay = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none mix-blend-hard-light animate-pulse">
      <div className="absolute inset-0 bg-red-500/10 translate-x-1" />
      <div className="absolute inset-0 bg-blue-500/10 -translate-x-1" />
      <div className="absolute top-1/2 w-full h-1 bg-white/50" />
    </div>
  );
};