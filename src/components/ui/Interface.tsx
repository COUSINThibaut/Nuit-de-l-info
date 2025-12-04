import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Globe, ShieldCheck } from 'lucide-react';

export const Interface = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="relative z-10 h-full max-w-7xl mx-auto px-8 md:px-12 flex items-center pointer-events-none font-sans">
        
      <div className="w-full md:w-1/2 flex flex-col justify-center items-start pt-12">
          
          <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8 pointer-events-auto"
          >
              <div className="w-auto px-3 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20 text-white">
                  NUIT DE L'INFO 2025
              </div>
              <span className="font-bold tracking-widest text-xs text-slate-400 uppercase">David contre Goliath</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black mb-6 leading-[0.9] text-white">
              VILLAGE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                RÉSISTANT
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg border-l-4 border-emerald-500 pl-6 bg-slate-900/40 backdrop-blur-sm p-4 rounded-r-lg"
          >
              Face à la fin de Windows 10 et l'obsolescence imposée par les Big Tech, l'École organise la résistance. 
              Rejoignez la démarche <strong className="text-white">NIRD</strong> : Numérique Inclusif, Responsable et Durable.
          </motion.p>

          <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-col gap-6 pointer-events-auto"
          >
              <button
                  onClick={onEnter}
                  className="group flex items-center gap-4 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-105 transition-all w-fit"
              >
                  Rejoindre le Village
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex gap-8 mt-4">
                  <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <Cpu size={18} /> RÉEMPLOI
                      </div>
                      <span className="text-xs text-slate-500">Matériel sauvé</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                          <Globe size={18} /> LINUX
                      </div>
                      <span className="text-xs text-slate-500">Alternative Libre</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                          <ShieldCheck size={18} /> SOUVERAIN
                      </div>
                      <span className="text-xs text-slate-500">Données en UE</span>
                  </div>
              </div>
          </motion.div>
      </div>
    </div>
  );
};