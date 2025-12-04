import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Usb, Monitor, Cpu, CheckCircle, AlertTriangle, Terminal, Zap } from 'lucide-react';

// --- TYPES & CONFIG ---
type GameState = 'LOBBY' | 'BOOTING' | 'RUNNING' | 'SUCCESS' | 'GAMEOVER';

const GRAVITY = 0.8;
const JUMP_STRENGTH = -12;
const GAME_SPEED = 8;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  
  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);

  // Game State
  const [progress, setProgress] = useState(0); // 0 à 100%
  const [playerY, setPlayerY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<{id: number, x: number, type: 'bug' | 'wall'}[]>([]);
  const requestRef = useRef<number>();
  const scoreRef = useRef(0);

  // --- LOGIQUE DU JEU (SPEEDRUN) ---
  
  const jump = () => {
    if (!isJumping && gameState === 'RUNNING') {
      setVelocity(JUMP_STRENGTH);
      setIsJumping(true);
    }
  };

  const startGame = () => {
    setGameState('RUNNING');
    setProgress(0);
    setPlayerY(0);
    setObstacles([]);
    scoreRef.current = 0;
  };

  const gameLoop = () => {
    if (gameState !== 'RUNNING') return;

    // Physique du joueur
    setPlayerY((prev) => {
      let next = prev + velocity;
      if (next > 0) { // Sol touché
        next = 0;
        setIsJumping(false);
      }
      return next;
    });
    setVelocity((prev) => (playerY < 0 || prev < 0) ? prev + GRAVITY : 0);

    // Progression de l'installation (Speedrun)
    setProgress((prev) => {
      const next = prev + 0.15; // Vitesse de l'installation
      if (next >= 100) {
        setGameState('SUCCESS');
      }
      return next;
    });

    // Génération d'obstacles (Bugs, Bloatware)
    if (Math.random() < 0.02) {
      setObstacles(prev => [...prev, { 
        id: Date.now(), 
        x: 800, // Apparaît à droite
        type: Math.random() > 0.5 ? 'bug' : 'wall' 
      }]);
    }

    // Déplacement des obstacles
    setObstacles(prev => prev
      .map(obs => ({ ...obs, x: obs.x - GAME_SPEED }))
      .filter(obs => obs.x > -50)
    );

    // Collisions (Simple AABB)
    const playerRect = { x: 100, y: 250 + playerY, w: 40, h: 40 }; // Position fixe visuelle X=100
    
    // Vérification collision
    // (Simplifié pour l'exemple React, idéalement faire ça hors du render loop pur)
    obstacles.forEach(obs => {
      if (
        obs.x < 140 && obs.x > 60 && // Chevauchement X
        playerY > -40 // Le joueur n'est pas assez haut (simple check)
      ) {
         // Hit ! On recule l'installation
         setProgress(p => Math.max(0, p - 5));
         setObstacles(prev => prev.filter(o => o.id !== obs.id)); // Supprime l'obstacle touché
      }
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === 'RUNNING') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState, velocity, playerY, obstacles]); // Dépendances pour le hook (attention aux perfs réelles, ok pour démo)

  // --- RENDU ---

  return (
    <div 
      className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden select-none"
      onMouseDown={jump} // Clic n'importe où pour sauter
      onTouchStart={jump}
    >
      
      {/* 1. LOBBY : DRAG & DROP LA CLE USB */}
      {gameState === 'LOBBY' && (
        <div className="h-screen flex flex-col items-center justify-center relative" ref={constraintsRef}>
          <div className="absolute top-10 text-center animate-pulse">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Opération Sauvetage</h1>
            <p className="text-slate-400">Glissez la clé USB NIRD dans le PC pour lancer la libération</p>
          </div>

          {/* ZONE DE DROP (PC) */}
          <div className="relative group">
            <Monitor size={200} className="text-slate-700 transition-colors group-hover:text-slate-600" />
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
               {/* Zone de détection invisible ou visuelle */}
               <div className="w-24 h-24 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center opacity-50">
                  <span className="text-xs text-slate-500">PORT USB</span>
               </div>
            </div>
          </div>

          {/* CLÉ USB DRAGGABLE */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            whileHover={{ scale: 1.1, cursor: 'grab' }}
            whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              setIsDragging(false);
              // Détection simple : si on lâche près du centre (approximatif)
              // Dans une vraie app, utilisez les coordonnées des refs
              if (info.point.y < window.innerHeight / 2 + 100 && info.point.y > window.innerHeight / 2 - 100) {
                setGameState('BOOTING');
                setTimeout(startGame, 3000); // 3 sec de "BIOS"
              }
            }}
            className="mt-20 z-50"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.5)] flex flex-col items-center justify-center border-2 border-white/20">
                <Usb className="text-white mb-2" />
                <span className="text-[10px] font-bold text-white bg-black/20 px-1 rounded">NIRD OS</span>
              </div>
              <p className="mt-2 text-sm text-green-400 font-bold animate-bounce">Glisse-moi !</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. BOOT SEQUENCE (BIOS) */}
      {gameState === 'BOOTING' && (
        <div className="h-screen bg-black font-mono p-10 text-green-500 text-lg flex flex-col justify-end pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>NIRD BIOS v2025.12.04</p>
            <p>CPU: Old School Intel Core i3 @ 2.4GHz</p>
            <p>RAM: 4096 MB OK</p>
            <p className="mt-4 text-white">Detecting USB Device...</p>
            <p>Found: <span className="text-yellow-400">KEY_NIRD_LINUX_MINT_INSTALLER</span></p>
            <p className="mt-4">Booting kernel...</p>
            <p>[ OK ] Started udev Kernel Device Manager.</p>
            <p>[ OK ] Reclaiming memory from Windows Bloatware.</p>
            <p>[ OK ] Fighting planned obsolescence...</p>
            <p className="animate-pulse mt-8 text-xl">PRESSING ANY KEY TO START INSTALLATION...</p>
          </motion.div>
        </div>
      )}

      {/* 3. LE JEU (SPEEDRUN) */}
      {gameState === 'RUNNING' && (
        <div className="h-screen relative overflow-hidden bg-slate-800 flex flex-col items-center justify-center">
          
          <div className="absolute top-10 text-center z-10">
             <h2 className="text-2xl font-bold text-white">INSTALLATION EN COURS...</h2>
             <p className="text-slate-400 text-sm">Cliquez ou Appuyez pour sauter par-dessus les problèmes !</p>
          </div>

          {/* SCÈNE DE JEU */}
          <div className="relative w-full max-w-4xl h-[400px] bg-slate-900 rounded-xl border-4 border-slate-700 overflow-hidden shadow-2xl">
            
            {/* BACKGROUND DEFILANT */}
            <div className="absolute inset-0 opacity-20 flex flex-col justify-center">
                 <div className="text-[10rem] font-black text-white/5 whitespace-nowrap animate-marquee">
                    WINDOWS UPDATE • ERREUR 404 • LICENCE EXPIRÉE • VIRUS • 
                 </div>
            </div>

            {/* BARRE DE PROGRESSION (LE SOL) */}
            <div className="absolute bottom-0 left-0 h-16 bg-slate-800 w-full border-t border-slate-600 flex items-center px-4">
               <div className="w-full h-8 bg-slate-900 rounded-full overflow-hidden relative border border-slate-600">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-400 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
                  </motion.div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                    {Math.round(progress)}%
                  </span>
               </div>
            </div>

            {/* LE PERSONNAGE (TUX / NIRD) */}
            <motion.div
              className="absolute left-[100px] bottom-[64px] w-10 h-10 bg-green-500 rounded-lg shadow-lg flex items-center justify-center z-20"
              style={{ y: playerY }}
            >
               <Zap size={24} className="text-white" fill="currentColor" />
            </motion.div>

            {/* OBSTACLES */}
            {obstacles.map(obs => (
              <div 
                key={obs.id}
                className="absolute bottom-[64px] w-10 h-10 flex items-center justify-center rounded bg-red-500/20 border border-red-500"
                style={{ left: obs.x }}
              >
                <AlertTriangle size={24} className="text-red-500" />
              </div>
            ))}

          </div>
        </div>
      )}

      {/* 4. SUCCESS (LE VILLAGE) */}
      {gameState === 'SUCCESS' && (
        <div className="h-screen bg-emerald-900 flex flex-col items-center justify-center text-center p-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-400/50"
          >
            <CheckCircle size={64} className="text-white" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">INSTALLATION TERMINÉE</h1>
          <p className="text-xl text-emerald-200 max-w-2xl mb-8">
            Bienvenue dans le Village Numérique Résistant. <br/>
            Votre ordinateur est désormais libre, rapide et sécurisé.
          </p>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl w-full">
            <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700">
              <div className="text-3xl font-bold text-white">0€</div>
              <div className="text-emerald-300 text-sm">Coût Licence</div>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700">
              <div className="text-3xl font-bold text-white">+5 Ans</div>
              <div className="text-emerald-300 text-sm">Durée de vie</div>
            </div>
             <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-emerald-300 text-sm">Données Privées</div>
            </div>
          </div>

          <button 
            onClick={() => setGameState('LOBBY')}
            className="mt-12 px-8 py-3 bg-white text-emerald-900 font-bold rounded-full hover:scale-105 transition-transform"
          >
            Recommencer le Speedrun
          </button>
        </div>
      )}

    </div>
  );
}