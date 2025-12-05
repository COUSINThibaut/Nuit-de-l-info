import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, Server, Shield, Wind } from 'lucide-react';

interface SuccessScreenProps {
  onRestart: () => void;
}

export default function SuccessScreen({ onRestart }: SuccessScreenProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-emerald-950 text-center p-6 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/50 via-slate-950 to-slate-950 -z-10"></div>

        <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-40 h-40 rounded-full border-4 border-emerald-400/50 flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(52,211,153,0.3)] bg-emerald-900/30 backdrop-blur-xl"
        >
            <CheckCircle size={80} className="text-emerald-400" />
        </motion.div>

        <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-400 mb-6 tracking-tight"
        >
            SYSTÈME LIBÉRÉ
        </motion.h1>

        <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-emerald-200/70 max-w-2xl font-light mb-12"
        >
            Le lycée est désormais autonome. Les données sont sécurisées.<br/>
            L'obsolescence programmée a été vaincue.
        </motion.p>
        
        <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12"
        >
            {[
                { icon: Server, label: "Indépendance", value: "100%", color: "text-blue-400" },
                { icon: Wind, label: "Impact CO2", value: "-40%", color: "text-green-400" },
                { icon: Shield, label: "Privacy", value: "Max", color: "text-purple-400" },
            ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex flex-col items-center gap-2 hover:bg-white/10 transition-colors">
                    <stat.icon className={stat.color} size={32} />
                    <div className="text-sm text-slate-400 uppercase font-bold tracking-widest">{stat.label}</div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
            ))}
        </motion.div>

        <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onRestart}
            className="group flex items-center gap-3 px-8 py-4 bg-white text-emerald-950 font-bold rounded-full hover:scale-105 hover:bg-emerald-300 transition-all shadow-xl"
        >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Redémarrer le système</span>
        </motion.button>
    </div>
  );
}