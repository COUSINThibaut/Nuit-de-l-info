import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { scenarios } from '../data';
import { audio } from '../utils/audio';
import type { GameStats } from '../types';
interface BiosScreenProps {
  onComplete: (stats: GameStats) => void;
}

export default function BiosScreen({ onComplete }: BiosScreenProps) {
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'left' | 'right'>('left');
  
  const [stats, setStats] = useState<GameStats>({ budget: 100, eco: 50, indep: 50 });

  useEffect(() => {
    audio.playBlip(2000, 'sine');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedOption('left');
        audio.playBlip(400, 'triangle');
      }
      if (e.key === 'ArrowRight') {
        setSelectedOption('right');
        audio.playBlip(400, 'triangle');
      }
      if (e.key === 'Enter') {
        confirmChoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, selectedOption]);

  const confirmChoice = () => {
    const currentScenario = scenarios[step];
    const choice = currentScenario.choices[selectedOption];
    
    const newStats = {
        budget: stats.budget + choice.impact.budget,
        eco: stats.eco + choice.impact.eco,
        indep: stats.indep + choice.impact.indep
    };
    setStats(newStats);
    audio.playSuccess();

    if (step < scenarios.length - 1) {
        setStep(prev => prev + 1);
        setSelectedOption('left');
    } else {
        onComplete(newStats);
    }
  };

  const currentScenario = scenarios[step];

  return (
    <div className="h-screen w-full bg-[#0000AA] text-white font-mono flex flex-col items-center justify-center p-8 border-[20px] border-[#000088] relative overflow-hidden">
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
        
        {/* Header BIOS */}
        <div className="w-full max-w-4xl border-b-2 border-white mb-8 pb-2 flex justify-between">
            <span>NIRD BIOS SETUP UTILITY</span>
            <span>(C) 2025 NuitInfo</span>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl flex-1 flex flex-col items-center text-center">
            
            <div className="mb-12">
                <h2 className="text-yellow-400 text-xl mb-4 uppercase tracking-widest border-2 border-yellow-400 inline-block px-4 py-1 bg-[#000088]">
                    CONFIGURATION REQUISE : ÉTAPE {step + 1}/{scenarios.length}
                </h2>
                <h1 className="text-3xl font-bold mb-6">{currentScenario.title}</h1>
                <p className="text-lg max-w-2xl mx-auto leading-relaxed bg-[#000088] p-4 shadow-lg">
                    {currentScenario.description}
                </p>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-8 w-full">
                {/* Option Gauche */}
                <motion.div 
                    animate={{ 
                        scale: selectedOption === 'left' ? 1.05 : 1,
                        backgroundColor: selectedOption === 'left' ? '#FFFFFF' : '#000088',
                        color: selectedOption === 'left' ? '#0000AA' : '#FFFFFF'
                    }}
                    className="border-4 border-white p-6 cursor-pointer flex flex-col justify-between h-48"
                    onClick={() => { setSelectedOption('left'); audio.playBlip(400, 'triangle'); confirmChoice(); }}
                >
                    <div className="text-xl font-bold mb-2">A] {currentScenario.choices.left.text}</div>
                    <div className="text-xs opacity-80 mt-2">{currentScenario.choices.left.feedback}</div>
                </motion.div>

                {/* Option Droite */}
                <motion.div 
                    animate={{ 
                        scale: selectedOption === 'right' ? 1.05 : 1,
                        backgroundColor: selectedOption === 'right' ? '#FFFFFF' : '#000088',
                        color: selectedOption === 'right' ? '#0000AA' : '#FFFFFF'
                    }}
                    className="border-4 border-white p-6 cursor-pointer flex flex-col justify-between h-48"
                    onClick={() => { setSelectedOption('right'); audio.playBlip(400, 'triangle'); confirmChoice(); }}
                >
                    <div className="text-xl font-bold mb-2">B] {currentScenario.choices.right.text}</div>
                    <div className="text-xs opacity-80 mt-2">{currentScenario.choices.right.feedback}</div>
                </motion.div>
            </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-4xl border-t-2 border-white mt-8 pt-2 flex justify-between text-sm">
            <span>[←/→] SÉLECTIONNER</span>
            <span className="animate-pulse">[ENTRÉE] VALIDER</span>
            <span>F10: SAVE & EXIT</span>
        </div>

        {/* Stats Debug (Petit visuel en bas) */}
        <div className="absolute bottom-4 right-4 flex gap-4 text-xs opacity-50">
            <div>ECO: {stats.eco}</div>
            <div>INDEP: {stats.indep}</div>
        </div>
    </div>
  );
}