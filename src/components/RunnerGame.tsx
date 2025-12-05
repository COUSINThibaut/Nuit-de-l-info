import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareWarning, ShieldAlert, Skull } from 'lucide-react';
import { audio } from '../utils/audio';
import type { GameStats } from '../types';

interface RunnerGameProps {
  onGameOver: () => void;
  onSuccess: () => void;
  triggerGlitch: () => void;
  stats?: GameStats;
}

interface Popup {
  id: number;
  x: number;
  y: number;
  type: 'ad' | 'update' | 'tracker' | 'error';
  text: string;
}

const DEFAULT_STATS = { budget: 50, eco: 50, indep: 50 };

const POPUP_TEXTS = {
  ad: ["Achetez WinRar !", "Offre Spéciale Cloud", "Abonnement Expiré"],
  update: ["Mise à jour forcée...", "Redémarrage dans 5s", "Configuration de Windows..."],
  tracker: ["Envoi des données...", "Analyse de vos fichiers", "Sync Telemetry"],
  error: ["System32 error", "Dll missing", "Out of Memory"]
};

const BOSS_BATTLE_QUOTES = [
  "Je sais où vous habitez !",
  "Vos données m'appartiennent !",
  "Regardez cette belle publicité !",
  "Linux n'a pas de jeux !",
  "L'écran bleu est votre ami...",
  "Arrêtez de cliquer ! Ça chatouille !"
];

