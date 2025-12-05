import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Keyboard, MousePointer2 } from 'lucide-react';

interface TutorialModalProps {
  title: string;
  content: string[];
  onClose: () => void;
  type?: 'info' | 'warning';
}

export default function TutorialModal({ title, content, onClose, type = 'info' }: TutorialModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`max-w-xl w-full border-2 ${type === 'warning' ? 'border-red-500 bg-red-950/80' : 'border-emerald-500 bg-slate-900/90'} rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden`}
      >
        {/* Header */}
        <div className={`px-6 py-3 border-b ${type === 'warning' ? 'border-red-500 bg-red-900/20' : 'border-emerald-500 bg-emerald-900/20'} flex items-center gap-3`}>
          <Terminal size={20} className={type === 'warning' ? 'text-red-400' : 'text-emerald-400'} />
          <h2 className={`font-mono font-bold text-lg tracking-wider ${type === 'warning' ? 'text-red-100' : 'text-emerald-100'}`}>
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 font-mono text-white">
          {content.map((text, index) => (
            <motion.div 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 items-start"
            >
              <span className={type === 'warning' ? 'text-red-500' : 'text-emerald-500'}>{'>'}</span>
              <p className="leading-relaxed text-sm md:text-base">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer / Action */}
        <div className="p-6 pt-0 flex justify-end">
          <button 
            onClick={onClose}
            className={`group flex items-center gap-2 px-6 py-3 rounded font-bold uppercase tracking-widest transition-all
              ${type === 'warning' 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]'
              }`}
          >
            {type === 'warning' ? 'COMBATTRE' : 'COMPRIS'}
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}