export default function RunnerGame({ 
  onGameOver, 
  onSuccess, 
  triggerGlitch, 
  stats = DEFAULT_STATS 
}: RunnerGameProps) {
  
  const safeStats = stats || DEFAULT_STATS;

  // --- ÉTATS DU JEU ---
  const [popups, setPopups] = useState<Popup[]>([]);
  const [ramUsage, setRamUsage] = useState(15);
  const [installProgress, setInstallProgress] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // --- ÉTATS DU BOSS ---
  const [bossActive, setBossActive] = useState(false);
  const [bossIntro, setBossIntro] = useState(false);
  const [bossDying, setBossDying] = useState(false);
  const [bossHealth, setBossHealth] = useState(15);
  const [bossPos, setBossPos] = useState({ x: 50, y: 50 });
  const [bossQuote, setBossQuote] = useState("");
  const [bossName, setBossName] = useState("ASSISTANT_V2.exe");

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastSpawnTime = useRef(0);
  const lastBossMoveTime = useRef(0);
  
  // NOUVEAU : Référence pour le Delta Time (Correction FPS)
  const lastTimeRef = useRef<number>(0);

  // Difficulté
  const spawnRateModifier = safeStats.indep > 70 ? 800 : (safeStats.indep < 30 ? -200 : 200);
  const ramPenaltyModifier = safeStats.eco > 70 ? 0.005 : (safeStats.eco < 30 ? 0.03 : 0.01);

  const getRandomPosition = () => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return {
      x: Math.random() * (width - 240),
      y: Math.random() * (height - 160)
    };
  };

  const spawnPopup = useCallback((forceType?: 'ad' | 'update' | 'tracker' | 'error') => {
    const types: ('ad' | 'update' | 'tracker' | 'error')[] = ['ad', 'update', 'tracker', 'error'];
    const type = forceType || types[Math.floor(Math.random() * types.length)];
    const text = POPUP_TEXTS[type][Math.floor(Math.random() * POPUP_TEXTS[type].length)];
    const { x, y } = getRandomPosition();

    const newPopup: Popup = {
      id: Date.now() + Math.random(),
      x, y, type, text
    };

    setPopups(prev => [...prev, newPopup]);
    audio.playBlip(150, 'sawtooth');
  }, []);

  const closePopup = (id: number) => {
    if (bossIntro || bossDying) return;

    setPopups(prev => prev.filter(p => p.id !== id));
    setRamUsage(prev => Math.max(10, prev - 15)); 
    audio.playBlip(800, 'square');
  };

  const hitBoss = () => {
    if (!bossActive || bossIntro || bossDying) return;
    
    const newHealth = bossHealth - 1;
    setBossHealth(newHealth);
    triggerGlitch();
    audio.playBlip(200, 'sawtooth');

    spawnPopup('error');
    setBossQuote(BOSS_BATTLE_QUOTES[Math.floor(Math.random() * BOSS_BATTLE_QUOTES.length)]);

    const { x, y } = getRandomPosition();
    setBossPos({ x, y });

    if (newHealth <= 0) {
        setBossDying(true);
        setBossQuote("CRITICAL_PROCESS_DIED");
        
        audio.playError();
        
        setTimeout(() => {
            if(navigator.vibrate) navigator.vibrate([200, 100, 500]);
            audio.playSuccess();
            
            setTimeout(() => {
                setBossActive(false);
                setBossDying(false);
                setIsGameOver(true);
                onSuccess();
            }, 500);
        }, 2000);
    }
  };

  const gameLoop = useCallback((time: number) => {
    if (isGameOver) return;

    // Pause pendant les cinématiques, mais on garde le temps à jour pour éviter les sauts
    if (bossIntro || bossDying) {
        lastSpawnTime.current = time;
        lastTimeRef.current = 0; 
        return;
    }

    // --- CORRECTION DELTA TIME ---
    if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    // Temps écoulé en secondes
    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Protection contre les gros lags (ex: changement d'onglet)
    if (deltaTime > 0.1) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    // Facteur de temps normalisé sur 60 FPS
    // Si 60 FPS -> factor = 1. Si 144 FPS -> factor ~ 0.41
    const timeFactor = deltaTime * 60;

    // 1. PROGRESSION (Corrigée avec timeFactor)
    setInstallProgress(prev => {
      if (bossActive) return 80;
      
      // DÉCLENCHEMENT BOSS (80%)
      if (prev >= 80 && prev < 81 && bossHealth > 0 && !bossActive) {
          setBossActive(true);
          setBossIntro(true);
          
          setBossQuote("...");
          setTimeout(() => setBossQuote("SYSTEM HALTED."), 500);
          setTimeout(() => setBossQuote("Je suis l'Esprit du Propriétaire."), 2000);
          setTimeout(() => setBossQuote("Je ne vous laisserai pas m'effacer !"), 4000);
          
          triggerGlitch();
          
          setTimeout(() => {
              setBossIntro(false);
              setBossQuote("DÉFENSE ACTIVE !");
              audio.playError();
          }, 5000);

          return 80;
      }

      // Vitesse ajustée : +0.12 par frame "théorique" de 60Hz
      const next = prev + (0.12 * timeFactor); 
      if (next >= 100) {
        setIsGameOver(true);
        onSuccess();
        return 100;
      }
      return next;
    });

    // 2. RAM (Corrigée avec timeFactor)
    setRamUsage(prev => {
      const bossPenalty = bossActive ? 0.02 : 0; 
      const popupPenalty = popups.length * ramPenaltyModifier; 
      const passive = 0.005; 
      
      // Calcul de l'augmentation totale ajustée par le Delta Time
      const totalIncrease = (bossPenalty + popupPenalty + passive) * timeFactor;
      
      const next = prev + totalIncrease;
      
      if (next >= 100) {
        setIsGameOver(true);
        triggerGlitch();
        onGameOver();
        return 100;
      }
      return next;
    });

    // 3. SPAWN (Basé sur le temps réel, pas besoin de correction majeure)
    if (!bossActive && !bossIntro && !bossDying) {
        let currentSpawnRate = (2500 + spawnRateModifier) - (installProgress * 15);
        if (time - lastSpawnTime.current > currentSpawnRate) {
          spawnPopup();
          lastSpawnTime.current = time;
        }
    }

    // 4. MOUVEMENT BOSS (Basé sur le temps réel)
    if (bossActive && !bossDying && time - lastBossMoveTime.current > 2500) {
        const { x, y } = getRandomPosition();
        setBossPos({ x, y });
        if (!bossIntro) setBossQuote(BOSS_BATTLE_QUOTES[Math.floor(Math.random() * BOSS_BATTLE_QUOTES.length)]);
        lastBossMoveTime.current = time;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [popups.length, installProgress, isGameOver, onSuccess, spawnPopup, triggerGlitch, ramPenaltyModifier, spawnRateModifier, bossActive, bossHealth, bossIntro, bossDying, onGameOver]);

  useEffect(() => {
    lastTimeRef.current = 0;
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  const isCritical = ramUsage > 80;

  return (
    <div className="h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center select-none font-sans text-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900 z-0 pointer-events-none" />
        
        {/* HUD */}
        <div className={`absolute top-0 w-full p-4 flex justify-between items-start z-50 pointer-events-none transition-opacity duration-500 ${bossIntro || bossDying ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`bg-slate-800/90 border p-4 rounded-xl shadow-lg w-64 backdrop-blur-md transition-colors ${bossActive ? 'border-red-500' : 'border-emerald-500/50'}`}>
                <div className="text-xs font-bold mb-1 flex justify-between text-emerald-400">
                    <span>{bossActive ? "INSTALLATION BLOQUÉE" : "INSTALLATION LINUX"}</span>
                    <span>{Math.round(installProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                        className={`h-full ${bossActive ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${installProgress}%` }} 
                    />
                </div>
            </div>

            <div className={`bg-slate-800/90 border p-4 rounded-xl shadow-lg w-64 backdrop-blur-md transition-colors ${isCritical ? 'border-red-500 animate-pulse bg-red-900/20' : 'border-blue-500/50'}`}>
                <div className={`text-xs font-bold mb-1 flex justify-between ${isCritical ? 'text-red-400' : 'text-blue-400'}`}>
                    <span>RAM (BLOATWARE)</span>
                    <span>{Math.round(ramUsage)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                        className={`h-full ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${ramUsage}%` }}
                    />
                </div>
            </div>
        </div>

        {/* --- OVERLAY CINÉMATIQUE BOSS --- */}
        <AnimatePresence>
            {bossIntro && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center pointer-events-none"
                >
                    <div className="text-red-500 font-black text-6xl md:text-8xl tracking-tighter animate-pulse mb-8 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                        {bossName}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- EXPLOSION FINALE (FLASH BLANC) --- */}
        <AnimatePresence>
            {bossDying && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.2, 0.4, 0.2, 0.6, 1] }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white z-[100] flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                         initial={{ scale: 0, opacity: 1 }}
                         animate={{ scale: 20, opacity: 0 }}
                         transition={{ duration: 0.5, delay: 1.8 }}
                         className="w-full h-full rounded-full bg-white border-4 border-blue-500"
                    />
                </motion.div>
            )}
        </AnimatePresence>

        {/* BOSS ENTITY */}
        <AnimatePresence>
            {bossActive && (
                <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ 
                        left: (bossIntro || bossDying) ? '50%' : `${bossPos.x}px`, 
                        top: (bossIntro || bossDying) ? '50%' : `${bossPos.y}px`, 
                        x: (bossIntro || bossDying) ? '-50%' : '0%', 
                        y: (bossIntro || bossDying) ? '-50%' : '0%',
                        
                        scale: bossDying ? [1, 1.2, 0.8, 1.5, 0] : (bossIntro ? 2 : (1 + (15 - bossHealth) * 0.05)),
                        rotate: bossDying ? [0, -10, 10, -20, 20, 360] : 0,
                        filter: bossDying ? "invert(1) hue-rotate(90deg)" : "none",
                        
                        zIndex: 50
                    }}
                    transition={{ 
                        type: bossDying ? "tween" : "spring", 
                        duration: bossDying ? 2 : 0.5,
                        stiffness: 40 
                    }}
                    className="absolute cursor-crosshair"
                    onClick={hitBoss}
                >
                    {bossQuote && !bossDying && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            key={bossQuote}
                            className="absolute -top-32 left-1/2 -translate-x-1/2 bg-yellow-100 text-black text-lg font-bold px-6 py-4 rounded-2xl whitespace-nowrap border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.8)] z-[60]"
                        >
                            {bossQuote}
                            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-100 border-b-4 border-r-4 border-black rotate-45"></div>
                        </motion.div>
                    )}
                    
                    <div className={`w-32 h-32 bg-white rounded-full border-4 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.6)] flex items-center justify-center relative transition-transform ${!bossIntro && !bossDying && 'hover:scale-105 active:scale-95'}`}>
                        {bossDying && <Skull className="text-black w-20 h-20 animate-spin" />}
                        
                        {!bossDying && (
                            <div className="flex flex-col items-center">
                                <div className="flex gap-4 mb-2">
                                    <div className={`w-6 h-6 rounded-full ${bossIntro ? 'bg-red-600 animate-pulse' : 'bg-black animate-bounce delay-100'}`}></div>
                                    <div className={`w-6 h-6 rounded-full ${bossIntro ? 'bg-red-600 animate-pulse' : 'bg-black animate-bounce'}`}></div>
                                </div>
                                <div className={`bg-black rounded-full transition-all duration-300 ${bossIntro ? 'w-10 h-10 rounded-none' : 'w-12 h-2'}`}></div>
                            </div>
                        )}

                        {!bossIntro && !bossDying && (
                            <div className="absolute -bottom-6 w-40 h-4 bg-slate-900 rounded-full overflow-hidden border-2 border-white">
                                <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${(bossHealth / 15) * 100}%` }}></div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* POPUPS (Zone de jeu) */}
        <div ref={containerRef} className="relative w-full h-full max-w-6xl max-h-[85vh] z-10 pointer-events-none">
            <AnimatePresence>
                {popups.map((popup) => (
                    <motion.div
                        key={popup.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`absolute w-64 bg-[#d4d0c8] text-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] border-2 border-white border-r-gray-600 border-b-gray-600 overflow-hidden cursor-pointer pointer-events-auto active:scale-95 ${bossIntro ? 'opacity-20 blur-sm' : 'opacity-100'}`}
                        style={{ left: popup.x, top: popup.y, zIndex: 10 + Math.floor(popup.id % 100) }}
                        onClick={() => closePopup(popup.id)}
                    >
                        <div className={`h-6 px-1 flex items-center justify-between text-white text-[11px] font-bold ${
                            popup.type === 'error' ? 'bg-[#ff0000]' : 'bg-[#000080]'
                        } bg-gradient-to-r from-white/20 to-transparent`}>
                            <span className="flex items-center gap-1 truncate pl-1">
                                {popup.type === 'ad' ? <ShieldAlert size={12}/> : <MessageSquareWarning size={12}/>}
                                {popup.type.toUpperCase()}.EXE
                            </span>
                            <div className="w-4 h-4 bg-[#d4d0c8] border border-white border-b-black border-r-black flex items-center justify-center text-black hover:bg-red-500 hover:text-white pb-0.5">
                                <X size={10} strokeWidth={4} />
                            </div>
                        </div>
                        <div className="p-3 flex flex-col items-center justify-center gap-2 text-center h-20 bg-[#ece9d8]">
                            <p className="text-xs font-sans leading-tight font-medium">{popup.text}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
        
        {isCritical && !isGameOver && !bossIntro && !bossDying && (
             <div className="absolute bottom-10 text-red-500 font-bold text-2xl animate-bounce tracking-widest bg-black/80 px-6 py-2 rounded-full border border-red-500 z-50">
                 ⚠ WARNING: MEMORY CRITICAL
             </div>
        )}
    </div>
  );
}